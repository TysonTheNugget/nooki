// DeployedOrdinooki.js

export function initializeCharacter(canvas, spriteSheet) {
    const character = {
        x: canvas.width / 2 - 16,
        y: canvas.height / 2 - 16,
        width: 32,
        height: 32,
        frameX: 0,
        speed: 5,
        direction: 'down',
        facingRight: true,
        moving: false,
    };

    const keys = {};
    const bufferCanvas = document.createElement('canvas');
    const bufferCtx = bufferCanvas.getContext('2d');

    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    function drawSprite(img, frameX, canvasX, canvasY, flipH) {
        bufferCtx.save();
        if (flipH) {
            bufferCtx.scale(-1, 1);
            bufferCtx.drawImage(
                img,
                frameX * character.width,
                0,
                character.width,
                character.height,
                -canvasX - 128,
                canvasY,
                128,
                128
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
                128,
                128
            );
        }
        bufferCtx.restore();
    }

    function moveCharacter() {
        let moving = false;

        if (keys['ArrowLeft']) {
            character.x -= character.speed;  // Fixed: No need for character.current.speed
            character.direction = 'left';
            character.facingRight = false;
            moving = true;
        }
        if (keys['ArrowRight']) {
            character.x += character.speed;  // Fixed: No need for character.current.speed
            character.direction = 'right';
            character.facingRight = true;
            moving = true;
        }
        if (keys['ArrowUp']) {
            character.y -= character.speed;  // Fixed: No need for character.current.speed
            character.direction = 'up';
            moving = true;
        }
        if (keys['ArrowDown']) {
            character.y += character.speed;  // Fixed: No need for character.current.speed
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
