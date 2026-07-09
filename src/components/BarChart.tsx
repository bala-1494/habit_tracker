import { DOW_SHORT } from '../lib/date'

interface BarChartProps {
  /** ratios 0..1, one per weekday starting Sunday */
  values: number[]
}

/** Color a bar by how complete that day is (amber → teal → green). */
function barColor(ratio: number): string {
  if (ratio >= 0.9) return '#34d399'
  if (ratio >= 0.6) return '#22d3c5'
  if (ratio >= 0.3) return '#eab308'
  return '#f59e0b'
}

/** Per-day completion bars for the weekly overview. */
export default function BarChart({ values }: BarChartProps) {
  return (
    <div className="bars" role="img" aria-label="Completion by day">
      {values.map((v, i) => (
        <div className="bars__col" key={i}>
          <div className="bars__track">
            <div
              className="bars__fill"
              style={{ height: `${Math.max(v * 100, 4)}%`, background: barColor(v) }}
              title={`${Math.round(v * 100)}%`}
            />
          </div>
          <span className="bars__label">{DOW_SHORT[i]}</span>
        </div>
      ))}
    </div>
  )
}
