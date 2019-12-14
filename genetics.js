let contenstants = Array(2000).fill(() => NN({
    inputs: 29,
    hiddenLayers: [16, 8],
    outputs: 4
})).map(x => x());

function reset() {
    snake = {
        head: { x: 15, y: 15 },
        body: [{ x: 14, y: 15 }, { x: 13, y: 15 }, { x: 12, y: 15 }],
        direction: RIGHT
    }
    placeApple();
    score = 0;
}

let highscore = 0;
let fitnessSum;
let lastChampion;

function chooseParent(parents) {
    let threshold = random(fitnessSum);
    let sum = 0;
    return parents.find(p => {
        sum += p.fitness;
        if (sum > threshold) {
            console.log(p.fitness);
            return true;
        }
    });
}

function gen() {
    const scores = [];
    fitnessSum = 0;
    shared = 0;
    let monotone = 1;
    contenstants.forEach(c => {
        reset();
        let movesLeft = 120;
        let cap = 120;
        let lifetime = 0;
        let oldDist = Math.hypot(snake.head.x - apple.x, snake.head.y - apple.y);
        while (movesLeft > 0) {
            lifetime += 1;
            let dist = Math.hypot(snake.head.x - apple.x, snake.head.y - apple.y);
            dist = oldDist;
            if (score > highscore) {
                highscore = score;
            }
            let oldScore = score;
            step();
            if (isSnakeDead()) {
                scores.push(score);
                break;
            }
            if (score > oldScore) {
                movesLeft += 120;
                cap += 120;
                if (movesLeft > 500) {
                    movesLeft = 500;
                }
                if (cap > 500) {
                    cap = 500;
                }
            }
            const results = c.feedForward(prepareInputs());
            const max = Math.max(...results);
            const direction = results.findIndex(result => result === max);
            updateDirection(direction)
            movesLeft -= 1;
        }
        c.fitness = floor(lifetime ** 2) * 2 ** score;
        if (score > 9) {
            c.fitness *= (score - 9);
        }
        if (c.fitness > shared) {
            shared = c.fitness;
        }
        fitnessSum += c.fitness;
    })
    reset();
    // contenstants = contenstants.sort((a, b) => a.fitness - b.fitness);
    let champion = contenstants.reduce((c, t) => {
        if (c.fitness > t.fitness) {
            return c;
        } else {
            return t;
        }
    }, contenstants[0]);
    if (champion === lastChampion) {
        monotone += 1;
    } else {
        monotone -= 1;
    }
    if (monotone < 1) {
        monotone = 1;
    }
    lastChampion = champion;
    let max = contenstants.length;
    // contenstants.splice(0, 10);
    const genFitness = scores.reduce((t, v) => t + v) / scores.length;
    avgScore = genFitness;
    const mutCo = 0.05;
    const old = contenstants;
    contenstants = contenstants.map(c => c === champion ? c : chooseParent(old).reproduceWith(chooseParent(old)).reproduce(mutCo))
    return champion;
}
