import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, PageHeader, SectionTitle } from './ui/primitives'
import { useData } from '../stores/DataContext'
import type { ScheduleItem } from '../types'

const CAT_COLORS: Record<string, string> = {
  routine: 'var(--color-muted)',
  mindset: 'var(--color-plum)',
  health: 'var(--color-success)',
  career: 'var(--color-info)',
  work: '#94a3b8',
  fitness: 'var(--color-peach)',
  creative: 'var(--color-rose)',
  selfcare: 'var(--color-teal)',
}

const CAT_OPTS = Object.keys(CAT_COLORS)

const inputCls =
  'bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-brand'

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

// Parse "7:00 AM" → minutes-of-day. Returns -1 on failure so unparseable
// items sort to the top instead of crashing.
function parseTime(t: string): number {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!m) return -1
  let h = Number(m[1])
  const mins = Number(m[2])
  const meridiem = m[3]?.toUpperCase()
  if (meridiem === 'PM' && h !== 12) h += 12
  if (meridiem === 'AM' && h === 12) h = 0
  return h * 60 + mins
}

function isCurrent(time: string, nextTime?: string): boolean {
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  const start = parseTime(time)
  const end = nextTime ? parseTime(nextTime) : 24 * 60
  if (start < 0) return false
  return cur >= start && cur < end
}

interface FormState {
  time: string
  activity: string
  cat: string
}

function emptyForm(): FormState {
  return { time: '', activity: '', cat: 'routine' }
}

export default function Schedule() {
  const { schedule, updateSchedule } = useData()
  const items = useMemo(
    () => [...schedule.items].sort((a, b) => parseTime(a.time) - parseTime(b.time)),
    [schedule.items]
  )

  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())

  const startEdit = (item: ScheduleItem) => {
    setEditingId(item.id)
    setAdding(false)
    setForm({ time: item.time, activity: item.activity, cat: item.cat })
  }
  const cancel = () => {
    setEditingId(null)
    setAdding(false)
    setForm(emptyForm())
  }
  const save = async () => {
    if (!form.time.trim() || !form.activity.trim()) return
    const cleaned: ScheduleItem = {
      id: editingId || uid(),
      time: form.time.trim(),
      activity: form.activity.trim(),
      cat: form.cat,
    }
    const next = editingId
      ? items.map((it) => (it.id === editingId ? cleaned : it))
      : [...items, cleaned]
    await updateSchedule(next)
    cancel()
  }
  const remove = async (id: string) => {
    await updateSchedule(items.filter((it) => it.id !== id))
  }

  const renderForm = () => (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          placeholder="7:00 AM"
          autoFocus
          className={`${inputCls} w-32 font-mono`}
        />
        <select
          value={form.cat}
          onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))}
          className={`${inputCls} flex-1`}
        >
          {CAT_OPTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <input
        value={form.activity}
        onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))}
        onKeyDown={(e) => e.key === 'Enter' && save()}
        placeholder="Activity"
        className={inputCls}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          className="px-3 py-1.5 rounded-md bg-brand text-black text-xs font-bold hover:bg-brand-strong transition-colors"
        >
          {editingId ? 'Save' : 'Add'}
        </button>
        <button
          type="button"
          onClick={cancel}
          className="px-3 py-1.5 rounded-md bg-surface-2 border border-border text-xs text-muted hover:text-text transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Schedule"
        subtitle={`${items.length} ${items.length === 1 ? 'block' : 'blocks'} in your daily timeline`}
        right={
          !adding && !editingId ? (
            <button
              type="button"
              onClick={() => {
                setAdding(true)
                setForm(emptyForm())
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-black text-[14px] font-semibold hover:bg-brand-strong transition-colors"
            >
              <Plus size={16} aria-hidden /> Add block
            </button>
          ) : null
        }
      />

      {adding && (
        <Card style={{ border: '1px solid rgba(34,197,94,0.2)' }}>{renderForm()}</Card>
      )}

      {items.length === 0 && !adding && (
        <Card className="flex flex-col items-center text-center gap-2 py-10">
          <div className="text-sm font-bold text-text">No schedule yet</div>
          <div className="text-xs text-muted max-w-xs">
            Block out your morning routine, deep work windows, and evening rituals.
          </div>
          <button
            type="button"
            onClick={() => {
              setAdding(true)
              setForm(emptyForm())
            }}
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-2 rounded-lg bg-brand text-black text-xs font-bold"
          >
            <Plus size={14} aria-hidden /> Add first block
          </button>
        </Card>
      )}

      {items.length > 0 && (
        <Card className="!p-0">
          <div className="px-4 py-3 border-b border-border">
            <SectionTitle>Today's blocks</SectionTitle>
          </div>
          {items.map((item, i) => {
            const next = items[i + 1]
            const live = isCurrent(item.time, next?.time)
            const color = CAT_COLORS[item.cat] || 'var(--color-muted)'
            if (editingId === item.id) {
              return (
                <div
                  key={item.id}
                  className="px-4 py-3 border-b border-border last:border-b-0 bg-white/[0.02]"
                >
                  {renderForm()}
                </div>
              )
            }
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 ${
                  live ? 'bg-brand/5' : ''
                }`}
                style={{
                  borderLeft: `3px solid ${live ? color : 'transparent'}`,
                }}
              >
                <span
                  className="w-20 shrink-0 text-xs font-bold font-mono"
                  style={{ color: live ? color : 'var(--color-muted)' }}
                >
                  {item.time}
                </span>
                <span
                  className="flex-1 text-sm"
                  style={{
                    color: live ? 'var(--color-text)' : 'var(--color-muted)',
                    fontWeight: live ? 600 : 400,
                  }}
                >
                  {item.activity}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="text-muted hover:text-text p-1 shrink-0"
                  aria-label="Edit block"
                >
                  <Pencil size={12} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item.id)}
                  className="text-muted hover:text-danger p-1 shrink-0"
                  aria-label="Delete block"
                >
                  <Trash2 size={12} aria-hidden />
                </button>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
