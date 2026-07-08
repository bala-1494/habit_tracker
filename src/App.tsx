import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppState, Habit, Page, Task, ViewMode } from './lib/types'
import { loadState, saveState, exportState, importState, makeId } from './lib/storage'
import { MONTH_NAMES, addMonths, addDays, dateKey, logKey } from './lib/date'
import { dailyCompletion, monthOverall } from './lib/stats'
import Sidebar from './components/Sidebar'
import MonthlyGrid from './components/MonthlyGrid'
import AreaChart from './components/AreaChart'
import Analysis from './components/Analysis'
import Ring from './components/Ring'
import Toast from './components/Toast'
import HabitManager from './components/HabitManager'
import WeeklyBoard from './components/WeeklyBoard'
import { DailyView, WeeklyView, LifetimeView } from './components/AltViews'

const VIEWS: ViewMode[] = ['daily', 'weekly', 'monthly', 'lifetime']

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [page, setPage] = useState<Page>('habits')
  const [view, setView] = useState<ViewMode>('monthly')
  const [toast, setToast] = useState<string | null>(null)
  const [showManager, setShowManager] = useState(false)

  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState<[number, number]>(() => [today.getFullYear(), today.getMonth()])
  const [year, month] = cursor
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => today)

  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    saveState(state)
  }, [state])

  function flash(msg: string) {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1200)
  }

  function toggle(habitId: string, date: Date) {
    const key = logKey(habitId, date)
    setState((prev) => {
      const nextLogs = { ...prev.logs }
      if (nextLogs[key]) delete nextLogs[key]
      else nextLogs[key] = true
      return { ...prev, logs: nextLogs }
    })
    // Only celebrate the positive action.
    if (!state.logs[key]) flash('✓ Logged!')
  }

  function setHabits(habits: Habit[]) {
    setState((prev) => ({ ...prev, habits }))
  }

  function addTask(date: Date, title: string) {
    const task: Task = { id: makeId(), date: dateKey(date), title, done: false }
    setState((prev) => ({ ...prev, tasks: [...prev.tasks, task] }))
  }

  function toggleTask(taskId: string) {
    // Decide the toast from current state — the updater below runs after this line.
    const current = state.tasks.find((t) => t.id === taskId)
    if (current && !current.done) flash('✓ Completed!')
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    }))
  }

  function deleteTask(taskId: string) {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }))
  }

  const overall = monthOverall(state.habits, state.logs, year, month)
  const daily = dailyCompletion(state.habits, state.logs, year, month)

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} />

      <main className="main">
        {page === 'habits' && (
          <HabitsPage
            view={view}
            setView={setView}
            year={year}
            month={month}
            onPrevMonth={() => setCursor(addMonths(year, month, -1))}
            onNextMonth={() => setCursor(addMonths(year, month, 1))}
            state={state}
            today={today}
            overall={overall}
            daily={daily.map((d) => d.ratio)}
            onToggle={toggle}
            onManage={() => setShowManager(true)}
          />
        )}

        {page === 'stats' && (
          <StatsPage state={state} year={year} month={month} overall={overall} daily={daily.map((d) => d.ratio)} />
        )}

        {page === 'tasks' && (
          <TasksPage
            state={state}
            today={today}
            weekAnchor={weekAnchor}
            onPrevWeek={() => setWeekAnchor((a) => addDays(a, -7))}
            onNextWeek={() => setWeekAnchor((a) => addDays(a, 7))}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        )}

        {page === 'settings' && (
          <SettingsPage state={state} onImport={setState} onManage={() => setShowManager(true)} />
        )}
      </main>

      {showManager && (
        <HabitManager habits={state.habits} onChange={setHabits} onClose={() => setShowManager(false)} />
      )}
      <Toast message={toast} />
    </div>
  )
}

interface HabitsPageProps {
  view: ViewMode
  setView: (v: ViewMode) => void
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
  state: AppState
  today: Date
  overall: { ratio: number; done: number; total: number }
  daily: number[]
  onToggle: (habitId: string, date: Date) => void
  onManage: () => void
}

function HabitsPage(props: HabitsPageProps) {
  const { view, setView, year, month, state, today, overall, daily, onToggle } = props
  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="topbar__title">☑ Habit Tracker</h1>
          <p className="topbar__sub">DAILY · WEEKLY · MONTHLY · LIFETIME</p>
        </div>
        <div className="topbar__actions">
          <div className="viewtoggle">
            {VIEWS.map((v) => (
              <button key={v} className={`viewtoggle__btn ${view === v ? 'is-on' : ''}`} onClick={() => setView(v)}>
                {v}
              </button>
            ))}
          </div>
          <button className="btn" onClick={props.onManage}>＋ Habits</button>
        </div>
      </header>

      {view === 'monthly' && (
        <div className="monthnav">
          <button className="iconbtn" onClick={props.onPrevMonth} aria-label="Previous month">←</button>
          <span className="monthnav__label">{MONTH_NAMES[month]} {year}</span>
          <button className="iconbtn" onClick={props.onNextMonth} aria-label="Next month">→</button>
        </div>
      )}

      {view === 'monthly' && (
        <>
          <MonthlyGrid habits={state.habits} logs={state.logs} year={year} month={month} today={today} onToggle={onToggle} />
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">DAILY PROGRESS</h2>
              <Ring ratio={overall.ratio} size={64} />
            </div>
            <AreaChart values={daily} />
          </section>
          <Analysis habits={state.habits} logs={state.logs} year={year} month={month} />
        </>
      )}

      {view === 'daily' && <DailyView habits={state.habits} logs={state.logs} today={today} onToggle={onToggle} />}
      {view === 'weekly' && <WeeklyView habits={state.habits} logs={state.logs} today={today} onToggle={onToggle} />}
      {view === 'lifetime' && <LifetimeView habits={state.habits} logs={state.logs} today={today} />}
    </>
  )
}

function StatsPage({ state, year, month, overall, daily }: {
  state: AppState
  year: number
  month: number
  overall: { ratio: number; done: number; total: number }
  daily: number[]
}) {
  return (
    <>
      <header className="topbar">
        <h1 className="topbar__title">Stats</h1>
      </header>
      <section className="panel">
        <div className="overall">
          <Ring ratio={overall.ratio} size={120} label="Overall" />
          <div>
            <p className="overall__big">{Math.round(overall.ratio * 100)}%</p>
            <p className="overall__sub">{overall.done} / {overall.total} check-ins this month</p>
          </div>
        </div>
      </section>
      <section className="panel">
        <h2 className="panel__title">DAILY PROGRESS</h2>
        <AreaChart values={daily} />
      </section>
      <Analysis habits={state.habits} logs={state.logs} year={year} month={month} />
    </>
  )
}

function TasksPage({ state, today, weekAnchor, onPrevWeek, onNextWeek, onAdd, onToggle, onDelete }: {
  state: AppState
  today: Date
  weekAnchor: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  onAdd: (date: Date, title: string) => void
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
}) {
  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="topbar__title">▦ Task Tracker</h1>
          <p className="topbar__sub">WEEKLY VIEW</p>
        </div>
      </header>
      <WeeklyBoard
        tasks={state.tasks}
        anchor={weekAnchor}
        today={today}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
        onAdd={onAdd}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    </>
  )
}

function SettingsPage({ state, onImport, onManage }: {
  state: AppState
  onImport: (s: AppState) => void
  onManage: () => void
}) {
  const [text, setText] = useState('')

  function doExport() {
    const blob = new Blob([exportState(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'habit-tracker-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function doImport() {
    const parsed = importState(text)
    if (parsed) {
      onImport(parsed)
      setText('')
      alert('Import successful.')
    } else {
      alert('That JSON did not look like a valid backup.')
    }
  }

  return (
    <>
      <header className="topbar">
        <h1 className="topbar__title">Settings</h1>
      </header>
      <section className="panel">
        <h2 className="panel__title">HABITS</h2>
        <button className="btn btn--primary" onClick={onManage}>Manage habits</button>
      </section>
      <section className="panel">
        <h2 className="panel__title">DATA</h2>
        <p className="settings__note">Everything is stored locally on this device. Back it up or move it to another browser here.</p>
        <div className="settings__row">
          <button className="btn" onClick={doExport}>Export backup (.json)</button>
        </div>
        <textarea
          className="settings__textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a backup JSON here to import…"
        />
        <button className="btn" onClick={doImport} disabled={!text.trim()}>Import</button>
      </section>
    </>
  )
}
