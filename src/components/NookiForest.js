// src/components/NookiForest.js
import React, { useRef, useState, useEffect } from 'react';
import Phaser from 'phaser';
import WalletManager from './WalletManager';
import { useSocket } from './useSocket';
import './NookiForest.css';

const NookiForest = () => {
    const gameContainerRef = useRef(null); // Reference for the Phaser game container
    const [isDeployed, setIsDeployed] = useState(false); // State for Nooki deployment
    const [selectedNooki, setSelectedNooki] = useState(null); // State for selected Nooki
    const [account, setAccount] = useState(null); // State for user account
    const deployedNookis = useSocket();
    const socketRef = useRef(null); // Reference for WebSocket
    const playerId = useRef(null); // Reference for player ID
    const players = useRef({}); // Reference for players object
    const cursors = useRef(null); // Reference for keyboard cursors
    const gameRef = useRef(null); // Reference for the Phaser game instance
    const smoothingFactor = 0.5;
    const stopAnimationDelay = 100;
    const maxDeltaTime = 50;
    const lastSentTime = useRef(0);

    const handleDeployNooki = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No token found. Please log in.');
            return;
        }

        if (selectedNooki) {
            const confirmDeploy = window.confirm("Are you sure you want to deploy this Ordinooki?");
            if (confirmDeploy) {
                try {
                    const response = await fetch('/api/deploy-nooki', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ 
                            inscriptionId: selectedNooki,
                            userId: account
                        })
                    });

                    if (response.ok) {
                        console.log('Ordinooki deployed successfully');
                        setIsDeployed(true);  
                    } else {
                        console.error('Failed to deploy Ordinooki', response.status);
                        const errorData = await response.json();
                        console.error('Error details:', errorData);
                    }
                } catch (error) {
                    console.error('Error deploying Ordinooki:', error);
                }
            }
        }
    };

    useEffect(() => {
        if (isDeployed) {
            const config = {
                type: Phaser.AUTO,
                width: 1500,
                height: 850,
                backgroundColor: '#ADD8E6',
                physics: {
                    default: 'arcade',
                    arcade: { debug: false }
                },
                scene: { preload, create, update },
                parent: gameContainerRef.current,
            };

            gameRef.current = new Phaser.Game(config);

            return () => {
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.close();
                }
                if (gameRef.current) gameRef.current.destroy(true);
            };
        }
    }, [isDeployed]);

    function preload() {
        this.load.spritesheet('character', '/assets/sprites/character.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('map', '../images/map.png');  // Replace with the correct path to your image
    }

    function create() {
        const scene = this;
        socketRef.current = new WebSocket('ws://localhost:8081');
        
        const map = this.add.image(0, 0, 'map').setOrigin(0).setDepth(0); 

        this.cameras.main.setBounds(0, 0, map.width, map.height);
        this.physics.world.setBounds(0, 0, map.width, map.height);

        socketRef.current.onopen = () => console.log('Connected to WebSocket server');

        socketRef.current.onmessage = (message) => {
            const data = JSON.parse(message.data);
            switch (data.type) {
                case 'init':
                    playerId.current = data.id;
                    players.current = {};

                    if (isDeployed) {
                        Object.keys(data.players).forEach((id) => {
                            if (id !== playerId.current) {
                                createPlayer(scene, id, data.players[id].x, data.players[id].y);
                            }
                        });
                        createPlayer(scene, playerId.current, 400, 300);
                        cursors.current = scene.input.keyboard.createCursorKeys();
                        scene.input.keyboard.on('keyup', handleKeyRelease, this);
                    }
                    break;
                case 'new-player':
                    if (isDeployed) {
                        createPlayer(scene, data.id, data.x, data.y);
                    }
                    break;
                case 'state':
                    if (isDeployed) {
                        Object.keys(data.players).forEach((id) => {
                            if (players.current[id]) {
                                interpolatePosition(players.current[id], data.players[id]);
                            } else {
                                createPlayer(scene, id, data.players[id].x, data.players[id].y);
                            }
                        });
                    }
                    break;
                case 'remove-player':
                    if (players.current[data.id]) {
                        players.current[data.id].sprite.destroy();
                        delete players.current[data.id];
                    }
                    break;
                default:
                    console.log(`Unhandled case: ${data.type}`);
                    break;
            }
        };

        createAnimations(scene);
    }

    function update(time) {
        if (!players.current[playerId.current] || !players.current[playerId.current].sprite) return;

        const player = players.current[playerId.current];
        player.sprite.setVelocity(0);
        const speed = 20;
        let moved = false;
        let direction = 'stand';
        let vx = 0, vy = 0;
        const deltaTime = Math.min(time - lastSentTime.current, maxDeltaTime);

        if (cursors.current.right.isDown && cursors.current.up.isDown) { vx = speed; vy = -speed; direction = 'right'; }
        else if (cursors.current.right.isDown && cursors.current.down.isDown) { vx = speed; vy = speed; direction = 'right'; }
        else if (cursors.current.left.isDown && cursors.current.up.isDown) { vx = -speed; vy = -speed; direction = 'left'; }
        else if (cursors.current.left.isDown && cursors.current.down.isDown) { vx = -speed; vy = speed; direction = 'left'; }
        else if (cursors.current.right.isDown) { vx = speed; direction = 'right'; }
        else if (cursors.current.left.isDown) { vx = -speed; direction = 'left'; }
        else if (cursors.current.up.isDown) { vy = -speed; direction = 'up'; }
        else if (cursors.current.down.isDown) { vy = speed; direction = 'down'; }

        if (direction !== 'stand') {
            player.sprite.x += vx * (deltaTime / 1000);
            player.sprite.y += vy * (deltaTime / 1000);
            setPlayerAnimation(player, direction);
            moved = true;
        } else {
            setTimeout(() => {
                if (!player.sprite.anims.isPlaying) setPlayerAnimation(player, 'stand');
            }, stopAnimationDelay);
        }

        if (moved && (time - lastSentTime.current > 50)) {
            sendPlayerPosition(player.sprite.x, player.sprite.y, direction, vx, vy);
            lastSentTime.current = time;
        }
    }

    function handleKeyRelease(event) {
        if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            sendPlayerPosition(players.current[playerId.current].sprite.x, players.current[playerId.current].sprite.y, 'stand', 0, 0);
        }
    }

    function sendPlayerPosition(x, y, direction, vx = 0, vy = 0) {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'move', id: playerId.current, x, y, direction, vx, vy }));
        }
    }

    function interpolatePosition(player, serverData) {
        if (!player || !player.sprite) return;
        player.sprite.x = Phaser.Math.Interpolation.Linear([player.sprite.x, serverData.x], smoothingFactor);
        player.sprite.y = Phaser.Math.Interpolation.Linear([player.sprite.y, serverData.y], smoothingFactor);
        handleAnimationWithDelay(player, serverData.direction);
    }

    function handleAnimationWithDelay(player, direction) {
        if (!player || !player.sprite) return;
        if (direction === 'stand') {
            setTimeout(() => setPlayerAnimation(player, 'stand'), stopAnimationDelay);
        } else {
            setPlayerAnimation(player, direction);
        }
    }

    function createAnimations(scene) {
        scene.anims.create({ key: 'stand', frames: [{ key: 'character', frame: 0 }], frameRate: 10 });
        scene.anims.create({ key: 'run-right', frames: scene.anims.generateFrameNumbers('character', { start: 1, end: 10 }), frameRate: 10, repeat: -1 });
        scene.anims.create({ key: 'run-left', frames: scene.anims.generateFrameNumbers('character', { start: 1, end: 10 }), frameRate: 10, repeat: -1 });
        scene.anims.create({ key: 'run-up', frames: scene.anims.generateFrameNumbers('character', { start: 11, end: 12 }), frameRate: 5, repeat: -1 });
        scene.anims.create({ key: 'run-down', frames: scene.anims.generateFrameNumbers('character', { start: 13, end: 14 }), frameRate: 5, repeat: -1 });
    }

    function createPlayer(scene, id, x, y) {
        players.current[id] = {
            sprite: scene.physics.add.sprite(x, y, 'character').setCollideWorldBounds(true).setScale(2),
            facing: 'right',
            lastDirection: 'stand'
        };
    }

    function setPlayerAnimation(player, direction) {
        if (!player || !player.sprite) return;
        let animationKey = '';
        let flipX = false;

        switch (direction) {
            case 'right': animationKey = 'run-right'; flipX = false; player.facing = 'right'; break;
            case 'left': animationKey = 'run-left'; flipX = true; player.facing = 'left'; break;
            case 'up': animationKey = 'run-up'; break;
            case 'down': animationKey = 'run-down'; break;
            default: animationKey = 'stand'; flipX = player.facing === 'left';
        }

        if (!player.sprite.anims.isPlaying || player.sprite.anims.currentAnim.key !== animationKey) {
            player.sprite.anims.play(animationKey, true);
            player.sprite.setFlipX(flipX);
        }
    }

    return (
        <div className="container">
            <WalletManager 
                onDeployNooki={handleDeployNooki} 
                setSelectedNooki={setSelectedNooki} 
                setAccount={setAccount} 
            />

            <div className="content">
                {deployedNookis.map((nooki, index) => (
                    <div key={index} style={{ position: 'absolute', top: nooki.position.y, left: nooki.position.x }}>
                        {/* Render the nooki sprite here */}
                    </div>
                ))}
            </div>

            <div className="nooki-forest-wrapper">
                <div className="nooki-forest">
                    <div ref={gameContainerRef} id="game-container" className="canvas-container"></div>
                    {!isDeployed && <h1 className="header-text">Welcome to Nooki Forest</h1>} 
                </div>
            </div>
        </div>
    );
};

export default NookiForest;
