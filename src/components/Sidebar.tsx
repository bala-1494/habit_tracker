import type { Page } from '../lib/types'
import type { SyncStatus } from '../App'

const ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: 'habits', label: 'HABITS', icon: '✓' },
  { key: 'tasks', label: 'TASKS', icon: '▦' },
  { key: 'stats', label: 'STATS', icon: '≈' },
  { key: 'settings', label: 'SETTINGS', icon: '⚙' },
]

const SYNC_META: Record<SyncStatus, { label: string; title: string }> = {
  connecting: { label: 'Syncing…', title: 'Connecting to your storage server' },
  online: { label: 'Synced', title: 'Saved to your server — available on every device' },
  offline: { label: 'Offline', title: 'Server unreachable — saved locally, will sync when back online' },
}

interface SidebarProps {
  page: Page
  onNavigate: (page: Page) => void
  sync: SyncStatus
}

export default function Sidebar({ page, onNavigate, sync }: SidebarProps) {
  const meta = SYNC_META[sync]
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
      <div className={`sidebar__sync sidebar__sync--${sync}`} title={meta.title}>
        <span className="sidebar__sync-dot" aria-hidden />
        <span className="sidebar__sync-label">{meta.label}</span>
      </div>
    </nav>
  )
}
