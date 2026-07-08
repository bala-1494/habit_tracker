import type { Task } from '../lib/types'
import { weekOf, shortDate } from '../lib/date'
import { tasksForDate, weekSummary } from '../lib/tasks'
import Ring from './Ring'
import BarChart from './BarChart'
import DayCard from './DayCard'

interface WeeklyBoardProps {
  tasks: Task[]
  anchor: Date
  today: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  onAdd: (date: Date, title: string) => void
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
}

/** The full weekly Task board: overview (donut + bars) plus a scroll row of day cards. */
export default function WeeklyBoard({
  tasks, anchor, today, onPrevWeek, onNextWeek, onAdd, onToggle, onDelete,
}: WeeklyBoardProps) {
  const week = weekOf(anchor)
  const { overall, perDay } = weekSummary(tasks, week)
  const rangeLabel = `${shortDate(week[0])} – ${shortDate(week[6])}`

  return (
    <>
      <div className="monthnav">
        <button className="iconbtn" onClick={onPrevWeek} aria-label="Previous week">←</button>
        <span className="monthnav__label monthnav__label--wide">{rangeLabel}</span>
        <button className="iconbtn" onClick={onNextWeek} aria-label="Next week">→</button>
      </div>

      <section className="panel">
        <h2 className="panel__title">OVERALL PROGRESS</h2>
        <div className="overview">
          <div className="overview__ring">
            <Ring ratio={overall.ratio} size={110} label="Overall" />
            <div>
              <p className="overall__big">{Math.round(overall.ratio * 100)}%</p>
              <p className="overall__sub">{overall.done} / {overall.total} completed</p>
            </div>
          </div>
          <BarChart values={perDay.map((p) => p.ratio)} />
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">THIS WEEK</h2>
        <div className="board">
          {week.map((d) => (
            <DayCard
              key={shortDate(d)}
              date={d}
              today={today}
              tasks={tasksForDate(tasks, d)}
              onAdd={onAdd}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      </section>
    </>
  )
}
