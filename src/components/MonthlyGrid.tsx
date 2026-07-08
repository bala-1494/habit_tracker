import type { Habit, LogMap } from '../lib/types'
import { DOW_SHORT, WEEK_COLORS, monthDays, isSameDay } from '../lib/date'
import { isDone } from '../lib/stats'

interface MonthlyGridProps {
  habits: Habit[]
  logs: LogMap
  year: number
  month: number
  today: Date
  onToggle: (habitId: string, date: Date) => void
}

/** The month laid out as habit-rows × day-columns, banded by week (the MONTHLY GRID). */
export default function MonthlyGrid({ habits, logs, year, month, today, onToggle }: MonthlyGridProps) {
  const cells = monthDays(year, month)
  const track = { gridTemplateColumns: `repeat(${cells.length}, minmax(22px, 1fr))` }

  // Week band header spans: how many day-columns each week occupies.
  const bands: { week: number; span: number }[] = []
  for (const c of cells) {
    const last = bands[bands.length - 1]
    if (last && last.week === c.weekIndex) last.span += 1
    else bands.push({ week: c.weekIndex, span: 1 })
  }

  const doneByDay = cells.map((c) => habits.reduce((n, h) => n + (isDone(logs, h.id, c.date) ? 1 : 0), 0))
  const denom = habits.length || 1

  return (
    <section className="panel">
      <h2 className="panel__title">MONTHLY GRID</h2>
      <div className="grid-scroll">
        <div className="grid">
          {/* Week band row */}
          <div className="grow">
            <div className="grow__label" />
            <div className="grow__track" style={track}>
              {bands.map((b, i) => (
                <div
                  key={i}
                  className="band"
                  style={{ gridColumn: `span ${b.span}`, background: WEEK_COLORS[b.week % WEEK_COLORS.length] }}
                >
                  Week {b.week + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Day-of-week + number header */}
          <div className="grow">
            <div className="grow__label" />
            <div className="grow__track" style={track}>
              {cells.map((c) => (
                <div key={c.day} className={`dayhead ${isSameDay(c.date, today) ? 'is-today' : ''}`}>
                  <span className="dayhead__dow">{DOW_SHORT[c.dow]}</span>
                  <span className="dayhead__num">{c.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Habit rows */}
          {habits.map((h) => (
            <div className="grow" key={h.id}>
              <div className="grow__label">
                <span className="grow__dot" style={{ background: h.color }} aria-hidden />
                <span className="grow__name" title={h.name}>{h.emoji} {h.name}</span>
              </div>
              <div className="grow__track" style={track}>
                {cells.map((c) => {
                  const done = isDone(logs, h.id, c.date)
                  const color = WEEK_COLORS[c.weekIndex % WEEK_COLORS.length]
                  return (
                    <button
                      key={c.day}
                      className={`cell ${done ? 'cell--done' : ''} ${isSameDay(c.date, today) ? 'cell--today' : ''}`}
                      style={done ? { background: color, borderColor: color } : undefined}
                      onClick={() => onToggle(h.id, c.date)}
                      aria-pressed={done}
                      aria-label={`${h.name} on ${c.date.toDateString()}: ${done ? 'done' : 'not done'}`}
                      title={`${h.name} — ${c.date.toDateString()}`}
                    >
                      {done ? '✓' : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Summary rows */}
          <div className="grow grow--summary">
            <div className="grow__label grow__label--muted">Progress %</div>
            <div className="grow__track" style={track}>
              {doneByDay.map((d, i) => <div key={i} className="summary summary--pct">{Math.round((d / denom) * 100)}%</div>)}
            </div>
          </div>
          <div className="grow grow--summary">
            <div className="grow__label grow__label--muted">Done</div>
            <div className="grow__track" style={track}>
              {doneByDay.map((d, i) => <div key={i} className="summary">{d}</div>)}
            </div>
          </div>
          <div className="grow grow--summary">
            <div className="grow__label grow__label--muted">Not done</div>
            <div className="grow__track" style={track}>
              {doneByDay.map((d, i) => <div key={i} className="summary summary--muted">{denom - d}</div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
