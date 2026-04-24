import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, PageHeader, SectionTitle, Badge, Ring, ProgressBar } from './ui/primitives'
import { todayStr } from './shared'
import { useData } from '../stores/DataContext'
import type { HealthItem, HealthStatus } from '../types'

const STATUS_OPTS: HealthStatus[] = [
  'tracking',
  'monitoring',
  'active',
  'action',
  'watch',
  'resolved',
]

const STATUS_COLORS: Record<HealthStatus, string> = {
  monitoring: 'var(--color-warn)',
  action: 'var(--color-danger)',
  watch: 'var(--color-peach)',
  active: 'var(--color-info)',
  tracking: 'var(--color-success)',
  resolved: 'var(--color-muted)',
}

const inputCls =
  'bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-brand w-full'

interface ItemFormState {
  label: string
  status: HealthStatus
  note: string
}

function emptyForm(): ItemFormState {
  return { label: '', status: 'tracking', note: '' }
}

export default function Health() {
  const {
    fitLogs,
    addFitnessLog,
    healthItems,
    addHealthItem,
    updateHealthItem,
    deleteHealthItem,
  } = useData()

  // Weight summary
  const sortedFit = useMemo(
    () => [...fitLogs].sort((a, b) => (a.date || '').localeCompare(b.date || '')),
    [fitLogs]
  )
  const startWeight = sortedFit[0]?.weight ?? null
  const latestWeight = sortedFit[sortedFit.length - 1]?.weight ?? null
  const goalWeight = 78
  const pct =
    startWeight != null && latestWeight != null && startWeight > goalWeight
      ? Math.max(0, Math.min(1, (startWeight - latestWeight) / (startWeight - goalWeight)))
      : 0

  // Weight log form
  const [weightAdding, setWeightAdding] = useState(false)
  const [weightVal, setWeightVal] = useState('')
  const [weightDate, setWeightDate] = useState<string>(todayStr())
  const [weightNote, setWeightNote] = useState('')

  const handleAddWeight = async () => {
    const n = parseFloat(weightVal)
    if (!Number.isFinite(n) || n <= 0) return
    await addFitnessLog({
      date: weightDate,
      weight: n,
      note: weightNote,
      calories_eaten: 0,
      calories_burned: 0,
    })
    setWeightVal('')
    setWeightNote('')
    setWeightAdding(false)
  }

  // Health items
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<ItemFormState>(emptyForm())

  const startEdit = (item: HealthItem) => {
    setEditingId(item.id)
    setAdding(false)
    setForm({ label: item.label, status: item.status, note: item.note || '' })
  }
  const cancel = () => {
    setEditingId(null)
    setAdding(false)
    setForm(emptyForm())
  }
  const save = async () => {
    if (!form.label.trim()) return
    if (editingId) {
      await updateHealthItem(editingId, {
        label: form.label.trim(),
        status: form.status,
        note: form.note.trim(),
      })
    } else {
      await addHealthItem({
        label: form.label.trim(),
        status: form.status,
        note: form.note.trim(),
      })
    }
    cancel()
  }

  const renderForm = () => (
    <div className="flex flex-col gap-2">
      <input
        value={form.label}
        onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
        placeholder="Health item label"
        autoFocus
        className={inputCls}
      />
      <select
        value={form.status}
        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as HealthStatus }))}
        className={inputCls}
      >
        {STATUS_OPTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        value={form.note}
        onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        placeholder="Notes"
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
        title="Health"
        subtitle={`${latestWeight != null ? latestWeight + 'kg current' : 'Log your first weight'} · ${healthItems.length} tracked items`}
      />

      {/* Weight journey */}
      <Card>
        <SectionTitle>Weight journey</SectionTitle>
        <div className="flex items-center gap-4 mb-3">
          <Ring pct={pct} size={64} color="var(--color-success)" />
          <div>
            <div className="text-2xl font-bold font-mono text-text">
              {latestWeight != null ? latestWeight : '—'}
              <span className="text-base text-muted ml-1">kg</span>
            </div>
            <div className="text-[11px] text-muted">
              Goal {goalWeight}kg · started {startWeight ?? '—'}kg
            </div>
          </div>
        </div>
        <ProgressBar pct={pct} color="var(--color-success)" h={8} />
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-muted">
            {fitLogs.length} entries
          </span>
          <button
            type="button"
            onClick={() => setWeightAdding((v) => !v)}
            className="px-2.5 py-1 rounded-md bg-brand/15 text-brand text-[11px] font-bold hover:bg-brand/25 transition-colors"
          >
            {weightAdding ? 'Cancel' : '+ Log weight'}
          </button>
        </div>
        {weightAdding && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
            <input
              type="date"
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              className={inputCls}
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weightVal}
              onChange={(e) => setWeightVal(e.target.value)}
              className={inputCls}
            />
            <input
              placeholder="Note (optional)"
              value={weightNote}
              onChange={(e) => setWeightNote(e.target.value)}
              className={inputCls}
            />
            <button
              type="button"
              onClick={handleAddWeight}
              disabled={!weightVal}
              className="sm:col-span-3 px-3 py-2 rounded-md bg-brand text-black text-xs font-bold hover:bg-brand-strong disabled:opacity-40 transition-colors"
            >
              Save weight
            </button>
          </div>
        )}
        {sortedFit
          .slice()
          .reverse()
          .slice(0, 8)
          .map((entry, i) => (
            <div
              key={`${entry.date}-${i}`}
              className="flex items-center justify-between py-2 border-b border-border last:border-b-0 mt-1"
            >
              <span className="text-[11px] text-muted font-mono">{entry.date}</span>
              <div className="flex items-center gap-2">
                {entry.note && (
                  <span className="text-[10px] text-muted">{entry.note}</span>
                )}
                <span className="text-[13px] font-bold font-mono text-text">
                  {entry.weight}kg
                </span>
              </div>
            </div>
          ))}
      </Card>

      {/* Health items */}
      <Card>
        <SectionTitle>Health dashboard</SectionTitle>
        {healthItems.map((item) =>
          editingId === item.id ? (
            <div
              key={item.id}
              className="py-3 border-b border-border last:border-b-0"
            >
              {renderForm()}
            </div>
          ) : (
            <div
              key={item.id}
              className="py-3 border-b border-border last:border-b-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-text">{item.label}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge text={item.status.toUpperCase()} color={STATUS_COLORS[item.status]} />
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="text-muted hover:text-text p-1"
                    aria-label="Edit health item"
                  >
                    <Pencil size={12} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteHealthItem(item.id)}
                    className="text-muted hover:text-danger p-1"
                    aria-label="Delete health item"
                  >
                    <Trash2 size={12} aria-hidden />
                  </button>
                </div>
              </div>
              {item.note && (
                <div className="text-xs text-muted mt-1">{item.note}</div>
              )}
            </div>
          )
        )}
        {adding && <div className="py-3 mt-2 border-t border-border">{renderForm()}</div>}
        {!adding && !editingId && (
          <button
            type="button"
            onClick={() => {
              setAdding(true)
              setForm(emptyForm())
            }}
            className="mt-3 w-full py-2.5 rounded-lg border border-dashed border-border bg-surface/50 hover:bg-surface text-sm font-semibold text-muted hover:text-text transition-colors"
          >
            <Plus size={14} className="inline -mt-0.5 mr-1" aria-hidden />
            Add health item
          </button>
        )}
        {!healthItems.length && !adding && (
          <div className="text-xs text-muted text-center py-4">
            No health items yet — track concerns, recoveries, or active follow-ups.
          </div>
        )}
      </Card>
    </div>
  )
}
