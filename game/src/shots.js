// The screenshot scenes behind ?shot=start|play|end. Each one plays the real
// rules forward from a fresh world for a fixed number of steps, steered by a
// simple autopilot, so every frame is what a short game really looks like and
// the same seed always gives the same frame.

import { STEP, dishById, ingredientById } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, applyAction, freshWorld, startShift, stepWorld } from './world.js';

const START_SECONDS = 6;
const PLAY_SECONDS = 38;
const END_SECONDS = 185;

/** What the plate still needs for the oldest order, in cook order. */
function missingFor(world) {
  const order = world.orders[0];
  if (!order) return [];
  const needs = [...dishById(order.dishId).needs];
  const plate = [...world.plate];
  for (const item of plate) {
    const index = needs.indexOf(item);
    if (index !== -1) needs.splice(index, 1);
  }
  const cookFirst = needs.filter((id) => ingredientById(id).cooks);
  const rest = needs.filter((id) => !ingredientById(id).cooks);
  return [...cookFirst, ...rest];
}

/**
 * One autopilot decision per step. A good pilot (skill 1) cooks what the oldest
 * order needs, picks cooked food off the grill, tops the plate up and serves.
 * A sloppy pilot (skill 0) dawdles, grabs the wrong bin and rarely serves,
 * so the shift ends in a mess — the end scene. A build-only pilot (skill 2)
 * does everything the good pilot does but never rings the bell, so the play
 * scene catches a finished plate waiting to be served while the next dish
 * is already on the grill.
 */
export function autopilot(world, skill) {
  // Collect anything finished on the grill first.
  for (let slot = 0; slot < world.grill.length; slot += 1) {
    const item = world.grill[slot];
    if (item && item.done && !item.burnt) return { type: 'grill', slot };
    if (item && item.burnt) return { type: 'grill', slot };
  }
  const missing = missingFor(world);
  if (missing.length === 0) {
    if (world.plate.length > 0) {
      if (skill === 2) {
        // Plate complete, bell not rung: start the next dish's cooking so the
        // frame shows a plate ready to serve and a grill already working.
        const nextOrder = world.orders[1];
        if (nextOrder) {
          const cookNext = dishById(nextOrder.dishId).needs.find((id) => ingredientById(id).cooks);
          if (cookNext && !world.grill.some((slot) => slot && slot.id === cookNext)) {
            return { type: 'ingredient', id: cookNext };
          }
        }
        return null;
      }
      return { type: 'serve' };
    }
    return null;
  }
  const next = missing[0];
  const ingredient = ingredientById(next);
  if (ingredient.cooks) {
    const cooking = world.grill.some((slot) => slot && slot.id === next && !slot.done);
    if (cooking) return null;
    const free = world.grill.some((slot) => slot === null);
    if (!free) return null;
    return { type: 'ingredient', id: next };
  }
  if (skill === 0 && world.elapsed % 7 < 2) return { type: 'ingredient', id: 'cheese' };
  return { type: 'ingredient', id: next };
}

/** Run the world forward for `seconds`, one autopilot action per step. */
function runFor(world, seconds, skill) {
  const steps = Math.round(seconds / STEP);
  for (let index = 0; index < steps; index += 1) {
    const action = autopilot(world, skill);
    if (action) applyAction(world, action);
    const events = stepWorld(world, STEP);
    if (events & 4) break;
  }
}

/** A play frame is ready when a plate waits to be served, the grill is busy and orders are open. */
function playFrameReady(world) {
  return (
    world.plate.length >= 3 &&
    world.grill.some((slot) => slot && !slot.done) &&
    world.orders.length >= 1
  );
}

/**
 * Set `world` to the named scene (start, play or end; any other name is start)
 * and return the screen to draw over it.
 */
export function stageShot(name, seed) {
  const world = freshWorld(seed);
  if (name !== 'play' && name !== 'end') {
    // Title screen over a kitchen that is already alive: a couple of orders
    // on the board and the bins full, so the cover shows the whole game.
    startShift(world);
    runFor(world, START_SECONDS, 1);
    world.screen = SCREEN_TITLE;
    return world;
  }
  startShift(world);
  if (name === 'play') {
    // Build-only pilot: stop the moment the frame shows a plate ready to
    // serve, a grill cooking and orders on the board — or at the cap.
    const steps = Math.round(PLAY_SECONDS / STEP);
    for (let index = 0; index < steps; index += 1) {
      const action = autopilot(world, 2);
      if (action) applyAction(world, action);
      stepWorld(world, STEP);
      if (playFrameReady(world)) break;
    }
    world.screen = SCREEN_PLAY;
    return world;
  }
  runFor(world, END_SECONDS, 0);
  if (world.screen !== SCREEN_OVER) {
    world.timeLeft = 0;
    world.screen = SCREEN_OVER;
    world.won = false;
  }
  return world;
}

export { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE };
