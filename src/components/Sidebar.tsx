import type { Page } from '../lib/types'

const ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: 'habits', label: 'HABITS', icon: '✓' },
  { key: 'tasks', label: 'TASKS', icon: '▦' },
  { key: 'stats', label: 'STATS', icon: '≈' },
  { key: 'settings', label: 'SETTINGS', icon: '⚙' },
]

interface SidebarProps {
  page: Page
  onNavigate: (page: Page) => void
}

export default function Sidebar({ page, onNavigate }: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Primary">
      {ITEMS.map((item) => (
        <button
          key={item.key}
          className={`sidebar__item ${page === item.key ? 'sidebar__item--active' : ''}`}
          onClick={() => onNavigate(item.key)}
          aria-current={page === item.key ? 'page' : undefined}
        >
          <span className="sidebar__icon" aria-hidden>{item.icon}</span>
          <span className="sidebar__label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
