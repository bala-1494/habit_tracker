import type { Habit, LogMap } from '../lib/types'
import { habitRates } from '../lib/stats'

interface AnalysisProps {
  habits: Habit[]
  logs: LogMap
  year: number
  month: number
}

/** Per-habit success-rate bars, ranked highest first (the ANALYSIS panel). */
export default function Analysis({ habits, logs, year, month }: AnalysisProps) {
  const rows = habitRates(habits, logs, year, month).sort((a, b) => b.rate - a.rate)

  return (
    <section className="panel">
      <h2 className="panel__title">ANALYSIS</h2>
      <ul className="analysis">
        {rows.map(({ habit, rate }) => (
          <li key={habit.id} className="analysis__row">
            <span className="analysis__label">
              <span className="analysis__emoji" aria-hidden>{habit.emoji}</span>
              {habit.name}
            </span>
            <span className="analysis__bar">
              <span
                className="analysis__fill"
                style={{ width: `${Math.round(rate * 100)}%`, background: habit.color }}
              />
            </span>
            <span className="analysis__pct">{Math.round(rate * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
