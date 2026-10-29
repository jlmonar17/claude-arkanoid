const CANVAS_W = 800;
const CANVAS_H = 600;

const BLOCK_COLORS = ['red', 'cyan', 'green', 'magenta', 'yellow', 'hotpink', 'gray']; // de arriba abajo
const GRID = { rows: 7, cols: 10, blockW: 68, blockH: 24, gap: 4, offsetX: 42, offsetY: 60 };

const MAX_DT = 0.05;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  paddle: { x: (CANVAS_W - 120) / 2, y: 560, w: 120, h: 14, speed: 600 }, // x = borde izquierdo, speed en px/s
  blocks: [],
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

function update(dt) {
  updatePaddle(dt);
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  for (const b of state.blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.w, b.h);
  }
  const p = state.paddle;
  drawSprite(ctx, 'paddle', p.x, p.y, p.w, p.h);
}

// La X del ratón se pasa a coordenadas del canvas aunque CSS lo escale.
window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  state.input.mouseX = (e.clientX - rect.left) * (CANVAS_W / rect.width);
  state.input.lastSource = 'mouse';
});

const LEFT_KEYS = ['ArrowLeft', 'a', 'A'];
const RIGHT_KEYS = ['ArrowRight', 'd', 'D'];

window.addEventListener('keydown', (e) => {
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
  state.blocks = createBlocks();
  requestAnimationFrame((time) => {
    lastTime = time;
    requestAnimationFrame(loop);
  });
});
