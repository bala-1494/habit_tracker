import { useState } from 'react'
import type { Habit } from '../lib/types'
import { WEEK_COLORS } from '../lib/date'
import { makeId } from '../lib/storage'

const EMOJI_CHOICES = ['🌞', '💧', '💪', '🧘', '📚', '🧹', '🚫', '🏃', '🥗', '😴', '✍️', '🎯']
const COLOR_CHOICES = [...WEEK_COLORS, '#a78bfa', '#f472b6', '#fb7185']

interface HabitManagerProps {
  habits: Habit[]
  onChange: (habits: Habit[]) => void
  onClose: () => void
}

/** Modal to add, rename, recolor, reorder and delete habits. */
export default function HabitManager({ habits, onChange, onClose }: HabitManagerProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0])
  const [color, setColor] = useState(COLOR_CHOICES[0])

  function addHabit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onChange([...habits, { id: makeId(), name: trimmed, emoji, color }])
    setName('')
  }

  function updateHabit(id: string, patch: Partial<Habit>) {
    onChange(habits.map((h) => (h.id === id ? { ...h, ...patch } : h)))
  }

  function removeHabit(id: string) {
    onChange(habits.filter((h) => h.id !== id))
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= habits.length) return
    const next = [...habits]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Manage habits">
        <div className="modal__head">
          <h2>Manage habits</h2>
          <button className="iconbtn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="addbar">
          <select value={emoji} onChange={(e) => setEmoji(e.target.value)} aria-label="Emoji">
            {EMOJI_CHOICES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="New habit name…"
            aria-label="New habit name"
          />
          <div className="swatches">
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                className={`swatch ${c === color ? 'swatch--on' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <button className="btn btn--primary" onClick={addHabit}>Add</button>
        </div>

        <ul className="managelist">
          {habits.map((h, i) => (
            <li key={h.id} className="managelist__row">
              <span className="managelist__reorder">
                <button className="iconbtn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">▲</button>
                <button className="iconbtn" onClick={() => move(i, 1)} disabled={i === habits.length - 1} aria-label="Move down">▼</button>
              </span>
              <select value={h.emoji} onChange={(e) => updateHabit(h.id, { emoji: e.target.value })} aria-label="Emoji">
                {[h.emoji, ...EMOJI_CHOICES.filter((e) => e !== h.emoji)].map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <input value={h.name} onChange={(e) => updateHabit(h.id, { name: e.target.value })} aria-label="Habit name" />
              <div className="swatches">
                {COLOR_CHOICES.map((c) => (
                  <button
                    key={c}
                    className={`swatch swatch--sm ${c === h.color ? 'swatch--on' : ''}`}
                    style={{ background: c }}
                    onClick={() => updateHabit(h.id, { color: c })}
                    aria-label={`Set color ${c}`}
                  />
                ))}
              </div>
              <button className="iconbtn iconbtn--danger" onClick={() => removeHabit(h.id)} aria-label={`Delete ${h.name}`}>🗑</button>
            </li>
          ))}
          {habits.length === 0 && <li className="managelist__empty">No habits yet — add one above.</li>}
        </ul>
      </div>
    </div>
  )
}
