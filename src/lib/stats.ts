import type { Habit, LogMap } from './types'
import { dateKey, logKey, monthDays } from './date'

export function isDone(logs: LogMap, habitId: string, d: Date): boolean {
  return logs[logKey(habitId, d)] === true
}

/** Per-day completion ratio (0..1) across all habits for a given month. */
export function dailyCompletion(
  habits: Habit[],
  logs: LogMap,
  year: number,
  month: number,
): { day: number; ratio: number }[] {
  const cells = monthDays(year, month)
  const denom = habits.length || 1
  return cells.map((c) => {
    const done = habits.reduce((n, h) => n + (isDone(logs, h.id, c.date) ? 1 : 0), 0)
    return { day: c.day, ratio: done / denom }
  })
}

/** Per-habit success rate (0..1) over the month, for the analysis bars. */
export function habitRates(
  habits: Habit[],
  logs: LogMap,
  year: number,
  month: number,
): { habit: Habit; rate: number; done: number; total: number }[] {
  const cells = monthDays(year, month)
  const total = cells.length || 1
  return habits.map((h) => {
    const done = cells.reduce((n, c) => n + (isDone(logs, h.id, c.date) ? 1 : 0), 0)
    return { habit: h, rate: done / total, done, total }
  })
}

/** Overall month completion (0..1) across every habit-day. */
export function monthOverall(
  habits: Habit[],
  logs: LogMap,
  year: number,
  month: number,
): { ratio: number; done: number; total: number } {
  const cells = monthDays(year, month)
  const total = cells.length * (habits.length || 1)
  let done = 0
  for (const c of cells) for (const h of habits) if (isDone(logs, h.id, c.date)) done += 1
  return { ratio: total ? done / total : 0, done, total }
}

/** Current consecutive-day streak for a habit, counting back from `today`. */
export function currentStreak(logs: LogMap, habitId: string, today: Date): number {
  let streak = 0
  const cursor = new Date(today)
  // Stop at the first day the habit wasn't done.
  while (logs[logKey(habitId, cursor)] === true) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Longest ever streak for a habit across all recorded logs. */
export function bestStreak(logs: LogMap, habitId: string): number {
  const done = Object.keys(logs)
    .filter((k) => logs[k] && k.startsWith(habitId + '|'))
    .map((k) => k.split('|')[1])
    .sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const day of done) {
    if (prev) {
      const prevDate = new Date(prev + 'T00:00:00')
      prevDate.setDate(prevDate.getDate() + 1)
      run = dateKey(prevDate) === day ? run + 1 : 1
    } else {
      run = 1
    }
    best = Math.max(best, run)
    prev = day
  }
  return best
}

/** All-time totals for the lifetime view. */
export function lifetimeTotals(logs: LogMap): { totalLogged: number; activeDays: number } {
  const days = new Set<string>()
  let totalLogged = 0
  for (const k of Object.keys(logs)) {
    if (logs[k]) {
      totalLogged += 1
      days.add(k.split('|')[1])
    }
  }
  return { totalLogged, activeDays: days.size }
}
