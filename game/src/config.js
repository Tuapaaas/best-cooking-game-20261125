// Sizzle & Serve — a fast food-truck kitchen game.
// Config: the menu, the ingredients, the timings and the look.
// Everything the other modules need lives here so the rules are easy to tune.

export const VIEW = { width: 1280, height: 720 };

export const SHIFT_SECONDS = 180;
export const TARGET_COINS = 100;
export const MAX_STRIKES = 3;
export const MAX_ORDERS = 4;
export const PLATE_SLOTS = 4;
export const GRILL_SLOTS = 2;

export const ORDER_GAP_START = 13;
export const ORDER_GAP_END = 8;
export const ORDER_PATIENCE = 48;

// A dish is a name, a price, and the exact multiset of ingredients it needs.
export const DISHES = [
  { id: 'burger', name: 'Sunny Burger', price: 8, needs: ['bun', 'patty', 'lettuce', 'tomato'] },
  { id: 'salad', name: 'Garden Salad', price: 6, needs: ['lettuce', 'tomato', 'cheese'] },
  { id: 'melt', name: 'Cheesy Melt', price: 9, needs: ['bun', 'cheese', 'patty'] },
  { id: 'sunrise', name: 'Sunrise Plate', price: 7, needs: ['egg', 'bun', 'cheese'] },
];

// Ingredients: label, colour, and whether it must be cooked before serving.
export const INGREDIENTS = [
  { id: 'bun', label: 'Bun', colour: '#e8a94e', cooks: false },
  { id: 'patty', label: 'Patty', colour: '#8a5a33', cooks: true, cookSeconds: 4 },
  { id: 'lettuce', label: 'Lettuce', colour: '#58a34a', cooks: false },
  { id: 'tomato', label: 'Tomato', colour: '#e4572e', cooks: false },
  { id: 'cheese', label: 'Cheese', colour: '#ffc53d', cooks: false },
  { id: 'egg', label: 'Egg', colour: '#f6f1de', cooks: true, cookSeconds: 3 },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

export function dishById(id) {
  return DISHES.find((dish) => dish.id === id);
}

// Layout of the kitchen, in canvas pixels.
export const LAYOUT = {
  header: { x: 0, y: 0, width: 1280, height: 64 },
  board: { x: 24, y: 80, width: 1232, height: 108 },
  grill: { x: 24, y: 212, width: 300, height: 190 },
  counter: { x: 348, y: 212, width: 584, height: 190 },
  plate: { x: 956, y: 212, width: 300, height: 190 },
  serve: { x: 956, y: 418, width: 300, height: 96 },
  footer: { x: 24, y: 640, width: 1232, height: 56 },
};

// Palette: warm diner colours, flat and readable at a glance.
export const COLOURS = {
  cream: '#f7ead7',
  creamDark: '#efe0c4',
  wood: '#b07d4f',
  woodDark: '#8a5f36',
  ink: '#2b2118',
  paper: '#fffaf0',
  red: '#e4572e',
  green: '#58a34a',
  gold: '#ffc53d',
  steel: '#5b6b7a',
  grillHot: '#c94f2e',
  burnt: '#3a2a1c',
};

export const STEP = 1 / 60;
