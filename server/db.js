// SQLite-backed persistence for the habit tracker.
//
// Why SQLite: it's a single self-contained file (server/data/habits.db) with no
// separate database service to install or run — the fastest way to give the app
// real, server-side, cross-device storage. The table structure below is plain
// relational SQL; the equivalent MySQL DDL is documented at the bottom of this
// file so you can point the app at a MySQL server instead with minimal changes.

import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(join(DATA_DIR, 'habits.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// --- Schema -----------------------------------------------------------------
// habits : one row per habit the user tracks.
// logs   : one row per (habit, day) the habit was completed. Composite PK keeps
//          it idempotent — logging the same day twice can't create duplicates.
// tasks  : one row per dated to-do item on the weekly board.
db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id       TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    emoji    TEXT NOT NULL DEFAULT '',
    color    TEXT NOT NULL DEFAULT '#38bdf8',
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS logs (
    habit_id TEXT NOT NULL,
    date     TEXT NOT NULL,           -- YYYY-MM-DD
    done     INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (habit_id, date),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id    TEXT PRIMARY KEY,
    date  TEXT NOT NULL,              -- YYYY-MM-DD
    title TEXT NOT NULL,
    done  INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_logs_date  ON logs(date);
  CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
`)

// --- Reads ------------------------------------------------------------------

/** Rebuild the whole AppState shape the frontend expects from the tables. */
export function getState() {
  const habits = db
    .prepare('SELECT id, name, emoji, color FROM habits ORDER BY position ASC, rowid ASC')
    .all()

  // logs is a map of `${habitId}|${YYYY-MM-DD}` -> true.
  const logs = {}
  for (const row of db.prepare('SELECT habit_id, date FROM logs WHERE done = 1').all()) {
    logs[`${row.habit_id}|${row.date}`] = true
  }

  const tasks = db
    .prepare('SELECT id, date, title, done FROM tasks ORDER BY rowid ASC')
    .all()
    .map((t) => ({ id: t.id, date: t.date, title: t.title, done: !!t.done }))

  return { habits, logs, tasks }
}

// --- Writes -----------------------------------------------------------------

/**
 * Replace the entire persisted state in one transaction. The frontend already
 * saves the whole AppState on every change, so a single idempotent "sync"
 * endpoint keeps the client simple while the data still lives in real tables.
 */
export const replaceState = db.transaction((state) => {
  const habits = Array.isArray(state?.habits) ? state.habits : []
  const logs = state?.logs && typeof state.logs === 'object' ? state.logs : {}
  const tasks = Array.isArray(state?.tasks) ? state.tasks : []

  db.prepare('DELETE FROM logs').run()
  db.prepare('DELETE FROM tasks').run()
  db.prepare('DELETE FROM habits').run()

  const insHabit = db.prepare(
    'INSERT INTO habits (id, name, emoji, color, position) VALUES (?, ?, ?, ?, ?)'
  )
  habits.forEach((h, i) => {
    if (!h || !h.id) return
    insHabit.run(h.id, h.name ?? '', h.emoji ?? '', h.color ?? '#38bdf8', i)
  })

  const validIds = new Set(habits.map((h) => h && h.id).filter(Boolean))
  const insLog = db.prepare('INSERT OR IGNORE INTO logs (habit_id, date, done) VALUES (?, ?, 1)')
  for (const key of Object.keys(logs)) {
    if (!logs[key]) continue
    const sep = key.indexOf('|')
    if (sep < 0) continue
    const habitId = key.slice(0, sep)
    const date = key.slice(sep + 1)
    // Skip orphan logs so the foreign key never rejects the whole transaction.
    if (!validIds.has(habitId)) continue
    insLog.run(habitId, date)
  }

  const insTask = db.prepare('INSERT INTO tasks (id, date, title, done) VALUES (?, ?, ?, ?)')
  for (const t of tasks) {
    if (!t || !t.id) continue
    insTask.run(t.id, t.date ?? '', t.title ?? '', t.done ? 1 : 0)
  }
})

export default db

/*
================================================================================
Equivalent MySQL schema
--------------------------------------------------------------------------------
If you'd rather use a MySQL server, create a database and run the DDL below,
then swap better-sqlite3 for the `mysql2` driver in this file. The API and the
frontend do not change.

  CREATE TABLE habits (
    id       VARCHAR(64)  NOT NULL,
    name     VARCHAR(255) NOT NULL,
    emoji    VARCHAR(16)  NOT NULL DEFAULT '',
    color    VARCHAR(16)  NOT NULL DEFAULT '#38bdf8',
    position INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE logs (
    habit_id VARCHAR(64) NOT NULL,
    date     DATE        NOT NULL,
    done     TINYINT     NOT NULL DEFAULT 1,
    PRIMARY KEY (habit_id, date),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    INDEX idx_logs_date (date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE tasks (
    id    VARCHAR(64)  NOT NULL,
    date  DATE         NOT NULL,
    title VARCHAR(512) NOT NULL,
    done  TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_tasks_date (date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
================================================================================
*/
