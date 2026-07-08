import type { AppState, Habit } from './types'

const STORAGE_KEY = 'habit-tracker.v1'

let counter = 0
export function makeId(): string {
  // Time + counter keeps ids unique without pulling in a uuid dependency.
  counter += 1
  return `h_${Date.now().toString(36)}_${counter.toString(36)}`
}

export const DEFAULT_HABITS: Habit[] = [
  { id: 'seed_wakeup', name: 'Wakeup at 5 am', emoji: '\u{1F31E}', color: '#f59e0b' },
  { id: 'seed_water', name: 'Drink water', emoji: '\u{1F4A7}', color: '#38bdf8' },
  { id: 'seed_gym', name: 'Gym', emoji: '\u{1F4AA}', color: '#22d3c5' },
  { id: 'seed_meditation', name: 'Meditation', emoji: '\u{1F9D8}', color: '#a78bfa' },
  { id: 'seed_reading', name: 'Reading', emoji: '\u{1F4DA}', color: '#34d399' },
  { id: 'seed_cleaning', name: 'Cleaning', emoji: '\u{1F9F9}', color: '#f472b6' },
  { id: 'seed_focus', name: 'No distractions', emoji: '\u{1F6AB}', color: '#fb7185' },
]

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>
      if (Array.isArray(parsed.habits) && parsed.logs) {
        // `tasks` was added in a later version — default it for older saves.
        return { habits: parsed.habits, logs: parsed.logs, tasks: parsed.tasks ?? [] }
      }
    }
  } catch {
    // Corrupt or unavailable storage — fall through to defaults.
  }
  return { habits: DEFAULT_HABITS, logs: {}, tasks: [] }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore quota / private-mode write failures.
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function importState(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json) as Partial<AppState>
    if (Array.isArray(parsed.habits) && parsed.logs) {
      return { habits: parsed.habits, logs: parsed.logs, tasks: parsed.tasks ?? [] }
    }
  } catch {
    // invalid JSON
  }
  return null
}
