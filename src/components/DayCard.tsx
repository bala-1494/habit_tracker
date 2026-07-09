import { useState } from 'react'
import type { Task } from '../lib/types'
import { DOW_FULL, shortDate, dateKey, isSameDay } from '../lib/date'
import { progressOf } from '../lib/tasks'
import Ring from './Ring'

interface DayCardProps {
  date: Date
  today: Date
  tasks: Task[]
  onAdd: (date: Date, title: string) => void
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
}

/** One day column: header, completion ring, task checklist, and an add-task input. */
export default function DayCard({ date, today, tasks, onAdd, onToggle, onDelete }: DayCardProps) {
  const [draft, setDraft] = useState('')
  const p = progressOf(tasks)
  const isToday = isSameDay(date, today)

  function submit() {
    const t = draft.trim()
    if (!t) return
    onAdd(date, t)
    setDraft('')
  }

  return (
    <div className={`daycard ${isToday ? 'daycard--today' : ''}`}>
      <div className="daycard__head">
        <span className="daycard__dow">{DOW_FULL[date.getDay()]}</span>
        <span className="daycard__date">{shortDate(date)}</span>
      </div>

      <div className="daycard__ring">
        <Ring ratio={p.ratio} size={84} color={isToday ? '#34d399' : '#22d3c5'} />
      </div>

      <ul className="daycard__list">
        {tasks.map((t) => (
          <li key={t.id} className={`taskrow ${t.done ? 'taskrow--done' : ''}`}>
            <button
              className="taskrow__check"
              onClick={() => onToggle(t.id)}
              aria-pressed={t.done}
              aria-label={`${t.done ? 'Uncheck' : 'Check'} ${t.title}`}
            >
              {t.done ? '✓' : ''}
            </button>
            <span className="taskrow__title">{t.title}</span>
            <button className="taskrow__del" onClick={() => onDelete(t.id)} aria-label={`Delete ${t.title}`}>✕</button>
          </li>
        ))}
      </ul>

      <div className="daycard__add">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Add task…"
          aria-label={`Add task for ${dateKey(date)}`}
        />
      </div>

      <div className="daycard__foot">Completed {p.done}/{p.total}</div>
    </div>
  )
}
