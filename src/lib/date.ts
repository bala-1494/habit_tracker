/** Date utilities. All keys use local-time YYYY-MM-DD so a day never shifts across timezones. */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const DOW_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** Colors used to tint each week band in the monthly grid (matches the design). */
export const WEEK_COLORS = ['#7c5cff', '#22d3c5', '#ff5c8a', '#38bdf8', '#34d399', '#f59e0b']

export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function logKey(habitId: string, d: Date): string {
  return `${habitId}|${dateKey(d)}`
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export interface DayCell {
  date: Date
  day: number
  dow: number
  /** zero-based week band index within the month (Su-anchored rows) */
  weekIndex: number
}

/** Every day of a month, tagged with the week band it belongs to (weeks start on Sunday). */
export function monthDays(year: number, month: number): DayCell[] {
  const total = daysInMonth(year, month)
  const firstDow = new Date(year, month, 1).getDay()
  const cells: DayCell[] = []
  for (let day = 1; day <= total; day++) {
    const date = new Date(year, month, day)
    const dow = date.getDay()
    const weekIndex = Math.floor((firstDow + day - 1) / 7)
    cells.push({ date, day, dow, weekIndex })
  }
  return cells
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b)
}

export function addMonths(year: number, month: number, delta: number): [number, number] {
  const d = new Date(year, month + delta, 1)
  return [d.getFullYear(), d.getMonth()]
}
