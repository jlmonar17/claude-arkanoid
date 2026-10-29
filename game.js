const CANVAS_W = 800;
const CANVAS_H = 600;

const MAX_DT = 0.05;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let lastTime = 0;

function update(dt) {
  // Se rellena en los pasos siguientes.
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
}

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, MAX_DT);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame((time) => {
  lastTime = time;
  requestAnimationFrame(loop);
});
