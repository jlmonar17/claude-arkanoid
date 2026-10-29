const CANVAS_W = 800;
const CANVAS_H = 600;

const BLOCK_COLORS = ['red', 'cyan', 'green', 'magenta', 'yellow', 'hotpink', 'gray']; // de arriba abajo
const GRID = { rows: 7, cols: 10, blockW: 68, blockH: 24, gap: 4, offsetX: 42, offsetY: 60 };

const MAX_DT = 0.05;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  blocks: [],
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

function update(dt) {
  // Se rellena en los pasos siguientes.
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  for (const b of state.blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.w, b.h);
  }
}

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
