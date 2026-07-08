# Habit Tracker

A personal, offline-first habit tracker inspired by the "Daily · Weekly · Monthly · Lifetime"
dashboard. Built with **React + TypeScript + Vite**. All data is stored locally in your
browser (`localStorage`) — no account, no server, no sharing.

## Flows implemented (Habit module)

| Flow | Where |
| --- | --- |
| **Monthly grid** — habit rows × day columns, banded by week, click a cell to log/unlog | Habits → Monthly |
| **Log a habit** — tap a cell → it fills with the week color + a "✓ Logged!" toast | any view |
| **Month navigation** — ← / → across months | Habits → Monthly |
| **Daily progress chart** — smooth area chart of overall completion % | Habits / Stats |
| **Per-habit analysis** — ranked success-rate bars | Habits / Stats |
| **Daily view** — today's habits as a checklist with a completion ring + streaks | Habits → Daily |
| **Weekly view** — this week's 7 days per habit | Habits → Weekly |
| **Lifetime view** — all-time totals, current & best streaks | Habits → Lifetime |
| **Manage habits** — add / rename / recolor / reorder / delete (emoji + color) | ＋ Habits button |
| **Stats page** — combined overall ring + chart + analysis | Stats |
| **Settings** — export / import a JSON backup | Settings |

> The **Tasks** module (weekly board, per-day rings, mindset tracker) is stubbed and
> planned next.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Build for production:

```bash
npm run build    # type-checks then outputs to dist/
npm run preview
```

## Project layout

```
src/
  App.tsx              orchestration: pages, view modes, toggle + toast
  components/          Sidebar, MonthlyGrid, AltViews (daily/weekly/lifetime),
                       Analysis, AreaChart, Ring, HabitManager, Toast
  lib/                 types, date helpers, stats calculations, localStorage
```

## Data & privacy

Everything lives in `localStorage` under the key `habit-tracker.v1`. Use
**Settings → Export backup** to save a JSON copy, and **Import** to restore it on
another browser or device.
