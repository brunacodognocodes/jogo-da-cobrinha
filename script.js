const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const recordElement = document.getElementById("record");
const message = document.getElementById("message");
const startButton = document.getElementById("start");

const cells = 20;
const size = canvas.width / cells;

let snake, food, direction, nextDirection;
let score = 0;
let record = Number(localStorage.getItem("snakeRecord")) || 0;
let timer = null;
let running = false;

recordElement.textContent = record;

function reset() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreElement.textContent = score;
  placeFood();
  draw();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * cells),
      y: Math.floor(Math.random() * cells)
    };
  } while (snake.some(part => part.x === food.x && part.y === food.y));
}

function draw() {
  ctx.fillStyle = "#0a1713";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#142b22";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= cells; i++) {
    ctx.beginPath();
    ctx.moveTo(i * size, 0);
    ctx.lineTo(i * size, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * size);
    ctx.lineTo(canvas.width, i * size);
    ctx.stroke();
  }

  ctx.fillStyle = "#ff5b6e";
  ctx.beginPath();
  ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size * 0.38, 0, Math.PI * 2);
  ctx.fill();

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#9bffba" : "#35d878";
    ctx.beginPath();
    ctx.roundRect(part.x * size + 1, part.y * size + 1, size - 2, size - 2, 5);
    ctx.fill();
  });

  const head = snake[0];
  ctx.fillStyle = "#10251b";
  const eyeX = head.x * size + size / 2;
  const eyeY = head.y * size + size / 2;

  ctx.beginPath();
  ctx.arc(eyeX + direction.x * 4 - direction.y * 4, eyeY + direction.y * 4 + direction.x * 4, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(eyeX + direction.x * 4 + direction.y * 4, eyeY + direction.y * 4 - direction.x * 4, 2, 0, Math.PI * 2);
  ctx.fill();
}

function startGame() {
  clearInterval(timer);
  reset();
  running = true;
  message.hidden = true;
  timer = setInterval(move, 120);
}

function move() {
  if (!running) return;
  direction = nextDirection;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const eating = head.x === food.x && head.y === food.y;
  const bodyToCheck = eating ? snake : snake.slice(0, -1);

  const hitWall = head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells;
  const hitSelf = bodyToCheck.some(part => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(head);
  if (eating) {
    score += 10;
    scoreElement.textContent = score;
    if (score > record) {
      record = score;
      recordElement.textContent = record;
      localStorage.setItem("snakeRecord", record);
    }
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function gameOver() {
  running = false;
  clearInterval(timer);
  message.innerHTML = `
    <h2>Fim de jogo! 🐍</h2>
    <p>Sua pontuação: <strong>${score}</strong></p>
    <button id="start">Jogar novamente</button>
  `;
  message.hidden = false;
  document.getElementById("start").addEventListener("click", startGame);
}

function changeDirection(dir) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const chosen = directions[dir];
  if (!chosen) return;
  if (chosen.x === -direction.x && chosen.y === -direction.y) return;
  nextDirection = chosen;
}

document.addEventListener("keydown", event => {
  const keys = {
    ArrowUp: "up", ArrowDown: "down",
    ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right"
  };
  const dir = keys[event.key];
  if (dir) {
    event.preventDefault();
    changeDirection(dir);
  }
  if (event.code === "Space" && !running) startGame();
});

document.querySelectorAll("[data-dir]").forEach(button => {
  button.addEventListener("click", () => changeDirection(button.dataset.dir));
});

startButton.addEventListener("click", startGame);
document.getElementById("restart").addEventListener("click", startGame);

reset();
