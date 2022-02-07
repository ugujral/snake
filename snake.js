const canvas = document.getElementById('canvas');

const ROWS = 30;
const COLS = 50;
const PIXEL = 10;
let pixels = new Map();

let currentSnake;
let currentSnakeKeys;
let currentVacantKeys;
let currentDirection;
let directionQueue;
let currentFoodKey;
let gameInterval = null;

function initializeCanvas() {
    // Creates 10x10 pixels(boxes) for game board
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const pixel = document.createElement('div');
            pixel.style.position = 'absolute';
            pixel.style.border = '1px solid #aaa';
            pixel.style.width = PIXEL + 'px';
            pixel.style.height = PIXEL + 'px';
            pixel.style.left = j * PIXEL + 'px';
            pixel.style.top = i * PIXEL + 'px';
            const position = toKey([i, j]);
            pixels.set(position, pixel);
            canvas.appendChild(pixel);
        }
    }
}

initializeCanvas();

function drawCanvas() {
    // Color pixel where snakes position is on grid
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const key = toKey([i, j]);
            const pixel = pixels.get(key);

            let background = 'white';
            if (key === currentFoodKey) {
                background = 'blue';
            } else if (currentSnakeKeys.has(key)) {
                background = 'black';
            }
            pixel.style.background = background;
        }
    }
}

function step() {
    const head = currentSnake[currentSnake.length - 1];

    // Handle multiple direction clicks
    let nextDirection = currentDirection;
    while (directionQueue.length > 0) {
        const candidateDirection = directionQueue.shift();
        if (!areOpposite(candidateDirection, currentDirection)) {
            nextDirection = candidateDirection;
            break;
        }
    }

    // Next snake position
    currentDirection = nextDirection;
    const nextHead = currentDirection(head);
    if (!checkValidHead(currentSnakeKeys, nextHead)) {
        stopGame(false);
        return;
    }
    currentSnake.push(nextHead);
    updateKeySets();
    if (toKey(nextHead) === currentFoodKey) {
        let nextFoodKey = spawnFood();
        if (nextFoodKey === null) {
            stopGame(true);
            return;
        }

        currentFoodKey = nextFoodKey;
    } else {
        currentSnake.shift();
    }

    updateKeySets();
    drawCanvas();
}

function updateKeySets() {
    currentSnakeKeys = new Set();
    currentVacantKeys = new Set();

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            currentVacantKeys.add(toKey([i, j]));
        }
    }

    for (let cell of currentSnake) {
        let key = toKey(cell);
        currentVacantKeys.delete(key);
        currentSnakeKeys.add(key);
    }
}

function spawnFood() {
    if (currentVacantKeys.size === 0) {
        return null;
    }

    let choice = Math.floor(Math.random() * currentVacantKeys.size);
    let i = 0;
    for (let key of currentVacantKeys) {
        if (i === choice) {
            return key;
        }
        i++;
    }
    throw Error('should never get here');
}

function areOpposite(dir1, dir2) {
    if (dir1 === moveLeft && dir2 === moveRight) {
        return true;
    }
    if (dir1 === moveRight && dir2 === moveLeft) {
        return true;
    }
    if (dir1 === moveUp && dir2 === moveDown) {
        return true;
    }
    if (dir1 === moveDown && dir2 === moveUp) {
        return true;
    }
    return false;
}

function checkValidHead(keys, cell) {
    let [top, left] = cell;
    if (top < 0 || left < 0) {
        return false;
    }
    if (top >= ROWS || left >= COLS) {
        return false;
    }

    if (keys.has(toKey(cell))) {
        return false;
    }

    return true;
}

const moveRight = ([t, l]) => [t, l + 1];
const moveLeft = ([t, l]) => [t, l - 1];
const moveUp = ([t, l]) => [t - 1, l];
const moveDown = ([t, l]) => [t + 1, l];

window.addEventListener('keydown', (e) => {
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
        return;
    }
    e.preventDefault();
    switch (e.key) {
        case 'ArrowLeft':
            directionQueue.push(moveLeft);
            break;
        case 'ArrowRight':
            directionQueue.push(moveRight);
            break;
        case 'ArrowUp':
            directionQueue.push(moveUp);
            break;
        case 'ArrowDown':
            directionQueue.push(moveDown);
            break;
        case 'R':
        case 'r':
            stopGame(false);
            startGame();
            break;
        case ' ':
            step();
            break;
    }
});

function stopGame(success) {
    canvas.style.borderColor = success ? 'green' : 'red';
    clearInterval(gameInterval);
}

function startGame() {
    directionQueue = [];
    currentSnake = makeInitialSnake();
    currentDirection = moveRight;
    currentSnakeKeys = new Set();
    currentVacantKeys = new Set();
    updateKeySets();
    currentFoodKey = spawnFood();

    canvas.style.borderColor = '';
    gameInterval = setInterval(step, 100);

    drawCanvas();
}

startGame();

function makeInitialSnake() {
    return [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
    ];
}

function toKey([top, left]) {
    return top + '_' + left;
}
