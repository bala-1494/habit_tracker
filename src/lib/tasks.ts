import type { Task } from './types'
import { dateKey } from './date'

export function tasksForDate(tasks: Task[], d: Date): Task[] {
  const key = dateKey(d)
  return tasks.filter((t) => t.date === key)
}

export interface Progress {
  done: number
  total: number
  ratio: number
}

export function progressOf(tasks: Task[]): Progress {
  const total = tasks.length
  const done = tasks.reduce((n, t) => n + (t.done ? 1 : 0), 0)
  return { done, total, ratio: total ? done / total : 0 }
}

export function dayProgress(tasks: Task[], d: Date): Progress {
  return progressOf(tasksForDate(tasks, d))
}

/** Overall progress + per-day ratios across a set of week days. */
export function weekSummary(tasks: Task[], week: Date[]): { overall: Progress; perDay: Progress[] } {
  const perDay = week.map((d) => dayProgress(tasks, d))
  const total = perDay.reduce((n, p) => n + p.total, 0)
  const done = perDay.reduce((n, p) => n + p.done, 0)
  return { overall: { done, total, ratio: total ? done / total : 0 }, perDay }
}
