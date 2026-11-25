// Every pixel of Sizzle & Serve: the kitchen, the order board, the grill, the
// counter bins, the plate, the timer and the screens. Flat diner colours and
// big type so the game reads at a glance even when the screenshot is shrunk.

import { COLOURS, INGREDIENTS, LAYOUT, VIEW, dishById, ingredientById } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

function rect(ctx, x, y, w, h, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, radius, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fill();
}

function text(ctx, value, x, y, size, colour, align = 'left', weight = 700) {
  ctx.fillStyle = colour;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function outline(ctx, x, y, w, h, colour, width = 3) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.strokeRect(x, y, w, h);
}

/** Draw one ingredient icon at (cx, cy) with the given radius. */
export function drawIngredient(ctx, id, cx, cy, radius) {
  const size = radius * 2;
  if (id === 'bun') {
    roundRect(ctx, cx - radius, cy - radius * 0.55, size, radius * 1.1, radius * 0.5, '#e8a94e');
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-0.45, -0.2], [0, -0.3], [0.45, -0.2], [-0.2, 0.05], [0.25, 0.08]]) {
      ctx.beginPath();
      ctx.arc(cx + dx * radius, cy + dy * radius, radius * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  if (id === 'patty') {
    roundRect(ctx, cx - radius, cy - radius * 0.45, size, radius * 0.9, radius * 0.4, '#8a5a33');
    ctx.fillStyle = '#6e4525';
    for (const [dx, dy] of [[-0.4, 0], [0, -0.12], [0.4, 0.05]]) {
      ctx.beginPath();
      ctx.arc(cx + dx * radius, cy + dy * radius, radius * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  if (id === 'lettuce') {
    ctx.fillStyle = '#58a34a';
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7cc46a';
    ctx.beginPath();
    ctx.ellipse(cx, cy - radius * 0.18, radius * 0.7, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (id === 'tomato') {
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f7d33';
    ctx.beginPath();
    ctx.arc(cx, cy - radius * 0.55, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (id === 'cheese') {
    ctx.fillStyle = '#ffc53d';
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy + radius * 0.6);
    ctx.lineTo(cx + radius, cy + radius * 0.6);
    ctx.lineTo(cx, cy - radius * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8a13a';
    for (const [dx, dy] of [[-0.3, 0.25], [0.2, 0.3], [0, -0.15]]) {
      ctx.beginPath();
      ctx.arc(cx + dx * radius, cy + dy * radius, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  // egg
  ctx.fillStyle = '#f6f1de';
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, radius * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffb02e';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function drawBurnt(ctx, cx, cy, radius) {
  ctx.fillStyle = 'rgba(58, 42, 28, 0.85)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, '✕', cx, cy + 1, radius, '#f7ead7', 'center', 900);
}

function patienceColour(fraction) {
  if (fraction > 0.5) return COLOURS.green;
  if (fraction > 0.25) return COLOURS.gold;
  return COLOURS.red;
}

function drawHeader(ctx, world) {
  const { header } = LAYOUT;
  rect(ctx, header.x, header.y, header.width, header.height, COLOURS.ink);
  text(ctx, '🍳 SIZZLE & SERVE', 28, 34, 30, COLOURS.gold);
  const minutes = Math.floor(world.timeLeft / 60);
  const seconds = Math.floor(world.timeLeft % 60).toString().padStart(2, '0');
  const low = world.timeLeft <= 30;
  text(ctx, `⏱ ${minutes}:${seconds}`, 560, 34, 30, low ? '#ff7a5c' : '#fffaf0', 'center');
  text(ctx, `SCORE ${world.score}`, 760, 34, 24, '#fffaf0', 'center');
  text(ctx, `💰 $${world.coins}`, 950, 34, 26, COLOURS.gold, 'center');
  const combo = world.combo >= 2 ? `🔥 x${world.combo}` : '—';
  text(ctx, combo, 1100, 34, 26, '#ff9a3d', 'center');
  // strikes as three small hearts at the right edge
  for (let i = 0; i < 3; i += 1) {
    const x = 1185 + i * 26;
    ctx.fillStyle = i < world.strikes ? '#ff5c5c' : 'rgba(255,250,240,0.3)';
    ctx.beginPath();
    ctx.arc(x - 5, 30, 6, 0, Math.PI * 2);
    ctx.arc(x + 5, 30, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 10, 32);
    ctx.lineTo(x + 10, 32);
    ctx.lineTo(x, 44);
    ctx.closePath();
    ctx.fill();
  }
  // timer bar under the header
  const fraction = world.timeLeft / 180;
  rect(ctx, 0, 64, VIEW.width, 6, 'rgba(255,250,240,0.15)');
  rect(ctx, 0, 64, VIEW.width * fraction, 6, low ? COLOURS.red : COLOURS.green);
}

function drawBoard(ctx, world) {
  const { board } = LAYOUT;
  roundRect(ctx, board.x, board.y, board.width, board.height, 14, COLOURS.paper);
  outline(ctx, board.x, board.y, board.width, board.height, COLOURS.woodDark, 3);
  text(ctx, 'ORDER BOARD', board.x + 16, board.y + 22, 18, COLOURS.woodDark);
  const slotWidth = 260;
  for (let i = 0; i < 4; i += 1) {
    const x = board.x + 150 + i * (slotWidth + 8);
    const y = board.y + 10;
    const order = world.orders[i];
    roundRect(ctx, x, y, slotWidth, 88, 10, order ? '#fff3d6' : 'rgba(43,33,24,0.06)');
    if (!order) {
      text(ctx, '— waiting —', x + slotWidth / 2, y + 44, 18, 'rgba(43,33,24,0.35)', 'center');
      continue;
    }
    const dish = dishById(order.dishId);
    text(ctx, `#${order.id} ${dish.name}`, x + 12, y + 20, 19, COLOURS.ink);
    text(ctx, `$${dish.price}`, x + slotWidth - 12, y + 20, 19, COLOURS.red, 'right');
    dish.needs.forEach((id, index) => {
      drawIngredient(ctx, id, x + 26 + index * 40, y + 56, 14);
    });
    const fraction = Math.max(0, order.patience / order.maxPatience);
    rect(ctx, x + 12, y + 78, slotWidth - 24, 6, 'rgba(43,33,24,0.15)');
    rect(ctx, x + 12, y + 78, (slotWidth - 24) * fraction, 6, patienceColour(fraction));
  }
}

function drawGrill(ctx, world) {
  const { grill } = LAYOUT;
  roundRect(ctx, grill.x, grill.y, grill.width, grill.height, 14, '#3a3f4a');
  outline(ctx, grill.x, grill.y, grill.width, grill.height, COLOURS.ink, 3);
  text(ctx, 'GRILL  (click a patty or egg)', grill.x + 16, grill.y + 24, 17, '#f7ead7');
  world.grill.forEach((slot, index) => {
    const cx = grill.x + 75 + index * 150;
    const cy = grill.y + 105;
    ctx.fillStyle = '#23262e';
    ctx.beginPath();
    ctx.arc(cx, cy, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5b6b7a';
    ctx.lineWidth = 3;
    ctx.stroke();
    if (!slot) {
      text(ctx, 'empty', cx, cy, 18, 'rgba(247,234,215,0.4)', 'center');
      return;
    }
    drawIngredient(ctx, slot.id, cx, cy, 40);
    if (slot.burnt) {
      drawBurnt(ctx, cx, cy, 40);
      text(ctx, 'BURNT', cx, cy + 72, 16, '#ff7a5c', 'center', 900);
    } else if (slot.done) {
      ctx.strokeStyle = COLOURS.gold;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.stroke();
      text(ctx, 'READY!', cx, cy + 72, 16, COLOURS.gold, 'center', 900);
    } else {
      ctx.strokeStyle = '#5b6b7a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * slot.progress);
      ctx.stroke();
      text(ctx, `${Math.ceil((1 - slot.progress) * ingredientById(slot.id).cookSeconds)}s`, cx, cy + 72, 16, '#f7ead7', 'center');
    }
  });
}

function drawCounter(ctx, world) {
  const { counter } = LAYOUT;
  roundRect(ctx, counter.x, counter.y, counter.width, counter.height, 14, COLOURS.wood);
  outline(ctx, counter.x, counter.y, counter.width, counter.height, COLOURS.woodDark, 3);
  text(ctx, 'INGREDIENTS — click to add  (keys 1–6)', counter.x + 16, counter.y + 24, 17, '#fffaf0');
  INGREDIENTS.forEach((ingredient, index) => {
    const bx = counter.x + 14 + index * 94;
    const by = counter.y + 44;
    roundRect(ctx, bx, by, 84, 118, 10, COLOURS.paper);
    outline(ctx, bx, by, 84, 118, COLOURS.woodDark, 2);
    drawIngredient(ctx, ingredient.id, bx + 42, by + 42, 28);
    text(ctx, ingredient.label, bx + 42, by + 86, 16, COLOURS.ink, 'center');
    if (ingredient.cooks) {
      text(ctx, 'GRILL', bx + 42, by + 106, 12, COLOURS.red, 'center', 900);
    } else {
      text(ctx, `${index + 1}`, bx + 42, by + 106, 13, 'rgba(43,33,24,0.5)', 'center');
    }
    text(ctx, `${index + 1}`, bx + 74, by + 14, 13, 'rgba(43,33,24,0.45)', 'center');
  });
}

function drawPlate(ctx, world) {
  const { plate } = LAYOUT;
  roundRect(ctx, plate.x, plate.y, plate.width, plate.height, 14, COLOURS.paper);
  outline(ctx, plate.x, plate.y, plate.width, plate.height, COLOURS.woodDark, 3);
  text(ctx, 'YOUR PLATE', plate.x + 16, plate.y + 24, 17, COLOURS.woodDark);
  // the plate itself
  ctx.fillStyle = '#e8e2d4';
  ctx.beginPath();
  ctx.ellipse(plate.x + 150, plate.y + 115, 118, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  ctx.ellipse(plate.x + 150, plate.y + 112, 100, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  if (world.plate.length === 0) {
    text(ctx, 'empty plate', plate.x + 150, plate.y + 112, 18, 'rgba(43,33,24,0.4)', 'center');
  } else {
    // stack the ingredients on the plate, bottom to top
    world.plate.forEach((id, index) => {
      const y = plate.y + 132 - index * 16;
      drawIngredient(ctx, id, plate.x + 150, y, 34);
    });
  }
  text(ctx, `${world.plate.length} / ${4} items`, plate.x + 150, plate.y + 172, 15, 'rgba(43,33,24,0.6)', 'center');
}

function drawServe(ctx, world) {
  const { serve } = LAYOUT;
  const ready = world.plate.length > 0;
  roundRect(ctx, serve.x, serve.y, 190, 96, 14, ready ? COLOURS.red : 'rgba(43,33,24,0.25)');
  text(ctx, '🔔 SERVE', serve.x + 95, serve.y + 40, 26, '#fffaf0', 'center', 900);
  text(ctx, 'Space', serve.x + 95, serve.y + 72, 15, 'rgba(255,250,240,0.8)', 'center');
  roundRect(ctx, serve.x + 202, serve.y, 98, 96, 14, COLOURS.steel);
  text(ctx, '🗑 TRASH', serve.x + 251, serve.y + 40, 18, '#fffaf0', 'center', 900);
  text(ctx, 'T', serve.x + 251, serve.y + 72, 15, 'rgba(255,250,240,0.8)', 'center');
}

function drawFooter(ctx, world) {
  const { footer } = LAYOUT;
  rect(ctx, footer.x, footer.y, footer.width, footer.height, 'rgba(43,33,24,0.08)');
  text(ctx, 'Build the dish on your plate, then ring SERVE. Match an order exactly to earn coins — serve 3 wrong and the shift ends!', 24, footer.y + 18, 17, COLOURS.ink);
  text(ctx, `Target $${100} in 3:00  •  Served ${world.served}  •  Best combo x${world.bestCombo}`, 24, footer.y + 42, 16, 'rgba(43,33,24,0.65)');
  if (world.flash && world.elapsed < world.flashUntil) {
    text(ctx, world.flash, VIEW.width / 2, 560, 26, COLOURS.red, 'center', 900);
  }
}

function drawKitchen(ctx, world) {
  rect(ctx, 0, 0, VIEW.width, VIEW.height, COLOURS.cream);
  // wall tiles
  ctx.fillStyle = COLOURS.creamDark;
  for (let x = 0; x < VIEW.width; x += 64) {
    ctx.fillRect(x, 70, 2, 570);
  }
  drawHeader(ctx, world);
  drawBoard(ctx, world);
  drawGrill(ctx, world);
  drawCounter(ctx, world);
  drawPlate(ctx, world);
  drawServe(ctx, world);
  drawFooter(ctx, world);
}

function drawTitle(ctx, world) {
  drawKitchen(ctx, world);
  ctx.fillStyle = 'rgba(43,33,24,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, '🍳', VIEW.width / 2, 150, 90, COLOURS.gold, 'center');
  text(ctx, 'SIZZLE & SERVE', VIEW.width / 2, 240, 72, '#fffaf0', 'center', 900);
  text(ctx, 'The food-truck kitchen rush — cook, build, serve!', VIEW.width / 2, 300, 26, COLOURS.gold, 'center');
  text(ctx, 'Orders land on the board. Click ingredients to build the dish on your plate.', VIEW.width / 2, 360, 22, '#fffaf0', 'center');
  text(ctx, 'Patties and eggs go on the grill first — grab them when they are READY, before they burn.', VIEW.width / 2, 392, 22, '#fffaf0', 'center');
  text(ctx, 'Ring SERVE when the plate matches an order. Earn $100 before the 3:00 timer ends!', VIEW.width / 2, 424, 22, '#fffaf0', 'center');
  roundRect(ctx, VIEW.width / 2 - 220, 470, 440, 72, 16, COLOURS.red);
  text(ctx, '▶  CLICK OR PRESS ENTER TO START', VIEW.width / 2, 507, 24, '#fffaf0', 'center', 900);
  text(ctx, 'Mouse + keys 1–6 · Space to serve · T to trash', VIEW.width / 2, 580, 18, 'rgba(255,250,240,0.75)', 'center');
}

function drawOver(ctx, world) {
  drawKitchen(ctx, world);
  ctx.fillStyle = 'rgba(43,33,24,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const won = world.won;
  text(ctx, won ? '🎉 SHIFT COMPLETE!' : '⏰ SHIFT OVER', VIEW.width / 2, 190, 64, won ? COLOURS.gold : '#ff7a5c', 'center', 900);
  text(ctx, won ? `You beat the $${100} target — the truck is famous tonight!` : 'The timer ran out (or the customers gave up). The truck lives to cook another day.', VIEW.width / 2, 260, 22, '#fffaf0', 'center');
  roundRect(ctx, VIEW.width / 2 - 260, 300, 520, 190, 16, COLOURS.paper);
  text(ctx, `SCORE  ${world.score}`, VIEW.width / 2, 340, 30, COLOURS.ink, 'center', 900);
  text(ctx, `💰 Earned $${world.coins}   •   Dishes served ${world.served}`, VIEW.width / 2, 388, 21, COLOURS.ink, 'center');
  text(ctx, `Best combo x${world.bestCombo}   •   Strikes ${world.strikes}   •   Wasted ${world.wasted}`, VIEW.width / 2, 424, 20, 'rgba(43,33,24,0.65)', 'center');
  roundRect(ctx, VIEW.width / 2 - 180, 520, 360, 64, 14, COLOURS.green);
  text(ctx, '↻  PLAY AGAIN  (click)', VIEW.width / 2, 553, 24, '#fffaf0', 'center', 900);
}

export function draw(ctx, world) {
  if (world.screen === SCREEN_TITLE) drawTitle(ctx, world);
  else if (world.screen === SCREEN_OVER) drawOver(ctx, world);
  else drawKitchen(ctx, world);
}

/** Clickable zones, in canvas coordinates, for the mouse handler. */
export function hitZones() {
  const { counter, grill, serve } = LAYOUT;
  const bins = INGREDIENTS.map((ingredient, index) => ({
    id: ingredient.id,
    x: counter.x + 14 + index * 94,
    y: counter.y + 44,
    width: 84,
    height: 118,
  }));
  const grillSlots = [0, 1].map((slot) => ({
    slot,
    x: grill.x + 75 + slot * 150 - 58,
    y: grill.y + 105 - 58,
    width: 116,
    height: 116,
  }));
  return {
    bins,
    grillSlots,
    serve: { x: serve.x, y: serve.y, width: 190, height: 96 },
    trash: { x: serve.x + 202, y: serve.y, width: 98, height: 96 },
  };
}

export function inside(point, zone) {
  return point.x >= zone.x && point.x <= zone.x + zone.width && point.y >= zone.y && point.y <= zone.y + zone.height;
}
