import type { Habit, LogMap } from '../lib/types'
import { DOW_SHORT, dateKey, weekOf } from '../lib/date'
import { isDone, currentStreak, bestStreak, lifetimeTotals } from '../lib/stats'
import Ring from './Ring'

interface ViewProps {
  habits: Habit[]
  logs: LogMap
  today: Date
  onToggle: (habitId: string, date: Date) => void
}

/** DAILY: today's habits as a big check list with a completion ring. */
export function DailyView({ habits, logs, today, onToggle }: ViewProps) {
  const done = habits.filter((h) => isDone(logs, h.id, today)).length
  const ratio = habits.length ? done / habits.length : 0

  return (
    <section className="panel">
      <div className="daily__head">
        <div>
          <h2 className="panel__title">TODAY</h2>
          <p className="daily__date">{today.toDateString()}</p>
        </div>
        <Ring ratio={ratio} size={110} label={`${done}/${habits.length}`} />
      </div>
      <ul className="checklist">
        {habits.map((h) => {
          const isChecked = isDone(logs, h.id, today)
          return (
            <li key={h.id}>
              <button
                className={`checkitem ${isChecked ? 'checkitem--done' : ''}`}
                onClick={() => onToggle(h.id, today)}
                aria-pressed={isChecked}
              >
                <span className="checkitem__box" style={isChecked ? { background: h.color, borderColor: h.color } : undefined}>
                  {isChecked ? '✓' : ''}
                </span>
                <span className="checkitem__emoji" aria-hidden>{h.emoji}</span>
                <span className="checkitem__name">{h.name}</span>
                <span className="checkitem__streak">{currentStreak(logs, h.id, today)}🔥</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** WEEKLY: this week's 7 days per habit as a compact toggle grid. */
export function WeeklyView({ habits, logs, today, onToggle }: ViewProps) {
  const week = weekOf(today)
  return (
    <section className="panel">
      <h2 className="panel__title">THIS WEEK</h2>
      <div className="weekgrid">
        <div className="weekgrid__corner" />
        {week.map((d) => (
          <div key={dateKey(d)} className={`weekgrid__head ${dateKey(d) === dateKey(today) ? 'is-today' : ''}`}>
            <span>{DOW_SHORT[d.getDay()]}</span>
            <span className="weekgrid__num">{d.getDate()}</span>
          </div>
        ))}
        {habits.map((h) => (
          <div className="weekgrid__row" key={h.id}>
            <div className="weekgrid__label" title={h.name}>{h.emoji} {h.name}</div>
            {week.map((d) => {
              const checked = isDone(logs, h.id, d)
              return (
                <button
                  key={dateKey(d)}
                  className={`cell cell--lg ${checked ? 'cell--done' : ''}`}
                  style={checked ? { background: h.color, borderColor: h.color } : undefined}
                  onClick={() => onToggle(h.id, d)}
                  aria-pressed={checked}
                  aria-label={`${h.name} on ${d.toDateString()}`}
                >
                  {checked ? '✓' : ''}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

/** LIFETIME: all-time streaks and totals per habit. */
export function LifetimeView({ habits, logs, today }: Omit<ViewProps, 'onToggle'>) {
  const totals = lifetimeTotals(logs)
  return (
    <section className="panel">
      <h2 className="panel__title">LIFETIME</h2>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-card__num">{totals.totalLogged}</span>
          <span className="stat-card__label">Total check-ins</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">{totals.activeDays}</span>
          <span className="stat-card__label">Active days</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">{habits.length}</span>
          <span className="stat-card__label">Habits tracked</span>
        </div>
      </div>
      <ul className="lifelist">
        {habits.map((h) => (
          <li key={h.id} className="lifelist__row">
            <span className="lifelist__name">{h.emoji} {h.name}</span>
            <span className="lifelist__stat">Current <b>{currentStreak(logs, h.id, today)}</b></span>
            <span className="lifelist__stat">Best <b>{bestStreak(logs, h.id)}</b></span>
          </li>
        ))}
      </ul>
    </section>
  )
}
