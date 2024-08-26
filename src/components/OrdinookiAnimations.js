import { getUserProfile, updateUserProfile } from './userProfile';
import { addToDeployedCollection, removeFromUserCollection } from './ordinookiCollection';

export function deployOrdinooki(ordinookiId) {
    const userProfile = getUserProfile();
    
    const ordinooki = userProfile.ordinookis.find(o => o.id === ordinookiId);
    if (!ordinooki) {
        throw new Error('Ordinooki not found in user profile');
    }

    // Update user profile to reflect deployment
    removeFromUserCollection(userProfile, ordinookiId);
    addToDeployedCollection(userProfile, ordinooki);

    // Persist changes to the user profile
    updateUserProfile(userProfile);

    return {
        success: true,
        message: 'Ordinooki deployed successfully',
        ordinooki,
    };
}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sprite Animation</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background-color: #fff;
        }

        #gameCanvas {
            background-color: #f0f0f0;
            display: block;
            margin: 0 auto;
            image-rendering: pixelated; /* Ensure pixel art scaling */
            image-rendering: crisp-edges; /* Alternative property */
            image-rendering: -moz-crisp-edges; /* Firefox specific */
        }
    </style>
</head>
<body>

<canvas id="gameCanvas"></canvas>

<script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Disable image smoothing to preserve pixel art quality
    ctx.imageSmoothingEnabled = false;

    const character = {
        x: canvas.width / 2 - 16,
        y: canvas.height / 2 - 16,
        width: 32,
        height: 32,
        frameX: 0, // Starting with frame 1 (resting position)
        speed: 5,
        direction: 'down',
        facingRight: true, // Property to track the current facing direction
    };

    const spriteWidth = 32;
    const spriteHeight = 32;
    const scale = 4;  // Increase this value to make the sprite larger
    const scaledWidth = spriteWidth * scale;
    const scaledHeight = spriteHeight * scale;

    const spriteSheetWidth = 480; // Total width of the sprite sheet (15 panels of 32px each)

    // Frame sequences for different movements
    const frameSequence = {
        right: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],  // Panels 2 to 11
        left: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],   // Same as right, flip horizontally
        up: [11, 12],                            // Panels 12 to 13
        down: [13, 14]                           // Panels 14 to 15
    };

    // Create an off-screen buffer canvas for double buffering
    const bufferCanvas = document.createElement('canvas');
    const bufferCtx = bufferCanvas.getContext('2d');
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    // Disable image smoothing on buffer context as well
    bufferCtx.imageSmoothingEnabled = false;

    const keys = {};

    function drawSprite(img, frameX, canvasX, canvasY, flipH) {
        bufferCtx.save();

        if (flipH) {
            bufferCtx.scale(-1, 1);
            bufferCtx.drawImage(img, frameX * spriteWidth, 0, spriteWidth, spriteHeight, -canvasX - scaledWidth, canvasY, scaledWidth, scaledHeight);
        } else {
            bufferCtx.drawImage(img, frameX * spriteWidth, 0, spriteWidth, spriteHeight, canvasX, canvasY, scaledWidth, scaledHeight);
        }

        bufferCtx.restore();
    }

    function moveCharacter() {
        let moving = false;

        if (keys['ArrowLeft'] && keys['ArrowUp']) {
            character.x -= character.speed;
            character.y -= character.speed;
            character.direction = 'left';
            character.facingRight = false;
            moving = true;
        } else if (keys['ArrowLeft'] && keys['ArrowDown']) {
            character.x -= character.speed;
            character.y += character.speed;
            character.direction = 'left';
            character.facingRight = false;
            moving = true;
        } else if (keys['ArrowRight'] && keys['ArrowUp']) {
            character.x += character.speed;
            character.y -= character.speed;
            character.direction = 'right';
            character.facingRight = true;
            moving = true;
        } else if (keys['ArrowRight'] && keys['ArrowDown']) {
            character.x += character.speed;
            character.y += character.speed;
            character.direction = 'right';
            character.facingRight = true;
            moving = true;
        } else if (keys['ArrowLeft']) {
            character.x -= character.speed;
            character.direction = 'left';
            character.facingRight = false;
            moving = true;
        } else if (keys['ArrowRight']) {
            character.x += character.speed;
            character.direction = 'right';
            character.facingRight = true;
            moving = true;
        } else if (keys['ArrowUp']) {
            character.y -= character.speed;
            character.direction = 'up';
            moving = true;
        } else if (keys['ArrowDown']) {
            character.y += character.speed;
            character.direction = 'down';
            moving = true;
        }

        character.moving = moving;
    }

    function handleKeyPress(event) {
        keys[event.key] = true;
    }

    function handleKeyRelease(event) {
        keys[event.key] = false;
        // Ensure the character remains on the 1st frame when no keys are pressed
        if (!keys['ArrowLeft'] && !keys['ArrowRight'] && !keys['ArrowUp'] && !keys['ArrowDown']) {
            character.frameX = 0;
            character.moving = false;
        }
    }

    function animate() {
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        moveCharacter();

        const sequence = frameSequence[character.direction];
        const frameIndex = Math.floor(Date.now() / 100) % sequence.length;

        if (character.moving) {
            character.frameX = sequence[frameIndex];
        } else {
            // Ensure the character remains on the 1st frame when resting
            character.frameX = 0;
        }

        // Draw the sprite on the buffer canvas
        drawSprite(spriteSheet, character.frameX, character.x, character.y, !character.facingRight);

        // Copy the buffer to the main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bufferCanvas, 0, 0);

        requestAnimationFrame(animate);
    }

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyRelease);

    const spriteSheet = new Image();
    spriteSheet.src = 'walkingfull.png';
    spriteSheet.onload = function () {
        animate();
    };
</script>

</body>
</html>
