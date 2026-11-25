// The kitchen's rules: orders arrive, ingredients cook, plates are built and
// served. Pure state and stepping — no drawing and no DOM in here, so the
// screenshot scenes can play the real game forward deterministically.

import {
  DISHES,
  GRILL_SLOTS,
  INGREDIENTS,
  MAX_ORDERS,
  MAX_STRIKES,
  ORDER_GAP_END,
  ORDER_GAP_START,
  ORDER_PATIENCE,
  PLATE_SLOTS,
  SHIFT_SECONDS,
  TARGET_COINS,
  dishById,
  ingredientById,
} from './config.js';
import { makeRandom, pickFrom } from './random.js';

export const EVENT_SERVED = 1;
export const EVENT_WRONG = 2;
export const EVENT_OVER = 4;
export const EVENT_BURNT = 8;
export const EVENT_LEFT = 16;

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

const BURN_GRACE = 3;

export function freshWorld(seed) {
  return {
    seed,
    random: makeRandom(seed),
    screen: SCREEN_TITLE,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    strikes: 0,
    served: 0,
    wasted: 0,
    orders: [],
    grill: Array.from({ length: GRILL_SLOTS }, () => null),
    plate: [],
    flash: '',
    flashUntil: 0,
    orderTimer: 4,
    orderSeq: 0,
    elapsed: 0,
    won: false,
  };
}

function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = counts.get(item) ?? 0;
    if (left === 0) return false;
    counts.set(item, left - 1);
  }
  return true;
}

function orderGap(world) {
  const done = 1 - world.timeLeft / SHIFT_SECONDS;
  return ORDER_GAP_START + (ORDER_GAP_END - ORDER_GAP_START) * done;
}

function spawnOrder(world) {
  const dish = pickFrom(world.random, DISHES);
  world.orders.push({
    id: world.orderSeq + 1,
    dishId: dish.id,
    patience: ORDER_PATIENCE,
    maxPatience: ORDER_PATIENCE,
  });
  world.orderSeq += 1;
}

function say(world, text) {
  world.flash = text;
  world.flashUntil = world.elapsed + 1.6;
}

function finish(world) {
  world.screen = SCREEN_OVER;
  world.won = world.coins >= TARGET_COINS;
  return EVENT_OVER;
}

/** Apply one player action. Returns an event bitmask. */
export function applyAction(world, action) {
  if (!action) return 0;
  if (world.screen === SCREEN_TITLE) {
    if (action.type === 'start') {
      world.screen = SCREEN_PLAY;
      spawnOrder(world);
    }
    return 0;
  }
  if (world.screen === SCREEN_OVER) {
    if (action.type === 'restart') {
      const seed = world.seed;
      Object.assign(world, freshWorld(seed));
      world.screen = SCREEN_PLAY;
      spawnOrder(world);
    }
    return 0;
  }

  if (action.type === 'ingredient') {
    const ingredient = ingredientById(action.id);
    if (!ingredient) return 0;
    if (ingredient.cooks) {
      const free = world.grill.findIndex((slot) => slot === null);
      if (free === -1) {
        say(world, 'Grill is full!');
        return 0;
      }
      world.grill[free] = { id: ingredient.id, progress: 0, done: false, burnt: false, doneFor: 0 };
      return 0;
    }
    if (world.plate.length >= PLATE_SLOTS) {
      say(world, 'Plate is full!');
      return 0;
    }
    world.plate.push(ingredient.id);
    return 0;
  }

  if (action.type === 'grill') {
    const slot = world.grill[action.slot];
    if (!slot) return 0;
    if (slot.burnt) {
      world.grill[action.slot] = null;
      world.wasted += 1;
      say(world, 'Burnt! Tossed it.');
      return EVENT_BURNT;
    }
    if (!slot.done) return 0;
    if (world.plate.length >= PLATE_SLOTS) {
      say(world, 'Plate is full!');
      return 0;
    }
    world.plate.push(slot.id);
    world.grill[action.slot] = null;
    return 0;
  }

  if (action.type === 'trash') {
    if (world.plate.length === 0) return 0;
    world.plate = [];
    world.wasted += 1;
    say(world, 'Plate cleared.');
    return 0;
  }

  if (action.type === 'serve') {
    if (world.plate.length === 0) return 0;
    const match = world.orders.find((order) => sameMultiset(world.plate, dishById(order.dishId).needs));
    if (!match) {
      world.strikes += 1;
      world.combo = 0;
      world.plate = [];
      say(world, 'Wrong dish! The customer sent it back.');
      if (world.strikes >= MAX_STRIKES) return finish(world) | EVENT_WRONG;
      return EVENT_WRONG;
    }
    const dish = dishById(match.dishId);
    const bonus = world.combo >= 2 ? 2 : 0;
    world.coins += dish.price + bonus;
    world.score += dish.price * 10 + world.combo * 5;
    world.combo += 1;
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    world.served += 1;
    world.orders = world.orders.filter((order) => order !== match);
    world.plate = [];
    say(world, `Served ${dish.name}! +$${dish.price + bonus}`);
    return EVENT_SERVED;
  }

  return 0;
}

/** Advance the kitchen by dt seconds. Returns an event bitmask. */
export function stepWorld(world, dt) {
  if (world.screen !== SCREEN_PLAY) return 0;
  let events = 0;
  world.elapsed += dt;
  world.timeLeft -= dt;

  for (const slot of world.grill) {
    if (!slot || slot.done) {
      if (slot && slot.done) {
        slot.doneFor += dt;
        if (!slot.burnt && slot.doneFor > BURN_GRACE) {
          slot.burnt = true;
          say(world, 'Something burned on the grill!');
          events |= EVENT_BURNT;
        }
      }
      continue;
    }
    const ingredient = ingredientById(slot.id);
    slot.progress += dt / ingredient.cookSeconds;
    if (slot.progress >= 1) {
      slot.progress = 1;
      slot.done = true;
      slot.doneFor = 0;
    }
  }

  world.orderTimer -= dt;
  if (world.orderTimer <= 0 && world.orders.length < MAX_ORDERS) {
    spawnOrder(world);
    world.orderTimer = orderGap(world);
  }

  for (const order of [...world.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) {
      world.orders = world.orders.filter((item) => item !== order);
      world.combo = 0;
      say(world, 'A customer walked out...');
      events |= EVENT_LEFT;
    }
  }

  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    events |= finish(world);
  }
  return events;
}

export function startShift(world) {
  world.screen = SCREEN_PLAY;
  spawnOrder(world);
}

export { INGREDIENTS };
