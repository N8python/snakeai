function drawPixel(x, y) {
    rect(x * 20 + screen.x, y * 20 + screen.y, 20, 20)
}

function drawApple() {
    fill(0, 255, 0);
    drawPixel(apple.x, apple.y)
}

function drawSnake() {
    fill(0, 0, 255);
    drawPixel(snake.head.x, snake.head.y);
    snake.body.forEach(({ x, y }) => {
        drawPixel(x, y);
    })
}

function setup() {
    createCanvas(1000, 700);
}
let tick = 0;
/*const net = NN({
    inputs: 20,
    hiddenLayers: [8, 8],
    outputs: 4
})*/
let moves = 120;
let dieNext = false;
let shared = 0;
let champ;

function draw() {
    if (tick === 0) {
        champ = gen();
    }
    background(255);
    textSize(30);
    fill(0);
    text(`Generation: ${generation}`, 20, 60);
    text(`Score: ${score}`, 20, 120);
    text(`Dir: ${Math.round(directionToApple())}`, 20, 180)
    text(`Highscore: ${highscore}`, 20, 240);
    text(`Gen Score: ${avgScore.toFixed(3)}`, 20, 300);
    text(`Gen Fitness: ${shared}`, 20, 360);
    stroke(0);
    fill(255)
    rect(screen.x, screen.y, 600, 600);
    drawApple();
    drawSnake();
    const results = champ.feedForward(prepareInputs());
    const max = Math.max(...results);
    const direction = results.findIndex(result => result === max);
    updateDirection(direction)
    moves -= 1;
    let oldScore = score;
    step();
    if (oldScore < score) {
        moves += 120;
    }
    if (score > highscore) {
        highscore = score;
    }
    if (dieNext) {
        dieNext = false;
        drawApple();
        drawSnake();
        champ = gen();
        generation += 1;
        moves = 120;
    }
    if (isSnakeDead() || moves < 1) {
        dieNext = true;
    }
    if (mouseIsPressed && tick % 5 === 0) {
        champ = gen();
        generation += 1;
        moves = 120;
    }
    tick += 1;
}

function keyPressed() {
    if (keyCode === 39) {
        snake.direction = RIGHT;
    }
    if (keyCode === 37) {
        snake.direction = LEFT;
    }
    if (keyCode === 38) {
        snake.direction = UP;
    }
    if (keyCode === 40) {
        snake.direction = DOWN;
    }
    if (keyCode === 32) {
        for (let i = 0; i < 10; i++) {
            champ = gen();
            generation += 1;
            moves = 120;
        }
    }
}
