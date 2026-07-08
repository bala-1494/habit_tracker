export interface Habit {
  id: string
  name: string
  emoji: string
  /** hex accent color for the habit dot */
  color: string
}

/** Map of `${habitId}|${YYYY-MM-DD}` -> true when the habit was done that day. */
export type LogMap = Record<string, boolean>

export interface AppState {
  habits: Habit[]
  logs: LogMap
}

export type ViewMode = 'daily' | 'weekly' | 'monthly' | 'lifetime'
export type Page = 'habits' | 'tasks' | 'stats' | 'settings'
