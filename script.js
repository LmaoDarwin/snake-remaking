/** @type {HTMLCanvasElement} */
const cvs = document.getElementById('myCanvas');
/** @type {CanvasRenderingContext2D} */
const ctx = cvs.getContext('2d');
/** @type {HTMLButtonElement} */
const playBtn = document.getElementById('play');
/** @type {HTMLInputElement} */
const nameInput = document.getElementById('name');
/** @type {HTMLDivElement} */
const beforePlayDiv = document.querySelector('.before-play');
//fps init
const fps = 10;
//interval init
let animation;

cvs.height = 600;
cvs.width = 960;
playBtn.disabled = true;

class Game {
  blockSize = 20;
  constructor(height, width) {
    this.scene = '';
    this.width = width;
    this.height = height;
    this.gridWidth = width / this.blockSize;
    this.gridHeight = height / this.blockSize;
    this.snake = new Snake(this);
    this.apple = new Apple(this);
  }
  /**
   * Context for drawing objects
   * @param {CanvasRenderingContext2D} ctx
   */
  gameOver(ctx) {
    if (this.scene !== 'over') return;
    const text = 'GAME OVER';
    ctx.font = 'bold 30px Monospace';
    ctx.fillText(text, this.snake.x - 200, this.snake.y + 30);
    clearInterval(animation);
  }
  /**
   * Context for drawing objects
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    this.apple.drawApple(ctx);
    this.snake.draw(ctx);
    this.gameOver(ctx);
  }
  /** any parts of classes methods doesnt require ctx goes below */
  update() {
    this.snake.controller();
    this.snake.onOutOfBound();
    this.apple.onEaten();
    this.apple.randomPos();
    this.apple.popApple();
  }
}
class Snake {
  currTails = 5;
  tailsCoor = [];
  dirQueue = [];
  dir = 'Right';
  /** @param {Game} game */
  constructor(game) {
    this.game = game;
    this.x = (game.gridWidth / 2) * game.blockSize;
    this.y = (game.gridHeight / 2) * game.blockSize;
    window.addEventListener('keydown', ({ key }) => {
      if (this.dirQueue.includes(key.slice(5))) return; //if includes does nothing
      switch (key) {
        case 'ArrowUp':
          if (this.dir === 'Down') break;
          return this.dirQueue.push(key.slice(5));
        case 'ArrowDown':
          if (this.dir === 'Up') break;
          return this.dirQueue.push(key.slice(5));
        case 'ArrowLeft':
          if (this.dir === 'Right') break;
          return this.dirQueue.push(key.slice(5));
        case 'ArrowRight':
          if (this.dir === 'Left') break;
          return this.dirQueue.push(key.slice(5));
      }
    });
  }
  /** snake out of bound reset */
  onOutOfBound() {
    if (this.x >= this.game.width) this.x = 0; //right
    if (this.x < 0) this.x = this.game.width - this.game.blockSize; //left
    if (this.y < 0) this.y = this.game.height - this.game.blockSize; //up
    if (this.y >= this.game.height) this.y = 0; //bottom
  }
  /** to move snake according to direction */
  controller() {
    if (this.dirQueue.length > 0) this.dir = this.dirQueue.shift(); //check if queue is not empty
    if (this.dir === 'Right') this.x += this.game.blockSize;
    if (this.dir === 'Left') this.x -= this.game.blockSize;
    if (this.dir === 'Up') this.y -= this.game.blockSize;
    if (this.dir === 'Down') this.y += this.game.blockSize;
  }
  /**
   * Context for drawing objects
   * @param {CanvasRenderingContext2D} ctx
   */
  createTails(ctx) {
    this.tailsCoor.unshift({ x: this.x, y: this.y });
    this.tailsCoor.splice(this.currTails);
    this.tailsCoor.forEach(({ x, y }, i) => {
      if (i !== 0) x === this.x && y === this.y && (this.game.scene = 'over'); //on collide with tails
      ctx.fillStyle = 'olivedrab';
      if (i === 0) ctx.fillStyle = 'greenyellow';
      ctx.fillRect(x, y, this.game.blockSize, this.game.blockSize);
    });
  }
  /**
   * Context for drawing objects
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    this.createTails(ctx);
  }
}
class Apple {
  appleCoor = [];
  count = 0;
  x;
  y;
  /** @param {Game} game */
  constructor(game) {
    this.game = game;
    setInterval(() => this.count++, 1000);
  }
  popApple() {
    if (this.count >= 5) this.appleCoor.shift(), (this.count = 0);
  }
  randomPos() {
    if (this.game.scene !== 'game') return;
    if (this.appleCoor.length >= 5) return;
    this.x = ~~(Math.random() * this.game.gridWidth) * this.game.blockSize;
    this.y = ~~(Math.random() * this.game.gridHeight) * this.game.blockSize;
    this.appleCoor.forEach(({ x, y }) => {
      if (x === this.x && y === this.y) this.randomPos();
    }); //prevent spawning occupied space
    this.game.snake.tailsCoor.forEach(({ x, y }) => {
      if (x === this.x && y === this.y) this.randomPos();
    }); //prevent spawning on snake body
    //count is 2 due to offset
    if (this.count === 3) this.appleCoor.push({ x: this.x, y: this.y }), (this.count = 0);
  }
  onEaten() {
    this.appleCoor.forEach(({ x, y }, i) => {
      if (this.game.snake.x === x && this.game.snake.y === y)
        this.appleCoor.splice(i, 1), this.game.snake.currTails++;
    });
  }
  /**
   * Context for drawing objects
   * @param {CanvasRenderingContext2D} ctx
   */
  drawApple(ctx) {
    ctx.fillStyle = 'violet';
    if (this.appleCoor.length < 3) (this.count = 3), this.randomPos();
    this.appleCoor.forEach(({ x, y }) => ctx.fillRect(x, y, this.game.blockSize, this.game.blockSize));
  }
}
const myGame = new Game(cvs.height, cvs.width);

//loop
function animate() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  myGame.draw(ctx);
  myGame.update();
}

// --- EVENT HANDLER SECTION ---
//Input empty disable play
nameInput.addEventListener('input', ({ target }) => {
  if (target.value === '') return (playBtn.disabled = true);
  else playBtn.disabled = false;
});
//click play button
playBtn.addEventListener('click', () => {
  beforePlayDiv.style.display = 'none';
  cvs.style.display = 'initial';
  myGame.scene = 'game';
  //init apple
  for (let i = 0; i < 3; i++) {
    myGame.apple.count = 3;
    myGame.apple.randomPos();
  }
  animation = setInterval(animate, 1000 / fps);
});
