export function initializeCharacter(canvas, spriteSheet) {
    const character = {
        x: canvas.width / 2 - 16,  // Centered position adjusted for 32x32 sprite
        y: canvas.height / 2 - 16,
        width: 32,  // Original sprite width
        height: 32,  // Original sprite height
        scale: 3,   // Scale factor to increase character size
        frameX: 0,
        speed: 6,
        direction: 'down',
        facingRight: true,
        moving: false,
    };

    const keys = {};
    const bufferCanvas = document.createElement('canvas');
    const bufferCtx = bufferCanvas.getContext('2d');

    // Resize buffer canvas based on the fixed size
    bufferCanvas.width = 1024;
    bufferCanvas.height = 1024;

    function updateCanvasSize() {
        canvas.width = 1024;
        canvas.height = 1024;
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;

        character.x = Math.min(canvas.width - character.width, Math.max(0, character.x));
        character.y = Math.min(canvas.height - character.height, Math.max(0, character.y));
    }

    updateCanvasSize(); // Initial size adjustment

    function drawSprite(img, frameX, canvasX, canvasY, flipH) {
        bufferCtx.save();
        bufferCtx.imageSmoothingEnabled = false; // Disable smoothing for pixel art HD look
        if (flipH) {
            bufferCtx.scale(-1, 1);
            bufferCtx.drawImage(
                img,
                frameX * character.width,
                0,
                character.width,
                character.height,
                -canvasX - character.width * character.scale,
                canvasY,
                character.width * character.scale,
                character.height * character.scale
            );
        } else {
            bufferCtx.drawImage(
                img,
                frameX * character.width,
                0,
                character.width,
                character.height,
                canvasX,
                canvasY,
                character.width * character.scale,
                character.height * character.scale
            );
        }
        bufferCtx.restore();
    }

    function moveCharacter() {
    let moving = false;

    // Ensure character doesn't move beyond the left boundary
    if (keys['ArrowLeft']) {
        character.x = Math.max(0, character.x - character.speed);
        character.direction = 'left';
        character.facingRight = false;
        moving = true;
    }

    // Ensure character doesn't move beyond the right boundary
    if (keys['ArrowRight']) {
        character.x = Math.min(bufferCanvas.width - character.width * character.scale, character.x + character.speed);
        character.direction = 'right';
        character.facingRight = true;
        moving = true;
    }

    // Ensure character doesn't move beyond the top boundary
    if (keys['ArrowUp']) {
        character.y = Math.max(0, character.y - character.speed);
        character.direction = 'up';
        moving = true;
    }

    // Ensure character doesn't move beyond the bottom boundary
    if (keys['ArrowDown']) {
        character.y = Math.min(bufferCanvas.height - character.height * character.scale, character.y + character.speed);
        character.direction = 'down';
        moving = true;
    }

    character.moving = moving;
}

    function animate(ctx, sprite) {
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        moveCharacter();

        const sequence = {
            right: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            left: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            up: [11, 12],
            down: [13, 14],
        }[character.direction];

        const frameIndex = Math.floor(Date.now() / 100) % sequence.length;

        if (character.moving) {
            character.frameX = sequence[frameIndex];
        } else {
            character.frameX = 0;
        }

        drawSprite(
            sprite,
            character.frameX,
            character.x,
            character.y,
            !character.facingRight
        );

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bufferCanvas, 0, 0);

        requestAnimationFrame(() => animate(ctx, sprite));
    }

    window.addEventListener('keydown', (event) => (keys[event.key] = true));
    window.addEventListener('keyup', (event) => (keys[event.key] = false));

    return {
        start: (ctx) => {
            const sprite = new Image();
            sprite.src = spriteSheet;
            sprite.onload = () => animate(ctx, sprite);
        },
    };
}
