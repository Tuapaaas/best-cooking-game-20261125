// Sizzle & Serve — the game loop. Owns the canvas, the clock, the input and
// the ?shot= scenes; the rules live in world.js and the pixels in render.js.

import { VIEW } from './config.js';
import { ACTION, keyToAction, pointerPosition } from './input.js';
import { draw, hitZones, inside } from './render.js';
import { stageShot } from './shots.js';
import { applyAction, freshWorld, stepWorld } from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') ?? '1') || 1;
const shot = params.get('shot');

let world = freshWorld(seed);
let lastTime = performance.now();

if (shot) {
  // A staged screenshot: play the real rules forward, then hold the frame.
  world = stageShot(shot, seed);
  draw(ctx, world);
  announce();
} else {
  requestAnimationFrame(frame);
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  stepWorld(world, dt);
  draw(ctx, world);
  announce();
  requestAnimationFrame(frame);
}

function announce() {
  if (!status) return;
  const screen = world.screen;
  status.textContent =
    screen === 'title'
      ? 'Sizzle and Serve. Press Enter to start your shift.'
      : screen === 'over'
        ? `Shift over. Score ${world.score}, earned $${world.coins}.`
        : `Time ${Math.ceil(world.timeLeft)} seconds. Score ${world.score}, $${world.coins}. ${world.orders.length} orders waiting.`;
}

function actionForPoint(point) {
  const zones = hitZones();
  if (world.screen === 'title') return ACTION.start();
  if (world.screen === 'over') return ACTION.restart();
  for (const bin of zones.bins) {
    if (inside(point, bin)) return ACTION.ingredient(bin.id);
  }
  for (const slot of zones.grillSlots) {
    if (inside(point, slot)) return ACTION.grill(slot.slot);
  }
  if (inside(point, zones.serve)) return ACTION.serve();
  if (inside(point, zones.trash)) return ACTION.trash();
  return null;
}

canvas.addEventListener('pointerdown', (event) => {
  const point = pointerPosition(event, canvas);
  const action = actionForPoint(point);
  if (action) applyAction(world, action);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && world.screen === 'title') {
    applyAction(world, ACTION.start());
    return;
  }
  if (event.key === 'Enter' && world.screen === 'over') {
    applyAction(world, ACTION.restart());
    return;
  }
  const action = keyToAction(event.key);
  if (action) {
    applyAction(world, action);
    event.preventDefault();
  }
});

// Keep the canvas at the game's own resolution.
function fitCanvas() {
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
}
fitCanvas();
if (shot) draw(ctx, world);
