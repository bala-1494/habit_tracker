import type { AppState, Habit } from './types'

const STORAGE_KEY = 'habit-tracker.v1'
const API_BASE = '/api'

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

function normalize(parsed: Partial<AppState> | null | undefined): AppState | null {
  if (parsed && Array.isArray(parsed.habits) && parsed.logs) {
    // `tasks` was added in a later version — default it for older saves.
    return { habits: parsed.habits, logs: parsed.logs, tasks: parsed.tasks ?? [] }
  }
  return null
}

// --- Local (offline) cache --------------------------------------------------
// localStorage is kept as an instant, offline-capable mirror of the server so
// the UI still works with no network and never loses data mid-edit.

export function loadLocalState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const state = normalize(JSON.parse(raw) as Partial<AppState>)
      if (state) return state
    }
  } catch {
    // Corrupt or unavailable storage — fall through to defaults.
  }
  return { habits: DEFAULT_HABITS, logs: {}, tasks: [] }
}

export function saveLocalState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore quota / private-mode write failures.
  }
}

// --- Remote (cross-device) storage -----------------------------------------
// The backend (see /server) persists everything in a SQL database so the same
// data follows you to any device. These calls degrade gracefully: if the server
// is unreachable, the app keeps working from the local cache above.

/** Fetch the authoritative state from the server, or null if unavailable. */
export async function fetchRemoteState(): Promise<AppState | null> {
  try {
    const res = await fetch(`${API_BASE}/state`, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return normalize((await res.json()) as Partial<AppState>)
  } catch {
    return null
  }
}

/** Push the full state to the server. Returns true when it was saved. */
export async function pushRemoteState(state: AppState): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    return res.ok
  } catch {
    return false
  }
}

// --- Backup import/export (unchanged behaviour) -----------------------------

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function importState(json: string): AppState | null {
  try {
    return normalize(JSON.parse(json) as Partial<AppState>)
  } catch {
    // invalid JSON
    return null
  }
}
