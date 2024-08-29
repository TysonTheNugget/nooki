import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useWallet } from './useWallet';
import { useInscriptions } from './useInscriptions';
import spriteSheet from '../images/walkingfull.png';
import { initializeCharacter } from './DeployedOrdinooki';
import './NookiForest.css';

const NookiForest = () => {
    const canvasRef = useRef(null);
    const walletContainerRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
    const [isDeployed, setIsDeployed] = useState(false);  
    const { walletConnected, account, walletVisible, connectWallet, toggleWalletVisibility, copyAddressToClipboard } = useWallet();
    const { inscriptions, selectedNooki, handleSelectNooki } = useInscriptions(account);
    const deployedNookis = useSocket();

    const startDragging = (e) => {
        setDragging(true);
        setInitialPos({
            x: e.clientX - walletContainerRef.current.offsetLeft,
            y: e.clientY - walletContainerRef.current.offsetTop,
        });
    };

    const onDragging = useCallback((e) => {
        if (dragging) {
            walletContainerRef.current.style.left = `${e.clientX - initialPos.x}px`;
            walletContainerRef.current.style.top = `${e.clientY - initialPos.y}px`;
        }
    }, [dragging, initialPos]);

    const stopDragging = () => {
        setDragging(false);
    };

    useEffect(() => {
        document.addEventListener('mousemove', onDragging);
        document.addEventListener('mouseup', stopDragging);

        return () => {
            document.removeEventListener('mousemove', onDragging);
            document.removeEventListener('mouseup', stopDragging);
        };
    }, [onDragging]);

    const shortenAddress = (address) => {
        return `${address.slice(0, 6)}....${address.slice(-6)}`;
    };

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
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const characterController = initializeCharacter(canvas, spriteSheet);
            characterController.start(ctx);
        }
    }, [isDeployed]);

    return (
        <div className="container">
            {/* Wallet connection and visibility toggle */}
            {!walletConnected ? (
                <button className="wallet-button" onClick={connectWallet}>Connect UniSat Wallet</button>
            ) : (
                <button className="wallet-button" onClick={toggleWalletVisibility}>
                    {walletVisible ? 'Hide Wallet' : 'Show Wallet'}
                </button>
            )}

            {/* Game area */}
            <div className="nooki-forest">
                <canvas ref={canvasRef} className="canvas-container"></canvas> {/* Always show canvas, sprite renders on deploy */}
                {!isDeployed && <h1 className="header-text">Welcome to Nooki Forest</h1>} 
            </div>

            {/* Wallet visibility and controls */}
            {walletVisible && (
                <div
                    id="walletContainer"
                    ref={walletContainerRef}
                    className={`wallet-container ${walletVisible ? 'visible' : 'hidden'}`}
                >
                    <div
                        className="wallet-header draggable"
                        onMouseDown={startDragging}
                    >
                        <h2>Your Wallet</h2>
                        <button className="close-btn" onClick={toggleWalletVisibility}>×</button>
                    </div>
                    <div className="wallet-content">
                        <p>
                            Address: {shortenAddress(account)}{' '}
                            <button onClick={copyAddressToClipboard} className="copy-btn">
                                [Copy Full Address]
                            </button>
                        </p>
                        <div id="nookieImages">
                            {inscriptions.length === 0 ? (
                                <p>No valid Nookis found.</p>
                            ) : (
                                inscriptions.map(id => (
                                    <img
                                        key={id}
                                        src={`https://ordinals.com/content/${id}`}
                                        alt="Nooki"
                                        style={{ width: '50px', height: '50px', margin: '5px', cursor: 'pointer' }}
                                        onClick={() => handleSelectNooki(id)}
                                    />
                                ))
                            )}
                        </div>
                        {selectedNooki && (
                            <div>
                                <p>Selected Nooki ID: {selectedNooki}</p>
                                <button onClick={handleDeployNooki}>Deploy</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Render deployed Nookis */}
            {deployedNookis.map((nooki, index) => (
                <div key={index} style={{ position: 'absolute', top: nooki.position.y, left: nooki.position.x }}>
                    {/* Render the nooki sprite here */}
                </div>
            ))}
        </div>
    );
};

export default NookiForest;
