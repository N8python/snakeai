let generation = 1;
let avgScore = 0;
let score = 0;
let screen = { x: 325, y: 34 };
let apple = { x: 10, y: 10 };
let freeze = 0;
const RIGHT = 0;
const LEFT = 1;
const UP = 2;
const DOWN = 3;
let snake = {
    head: { x: 9, y: 6 },
    body: [{ x: 8, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 6 }],
    direction: RIGHT
}

function updateDirection(direction) {
    if (!((snake.direction === RIGHT && direction === LEFT) || (snake.direction === LEFT && direction === RIGHT) || (snake.direction === UP && direction === DOWN) || (snake.direction === DOWN && direction === UP)) && Number.isInteger(direction) && direction >= 0 && direction <= 3) {
        snake.direction = direction;
    }
}

function boundedValue(bounded) {
    if (bounded < 3) {
        bounded = 10;
    }
    return 15 + (Math.random() * bounded - bounded / 2);
}

function placeApple() {
    let failsafe = 1000;
    do {
        const bounded = 30; //Math.ceil(Math.min(generation, 30))
        apple.x = Math.floor(Math.max(Math.min(boundedValue(bounded), 29), 0));
        apple.y = Math.floor(Math.max(Math.min(boundedValue(bounded), 29), 0));
        failsafe -= 1;
        if (failsafe < 1) {
            break;
        }
    } while (snake.body.some(({ x, y }) => x === apple.x && y === apple.y));
}

function isSnakeDead() {
    if (snake.head.x <= -1 && snake.direction === LEFT) {
        return true;
    }
    if (snake.head.x >= 30 && snake.direction === RIGHT) {
        return true;
    }
    if (snake.head.y <= -1 && snake.direction === UP) {
        return true;
    }
    if (snake.head.y >= 30 && snake.direction === DOWN) {
        return true;
    }
    return snake.body.some(({ x, y }) => {
        if (snake.head.x === x && snake.head.y === y) {
            return true;
        }
    })
}

function shiftSnake(dx, dy) {
    const oldHead = snake.head;
    snake.body.unshift(oldHead);
    snake.body.pop();
    snake.head = {
        x: oldHead.x + dx,
        y: oldHead.y + dy
    }
}

function moveSnake(direction) {
    if (direction === UP) {
        shiftSnake(0, -1)
    }
    if (direction === DOWN) {
        shiftSnake(0, 1)
    }
    if (direction === RIGHT) {
        shiftSnake(1, 0)
    }
    if (direction === LEFT) {
        shiftSnake(-1, 0)
    }
}

function growSnake() {
    const last = snake.body[snake.body.length - 1];
    const dir = calcTailDirection();
    if (dir === RIGHT) {
        snake.body.push({
            x: last.x - 1,
            y: last.y
        })
    }
    if (dir === LEFT) {
        snake.body.push({
            x: last.x + 1,
            y: last.y
        })
    }
    if (dir === UP) {
        snake.body.push({
            x: last.x,
            y: last.y + 1
        })
    }
    if (dir === DOWN) {
        snake.body.push({
            x: last.x,
            y: last.y - 1
        })
    }
    score += 1;
    placeApple();
}

function directionToApple() {
    const xDist = apple.x - snake.head.x;
    const yDist = apple.y - snake.head.y;
    let angle = Math.atan(yDist / Math.max(xDist, 0.1)) * (180 / Math.PI);
    angle = Math.abs(angle);
    if (xDist < 0 && yDist < 0) {
        angle = 180 - angle;
    }
    if (xDist < 0 && yDist > 0) {
        angle = 180 + angle;
    }
    if (xDist > 0 && yDist > 0) {
        angle = 360 - angle;
    }
    if (angle === 90 && yDist > 0) {
        angle = 270;
    }
    /*if (snake.direction === UP) {
        angle -= 90;
        if (angle <= 0) {
            angle = 360 + angle;
        }
    }
    if (snake.direction === LEFT) {
        angle -= 180;
        if (angle <= 0) {
            angle = 360 + angle;
        }
    }
    if (snake.direction === DOWN) {
        angle -= 270;
        if (angle <= 0) {
            angle = 360 + angle;
        }
    }*/
    if (snake.direction === RIGHT) {
        if (angle === 0 && xDist < 0) {
            angle = 180;
        }
    }
    /*
    if (snake.direction === LEFT) {
        if (angle === 180 && xDist < 0) {
            angle = 0;
        }
    }
    if (snake.direction === UP) {
        if (angle === 0 && yDist > 0) {
            angle = 180;
        }
    }
    if (snake.direction === DOWN) {
        if (angle === 90 && xDist < 0) {
            angle = 270;
        }
    }*/
    return angle % 360;
}

function distanceToWalls() {
    const UP_DIST = snake.head.y;
    const DOWN_DIST = 30 - snake.head.y;
    const LEFT_DIST = snake.head.x;
    const RIGHT_DIST = 30 - snake.head.x;
    const RIGHTUP_DIST = Math.hypot(UP_DIST, RIGHT_DIST);
    const LEFTUP_DIST = Math.hypot(UP_DIST, LEFT_DIST);
    const RIGHTDOWN_DIST = Math.hypot(DOWN_DIST, RIGHT_DIST);
    const LEFTDOWN_DIST = Math.hypot(DOWN_DIST, LEFT_DIST);
    if (snake.direction === RIGHT) {
        return [RIGHT_DIST, RIGHTUP_DIST, UP_DIST, LEFTUP_DIST, LEFT_DIST, LEFTDOWN_DIST, DOWN_DIST, RIGHTDOWN_DIST];
    }
    if (snake.direction === UP) {
        return [UP_DIST, LEFTUP_DIST, LEFT_DIST, LEFTDOWN_DIST, DOWN_DIST, RIGHTDOWN_DIST, RIGHT_DIST, RIGHTUP_DIST];
    }
    if (snake.direction === LEFT) {
        return [LEFT_DIST, LEFTDOWN_DIST, DOWN_DIST, RIGHTDOWN_DIST, RIGHT_DIST, RIGHTUP_DIST, UP_DIST, LEFTUP_DIST];
    }
    if (snake.direction === DOWN) {
        return [DOWN_DIST, RIGHTDOWN_DIST, RIGHT_DIST, RIGHTUP_DIST, UP_DIST, LEFTUP_DIST, LEFT_DIST, LEFTDOWN_DIST];
    }
}

function distanceAhead() {
    const UP_DIST = snake.head.y;
    const DOWN_DIST = 30 - snake.head.y;
    const LEFT_DIST = snake.head.x;
    const RIGHT_DIST = 30 - snake.head.x;
    if (snake.direction === RIGHT) {
        return RIGHT_DIST;
    }
    if (snake.direction === LEFT) {
        return LEFT_DIST;
    }
    if (snake.direction === UP) {
        return UP_DIST;
    }
    if (snake.direction === DOWN) {
        return DOWN_DIST;
    }
}

function distanceToSelf() {
    let block;
    block = snake.body.find(({ x, y }) => x === snake.head.x && y < snake.head.y);
    const UP_DIST = (block) ? snake.head.y - block.y : -1;
    block = snake.body.find(({ x, y }) => x === snake.head.x && y > snake.head.y);
    const DOWN_DIST = (block) ? block.y - snake.head.y : -1;
    block = snake.body.find(({ x, y }) => x < snake.head.x && y === snake.head.y);
    const LEFT_DIST = (block) ? snake.head.x - block.x : -1;
    block = snake.body.find(({ x, y }) => x > snake.head.x && y === snake.head.y);
    const RIGHT_DIST = (block) ? block.x - snake.head.x : -1;
    //if (snake.direction === RIGHT) {
    return [RIGHT_DIST, UP_DIST, LEFT_DIST, DOWN_DIST];
    //}
    /*
    if (snake.direction === UP) {
        return [UP_DIST, LEFT_DIST, DOWN_DIST, RIGHT_DIST];
    }
    if (snake.direction === LEFT) {
        return [LEFT_DIST, DOWN_DIST, RIGHT_DIST, UP_DIST];
    }
    if (snake.direction === DOWN) {
        return [DOWN_DIST, RIGHT_DIST, UP_DIST, LEFT_DIST];
    }*/
}

function calcTailDirection() {
    const last = snake.body[snake.body.length - 1]
    const pen = snake.body[snake.body.length - 2]
    if (pen.x > last.x) {
        return RIGHT;
    }
    if (pen.x < last.x) {
        return LEFT;
    }
    if (pen.y < last.y) {
        return UP;
    }
    if (pen.y > last.y) {
        return DOWN;
    }
}

function prepareInputs() {
    const inputs = [];
    inputs.push(...look(1, 0))
    inputs.push(...look(1, -1))
    inputs.push(...look(0, -1))
    inputs.push(...look(-1, -1))
    inputs.push(...look(-1, 0))
    inputs.push(...look(-1, 1))
    inputs.push(...look(0, 1))
    inputs.push(...look(1, 1))
    inputs.push(distanceToWalls()[0] < 2 ? 1 : 0)
    const direction = [0, 0, 0, 0];
    direction[snake.direction] = 1;
    inputs.push(...direction);
    const tailDir = [0, 0, 0, 0];
    tailDir[calcTailDirection()] = 1;
    inputs.push(...tailDir);

    //inputs.push(directionToApple() * Math.PI / 180)
    //let dirArray = [0, 0, 0, 0]
    //dirArray[snake.direction] = 1;
    //inputs.push(...dirArray);
    return inputs;
}

function look(xVel, yVel) {
    let x = snake.head.x;
    let y = snake.head.y;
    let distance = 1;
    let results = [0, 0, 0];
    while (!(x < 1 || x > 29 || y < 1 || y > 29)) {
        if (x === apple.x || y === apple.y && results[0] === 0) {
            results[0] = 1;
        }
        const bodyTile = snake.body.find(({ x: x1, y: y1 }) => x === x1 && y === y1);
        if (bodyTile && results[0] === 0) {
            results[1] = 1 / distance;
        }
        x += xVel;
        y += yVel;
        distance += 1;
    }
    results[2] = 1 / distance;
    return results;
}

function step() {
    moveSnake(snake.direction);
    if (snake.head.x === apple.x && snake.head.y === apple.y) {
        growSnake();
    }
}