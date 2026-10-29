const CANVAS_W = 800;
const CANVAS_H = 600;

const BLOCK_COLORS = ['red', 'cyan', 'green', 'magenta', 'yellow', 'hotpink', 'gray']; // de arriba abajo
const GRID = { rows: 7, cols: 10, blockW: 68, blockH: 24, gap: 4, offsetX: 42, offsetY: 60 };

const POINTS_PER_BLOCK = 10;
const INITIAL_LIVES = 3;

const EXPLOSION_FRAME_COUNT = 4; // longitud de cada EXPLOSION_FRAMES[color]

const MAX_DT = 0.05;
const MAX_BOUNCE_ANGLE = 60 * Math.PI / 180; // respecto a la vertical, en el borde de la pala

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  phase: 'ready', // 'ready' | 'playing' | 'won' | 'gameover'
  score: 0,
  lives: INITIAL_LIVES,
  paddle: { x: (CANVAS_W - 120) / 2, y: 560, w: 120, h: 14, speed: 600 }, // x = borde izquierdo, speed en px/s
  ball: { x: CANVAS_W / 2, y: 560 - 8, r: 8, vx: 0, vy: 0, speed: 360 }, // x,y = centro, velocidades en px/s
  blocks: [],
  explosions: [], // { x, y, w, h, color, elapsed } con elapsed en ms desde la rotura
  input: { lastSource: 'mouse', mouseX: CANVAS_W / 2, left: false, right: false },
};

let lastTime = 0;

function createBlocks() {
  const blocks = [];
  for (let row = 0; row < GRID.rows; row++) {
    for (let col = 0; col < GRID.cols; col++) {
      blocks.push({
        x: GRID.offsetX + col * (GRID.blockW + GRID.gap),
        y: GRID.offsetY + row * (GRID.blockH + GRID.gap),
        w: GRID.blockW,
        h: GRID.blockH,
        color: BLOCK_COLORS[row],
        alive: true,
      });
    }
  }
  return blocks;
}

function clampPaddle() {
  const p = state.paddle;
  p.x = Math.max(0, Math.min(CANVAS_W - p.w, p.x));
}

function updatePaddle(dt) {
  const p = state.paddle;
  const input = state.input;
  if (input.lastSource === 'mouse') {
    p.x = input.mouseX - p.w / 2;
  } else {
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    p.x += dir * p.speed * dt;
  }
  clampPaddle();
}

function stickBallToPaddle() {
  const p = state.paddle;
  const b = state.ball;
  b.x = p.x + p.w / 2;
  b.y = p.y - b.r;
  b.vx = 0;
  b.vy = 0;
}

function launchBall() {
  state.ball.vx = 0;
  state.ball.vy = -state.ball.speed;
  state.phase = 'playing';
}

function resetGame() {
  state.blocks = createBlocks();
  state.explosions = [];
  state.score = 0;
  state.lives = INITIAL_LIVES;
  state.phase = 'ready';
  stickBallToPaddle();
}

// Clic o barra espaciadora: lanza la bola, o reinicia desde las pantallas finales.
function handleAction() {
  if (state.phase === 'ready') launchBall();
  else if (state.phase === 'won' || state.phase === 'gameover') resetGame();
}

function updateBall(dt) {
  const b = state.ball;
  b.x += b.vx * dt;
  b.y += b.vy * dt;

  if (b.x - b.r < 0) {
    b.x = b.r;
    b.vx = Math.abs(b.vx);
  } else if (b.x + b.r > CANVAS_W) {
    b.x = CANVAS_W - b.r;
    b.vx = -Math.abs(b.vx);
  }
  if (b.y - b.r < 0) {
    b.y = b.r;
    b.vy = Math.abs(b.vy);
  }
}

function collideBallWithPaddle() {
  const b = state.ball;
  const p = state.paddle;
  if (b.vy <= 0) return;
  const overlaps =
    b.x + b.r >= p.x && b.x - b.r <= p.x + p.w &&
    b.y + b.r >= p.y && b.y - b.r <= p.y + p.h;
  if (!overlaps) return;

  // -1 en el borde izquierdo, +1 en el derecho. La rapidez se mantiene constante.
  const hit = Math.max(-1, Math.min(1, (b.x - (p.x + p.w / 2)) / (p.w / 2)));
  const angle = hit * MAX_BOUNCE_ANGLE;
  b.vx = b.speed * Math.sin(angle);
  b.vy = -b.speed * Math.cos(angle);
  b.y = p.y - b.r;
}

function collideBallWithBlocks() {
  const b = state.ball;
  for (const blk of state.blocks) {
    if (!blk.alive) continue;

    // Punto del bloque más cercano al centro de la bola.
    const cx = Math.max(blk.x, Math.min(b.x, blk.x + blk.w));
    const cy = Math.max(blk.y, Math.min(b.y, blk.y + blk.h));
    const dx = b.x - cx;
    const dy = b.y - cy;
    if (dx * dx + dy * dy > b.r * b.r) continue;

    blk.alive = false;
    state.explosions.push({ x: blk.x, y: blk.y, w: blk.w, h: blk.h, color: blk.color, elapsed: 0 });
    state.score += POINTS_PER_BLOCK;

    // El eje con menor penetración es el del impacto; se empuja la bola fuera y se invierte ese eje.
    const fromLeft = b.x + b.r - blk.x;
    const fromRight = blk.x + blk.w - (b.x - b.r);
    const fromTop = b.y + b.r - blk.y;
    const fromBottom = blk.y + blk.h - (b.y - b.r);
    const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);
    if (min === fromLeft) {
      b.x = blk.x - b.r;
      b.vx = -Math.abs(b.vx);
    } else if (min === fromRight) {
      b.x = blk.x + blk.w + b.r;
      b.vx = Math.abs(b.vx);
    } else if (min === fromTop) {
      b.y = blk.y - b.r;
      b.vy = -Math.abs(b.vy);
    } else {
      b.y = blk.y + blk.h + b.r;
      b.vy = Math.abs(b.vy);
    }
    return; // un bloque por fotograma evita invertir el mismo eje dos veces
  }
}

function loseLife() {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.phase = 'gameover';
  } else {
    state.phase = 'ready';
    stickBallToPaddle();
  }
}

function update(dt) {
  updatePaddle(dt);
  if (state.phase === 'ready') {
    stickBallToPaddle();
  } else if (state.phase === 'playing') {
    updateBall(dt);
    collideBallWithPaddle();
    collideBallWithBlocks();
    if (state.blocks.every((blk) => !blk.alive)) state.phase = 'won';
    else if (state.ball.y - state.ball.r > CANVAS_H) loseLife();
  }
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  for (const b of state.blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.w, b.h);
  }
  const p = state.paddle;
  drawSprite(ctx, 'paddle', p.x, p.y, p.w, p.h);
  const b = state.ball;
  drawSprite(ctx, 'ball', b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
  drawHud();
  if (state.phase === 'won') drawEndScreen('¡Victoria!');
  else if (state.phase === 'gameover') drawEndScreen('Game Over');
}

function drawEndScreen(title) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 50);
  ctx.font = '28px sans-serif';
  ctx.fillText('Puntaje final: ' + state.score, CANVAS_W / 2, CANVAS_H / 2 + 10);
  ctx.font = '20px sans-serif';
  ctx.fillText('Clic o barra espaciadora para reiniciar', CANVAS_W / 2, CANVAS_H / 2 + 60);
}

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Puntaje: ' + state.score, GRID.offsetX, 30);
  const size = 20, gap = 8;
  for (let i = 0; i < state.lives; i++) {
    const x = CANVAS_W - GRID.offsetX - size - i * (size + gap);
    drawSprite(ctx, 'ball', x, 30 - size / 2, size, size);
  }
}

canvas.addEventListener('mousedown', handleAction);

// La X del ratón se pasa a coordenadas del canvas aunque CSS lo escale.
window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  state.input.mouseX = (e.clientX - rect.left) * (CANVAS_W / rect.width);
  state.input.lastSource = 'mouse';
});

const LEFT_KEYS = ['ArrowLeft', 'a', 'A'];
const RIGHT_KEYS = ['ArrowRight', 'd', 'D'];

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    e.preventDefault();
    if (!e.repeat) handleAction();
    return;
  }
  if (LEFT_KEYS.includes(e.key)) {
    state.input.left = true;
  } else if (RIGHT_KEYS.includes(e.key)) {
    state.input.right = true;
  } else {
    return;
  }
  state.input.lastSource = 'keyboard';
  e.preventDefault();
});

window.addEventListener('keyup', (e) => {
  if (LEFT_KEYS.includes(e.key)) state.input.left = false;
  else if (RIGHT_KEYS.includes(e.key)) state.input.right = false;
});

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, MAX_DT);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// drawSprite no hace nada hasta que carga el atlas: el bucle arranca al cargarlo.
loadSpritesheet(() => {
  resetGame();
  requestAnimationFrame((time) => {
    lastTime = time;
    requestAnimationFrame(loop);
  });
});
