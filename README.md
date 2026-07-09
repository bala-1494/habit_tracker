# Habit Tracker

A personal habit tracker inspired by the "Daily · Weekly · Monthly · Lifetime"
dashboard. Built with **React + TypeScript + Vite** on the front end and a tiny
**Express + SQLite** backend so your data is saved on a server and **follows you
to any device**. It stays offline-friendly: `localStorage` is kept as an instant
cache, so the app keeps working with no network and syncs automatically when the
server is reachable again.

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

## Flows implemented (Task module)

| Flow | Where |
| --- | --- |
| **Weekly board** — Sun→Sat day columns, each a card of that day's tasks | Tasks |
| **Add / check / delete tasks** — inline "Add task…" input; checking strikes it through | any day card |
| **Per-day progress ring** — completion % + "Completed X/Y" footer per day | each card |
| **Week navigation** — ← / → across weeks | Tasks |
| **Overall weekly progress** — donut (X/Y completed) + per-day completion bars | Tasks |

> A **mindset tracker** (daily Energy / Focus / Motivation ratings shown as a
> three-line trend) is planned as an optional add-on to the Tasks page.

## Run it (development)

Run the backend and the Vite dev server in two terminals:

```bash
npm install
npm run server   # storage API on http://localhost:3001 (SQLite)
npm run dev      # app on http://localhost:5173 (proxies /api → :3001)
```

Open the app and the sidebar shows **Synced** once it connects. Any device that
points at the same backend sees the same data.

## Run it (production / one process)

```bash
npm run build    # type-checks the front end, outputs to dist/
npm start        # Express serves the built app AND the API on http://localhost:3001
```

Deploy that single Node process to any host (a VPS, a container, a PaaS) and open
it from your phone, laptop, work machine — the entered details are retained
because they live in the server's database, not the browser.

### Configuration

| Var | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3001` | Port the backend listens on |

The SQLite database is a single file at `server/data/habits.db` (created on first
run, git-ignored). Back it up by copying that file.

## Storage & cross-device sync

- **Server (source of truth):** the Express backend (`server/`) persists
  everything in **SQLite** — three relational tables: `habits`, `logs`
  (one row per habit per completed day), and `tasks`. The equivalent **MySQL**
  DDL is documented at the bottom of `server/db.js` if you prefer to point it at
  a MySQL server instead.
- **REST API:** `GET /api/state` returns your full state; `PUT /api/state` saves
  it. The client saves the whole state on every change, so sync is one atomic,
  idempotent call.
- **Local cache:** `localStorage` (`habit-tracker.v1`) mirrors the server for
  instant, offline-capable reads. On first connect, an empty server is seeded
  from your local data — so upgrading from the old localStorage-only version
  migrates your existing habits automatically.
- **Backup:** **Settings → Export backup** still saves a JSON copy you can Import
  elsewhere.

## Project layout

```
src/
  App.tsx              orchestration: pages, view modes, toggle + toast, sync
  components/          Sidebar, MonthlyGrid, AltViews (daily/weekly/lifetime),
                       Analysis, AreaChart, Ring, HabitManager, Toast
  lib/                 types, date helpers, stats, storage (local + remote API)
server/
  index.js             Express REST API (+ serves the built app in production)
  db.js                SQLite schema & queries (with MySQL DDL reference)
```
