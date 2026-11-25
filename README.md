# best-cooking-game-20261125

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Tuapaaas/best-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Tuapaaas/best-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Sizzle & Serve — the food-truck kitchen rush. Orders land on the board, you grill patties and eggs, build each dish on your plate, and ring the bell to serve before the 3:00 timer ends. Earn $100 in a shift to win; three wrong serves end it early.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 and play with mouse and keyboard (keys 1–6 pick ingredients, Space serves, T trashes the plate).

## How it plays

- **Order board** — up to 4 tickets, each with a patience bar. Serve the exact dish before the customer walks out.
- **Grill** — patties (4s) and eggs (3s) cook here. Grab them when they flash READY, before they burn.
- **Ingredients** — bun, patty, lettuce, tomato, cheese, egg on the counter.
- **Plate** — build the dish here, then ring SERVE. A correct serve pays the dish price plus a combo bonus; a wrong one is a strike.

## Layout

- `main.ts` — hands the game in (copies `game/` and `screenshots/`, writes `dossier.json`)
- `game/` — the playable game as static files, no network, no build step
- `screenshots/` — real renders of the game in a browser
- `vendor/makefun-game.ts` — the make.fun dossier library, copied from the kit unchanged

---

<sub>Entered on [make.fun](https://make.fun/?ref=c1kkm475&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
