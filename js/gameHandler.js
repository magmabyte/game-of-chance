
const possibleColors = [
    'yellowish',
    'blueish',
    'pinkish',
    'redish'
];

let isLucky = (luckyProbability) => Math.random() <= luckyProbability;

let activateCircle = function(circle) {
    let nextColorIndex = Math.floor(Math.random() * possibleColors.length);
    let nextColor = possibleColors[nextColorIndex];
    $(circle).addClass(nextColor);
}
let deactivateCircle = (circle) => possibleColors.forEach(color => $(circle).removeClass(color));

export class GameHandler {
    constructor(parent,
        {
            initialAliveProbability = .5,
            stayAliveProbabilities = [ 0, 0, 1, 1, 0, 0, 0, 0, 0 ],
            becomeAliveProbabilities = [ 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
            transitionMillis = 500,
            stepMillis = 100,
            showGrid = true
        }={}) {
        this.realParent = parent;
        this.initialAliveProbability = initialAliveProbability;
        this.stayAliveProbabilities = stayAliveProbabilities;
        this.becomeAliveProbabilities = becomeAliveProbabilities;
        this.transitionMillis = transitionMillis;
        this.stepMillis = stepMillis;
        this.showGrid = showGrid;

        this.initBoard();
    }

    changeStepMillis(stepMillis) {
        this.stepMillis = stepMillis;
        this.stopGame();
        this.runGame();
    }

    changeTransitionMillis(transitionMillis) {
        this.transitionMillis = transitionMillis;
        this.stopGame();
        this.runGame();
    }

    changeShowGrid(showGrid) {
        this.showGrid = showGrid;

        this.circles.forEach(circle => {
            $(circle).removeClass(this.showGrid ? 'circle-nogrid' : 'circle-grid');
            $(circle).addClass(this.showGrid ? 'circle-grid' : 'circle-nogrid');
        });
    }

    createBoardParent() {
        let parent = document.createElement('div');
        parent.className = 'circle-container';
        this.boardParent = $(parent);
        this.realParent.append(parent);
    }

    toggle(x, y) {
        let n = this.twoToOneDimension(x, y);
        if (!this.aliveState[n]) {
            activateCircle(this.circles[n]);
            this.aliveState[n] = true;
        }
        else {
            deactivateCircle(this.circles[n]);
            this.aliveState[n] = false;
        }
    }

    createInitialState() {
        const width = this.boardParent.width();
        const height = this.boardParent.height();

        this.maxCirclesWidth = Math.floor(width / 12);
        this.maxCirclesHeight = Math.floor(height / 12);

        this.aliveState = [];
        this.circles = [];

        for (let y = 0; y < this.maxCirclesHeight; y++) {
            for (let x = 0; x < this.maxCirclesWidth; x++) {
                let circle = document.createElement('div');
                let alive = Math.random() < this.initialAliveProbability;
                let transitionSeconds = this.transitionMillis / 1000;

                $(circle).css('transition-duration',`${transitionSeconds}s`);
                $(circle).addClass('circle');
                $(circle).addClass(this.showGrid ? 'circle-grid' : 'circle-nogrid');

                if (alive) activateCircle(circle);
                else deactivateCircle(circle);

                $(circle).click(() => {
                    this.toggle(x, y);
                });

                $(circle).hover(() => {
                    $(circle).css('transition-duration',`.1s`);
                    $(circle).addClass("circle-hover");
                    $(circle).prop('title', 
                        `x: ${x} y: ${y}\n` + 
                        `n: ${this.twoToOneDimension(x, y)}\n` +
                        `alive: ${this.aliveState[this.twoToOneDimension(x, y)]}\n` +
                        `Neighbors: ${this.numberOfNeighbors(x, y)}`);
                }, () => {
                    $(circle).removeClass("circle-hover");
                    setTimeout(() => $(circle).css('transition-duration',`${transitionSeconds}s`), 100);
                    $(circle).prop('title', '');
                });

                this.boardParent.append(circle);
                this.aliveState.push(alive);
                this.circles.push(circle);
            }
        }
    }

    runGame() {
        this.gameInterval = setInterval(() => this.runIteration(), this.stepMillis);
    }

    runIteration() {
        let newAliveState = [];

        for (let i = 0; i < this.maxCirclesWidth; i++) {
            for (let j = 0; j < this.maxCirclesHeight; j++) {
                let o = this.twoToOneDimension(i, j);;
                let wasAlive = this.aliveState[o];

                let aliveNeighbors = this.numberOfNeighbors(i, j);

                let isAlive = 
                    wasAlive ? isLucky(this.stayAliveProbabilities[aliveNeighbors])
                        : isLucky(this.becomeAliveProbabilities[aliveNeighbors]);

                newAliveState[o] = isAlive;

                if (!wasAlive && isAlive) 
                    activateCircle(this.circles[o]);
                else if (wasAlive && !isAlive)
                    deactivateCircle(this.circles[o]);
            }
        }

        this.aliveState = newAliveState;
    }

    twoToOneDimension(x, y) {
        return x + y * this.maxCirclesWidth;
    }

    numberOfNeighbors(x, y) {
        let aliveNeighbors = 0;
        for (let w = -1; w <= 1; w++) {
            for (let h = -1; h <= 1; h++) {
                if (w === 0 && h === 0)
                    continue;
                let ni = x + w;
                let nj = y + h;
                if (0 <= ni && ni < this.maxCirclesWidth &&
                        0 <= nj && nj < this.maxCirclesHeight) {
                    let n = this.twoToOneDimension(ni, nj);
                    aliveNeighbors += this.aliveState[n] ? 1 : 0;
                } 
            }
        }
        return aliveNeighbors;
    }

    stopGame() {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
    }

    isRunning() {
        return !!this.gameInterval;
    }

    removeBoard() {
        this.stopGame();
        this.boardParent.remove();
    }

    initBoard() {
        this.createBoardParent();
        this.createInitialState();
    }

    restartBoard() {
        this.resetBoard();
        this.initBoard();
        this.runGame();
    }
}