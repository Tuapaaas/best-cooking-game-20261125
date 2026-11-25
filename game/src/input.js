// Keyboard and mouse input for the kitchen.
// Clicks are reported as canvas coordinates; keys are reported as actions
// the world understands, so the game logic never touches the DOM itself.

export const ACTION = {
  ingredient: (id) => ({ type: 'ingredient', id }),
  grill: (slot) => ({ type: 'grill', slot }),
  serve: () => ({ type: 'serve' }),
  trash: () => ({ type: 'trash' }),
  start: () => ({ type: 'start' }),
  restart: () => ({ type: 'restart' }),
};

const KEY_INGREDIENTS = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'egg'];

/** Translate a key press into an action, or null when the key does nothing. */
export function keyToAction(key) {
  const lower = key.toLowerCase();
  if (lower >= '1' && lower <= '6') return ACTION.ingredient(KEY_INGREDIENTS[Number(lower) - 1]);
  if (lower === ' ' || lower === 'enter') return ACTION.serve();
  if (lower === 't' || lower === 'backspace' || lower === 'delete') return ACTION.trash();
  if (lower === 'g') return ACTION.grill(0);
  return null;
}

/** Canvas coordinates of a pointer event, accounting for the canvas's size on screen. */
export function pointerPosition(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}
