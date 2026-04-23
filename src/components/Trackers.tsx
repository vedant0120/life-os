import { useMemo, useState } from 'react'
import { Check, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, SectionTitle, ProgressBar, Ring } from './ui/primitives'
import { useData } from '../stores/DataContext'
import type { OrderedRoadmapTracker, RoadmapMonth, RoadmapTopic, Tracker } from '../types'

// Wave 4d focuses on the ordered_roadmap archetype — months with checklisted
// topics. Other archetypes (numeric_log / checklist / freeform_journal) come
// in a follow-up; they share the same backend already.

const inputCls =
  'bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-brand'

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function isRoadmap(t: Tracker): t is OrderedRoadmapTracker {
  return t.archetype === 'ordered_roadmap'
}

function roadmapStats(months: RoadmapMonth[]): { done: number; total: number; pct: number } {
  const total = months.reduce((a, m) => a + m.topics.length, 0)
  const done = months.reduce(
    (a, m) => a + m.topics.filter((t) => t.done).length,
    0
  )
  return { done, total, pct: total ? done / total : 0 }
}

export default function Trackers() {
  const { trackers, createTracker, updateTracker, deleteTracker, toggleRoadmapTopic } =
    useData()

  const roadmaps = useMemo(() => trackers.filter(isRoadmap), [trackers])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [busy, setBusy] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return
    setBusy(true)
    try {
      const id = await createTracker({
        archetype: 'ordered_roadmap',
        name: newName.trim(),
        targetLabel: newTarget.trim() || undefined,
        order: roadmaps.length,
        months: [],
      })
      setNewName('')
      setNewTarget('')
      setCreating(false)
      if (id) setSelectedId(id)
    } finally {
      setBusy(false)
    }
  }

  const selected = roadmaps.find((r) => r.id === selectedId) || null

  if (selected) {
    return (
      <RoadmapDetail
        tracker={selected}
        onBack={() => setSelectedId(null)}
        updateTracker={updateTracker}
        deleteTracker={async (id) => {
          await deleteTracker(id)
          setSelectedId(null)
        }}
        toggleTopic={toggleRoadmapTopic}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand">
            Trackers
          </div>
          <h1 className="text-[22px] font-bold text-text mt-1">Roadmaps & big goals</h1>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand text-black text-sm font-bold hover:bg-brand-strong transition-colors"
          >
            <Plus size={14} aria-hidden /> New roadmap
          </button>
        )}
      </header>

      {creating && (
        <Card style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
          <SectionTitle>New roadmap</SectionTitle>
          <div className="flex flex-col gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name (e.g. DSA Roadmap)"
              autoFocus
              className={`${inputCls} w-full`}
            />
            <input
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="Target (e.g. Oct 2025) — optional"
              className={`${inputCls} w-full`}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim() || busy}
                className="px-3 py-1.5 rounded-md bg-brand text-black text-xs font-bold hover:bg-brand-strong disabled:opacity-40 transition-colors"
              >
                {busy ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false)
                  setNewName('')
                  setNewTarget('')
                }}
                className="px-3 py-1.5 rounded-md bg-surface-2 border border-border text-xs text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {roadmaps.length === 0 && !creating && (
        <Card className="flex flex-col items-center text-center gap-3 py-12">
          <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center">
            <Plus size={20} className="text-brand" aria-hidden />
          </div>
          <div>
            <div className="text-sm font-bold text-text">No roadmaps yet</div>
            <div className="text-xs text-muted mt-1 max-w-xs">
              Roadmaps break a big goal into months and checklisted topics. Great for study
              plans, product launches, or training cycles.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 mt-1 px-3 py-2 rounded-lg bg-brand text-black text-xs font-bold"
          >
            <Plus size={14} aria-hidden /> Create your first roadmap
          </button>
        </Card>
      )}

      {roadmaps.map((r) => {
        const { done, total, pct } = roadmapStats(r.months)
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedId(r.id)}
            className="text-left bg-surface border border-border rounded-[14px] p-4 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center gap-4">
              <Ring pct={pct} size={52} color="var(--color-info)">
                <span className="text-[11px] font-bold font-mono text-info">
                  {Math.round(pct * 100)}%
                </span>
              </Ring>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-text truncate">{r.name}</div>
                <div className="text-[11px] text-muted mt-1">
                  {done} / {total} tasks
                  {r.targetLabel ? ` · target ${r.targetLabel}` : ''}
                </div>
                <div className="mt-2">
                  <ProgressBar pct={pct} color="var(--color-info)" h={4} />
                </div>
              </div>
              <ChevronRight size={16} className="text-muted shrink-0" aria-hidden />
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Detail view ─────────────────────────────────────────────────────────────

interface DetailProps {
  tracker: OrderedRoadmapTracker
  onBack: () => void
  updateTracker: (id: string, patch: Partial<Tracker>) => Promise<void>
  deleteTracker: (id: string) => Promise<void>
  toggleTopic: (
    trackerId: string,
    monthIndex: number,
    topicId: string,
    done: boolean
  ) => Promise<void>
}

function RoadmapDetail({
  tracker,
  onBack,
  updateTracker,
  deleteTracker,
  toggleTopic,
}: DetailProps) {
  const months = tracker.months
  const { done, total, pct } = roadmapStats(months)

  const [addingMonth, setAddingMonth] = useState(false)
  const [newMonth, setNewMonth] = useState('')
  const [editMonthIdx, setEditMonthIdx] = useState<number | null>(null)
  const [editMonthLabel, setEditMonthLabel] = useState('')

  const [addingTopicAt, setAddingTopicAt] = useState<number | null>(null)
  const [newTopic, setNewTopic] = useState('')
  const [editTopic, setEditTopic] = useState<{ mi: number; tid: string } | null>(null)
  const [editTopicLabel, setEditTopicLabel] = useState('')

  const writeMonths = (next: RoadmapMonth[]) => updateTracker(tracker.id, { months: next })

  const addMonth = async () => {
    if (!newMonth.trim()) return
    const next: RoadmapMonth[] = [...months, { label: newMonth.trim(), topics: [] }]
    await writeMonths(next)
    setNewMonth('')
    setAddingMonth(false)
  }
  const renameMonth = async (mi: number) => {
    if (!editMonthLabel.trim()) return
    const next = months.map((m, i) =>
      i === mi ? { ...m, label: editMonthLabel.trim() } : m
    )
    await writeMonths(next)
    setEditMonthIdx(null)
    setEditMonthLabel('')
  }
  const deleteMonth = async (mi: number) => {
    if (!confirm('Delete this month and all its topics?')) return
    const next = months.filter((_, i) => i !== mi)
    await writeMonths(next)
  }

  const addTopic = async (mi: number) => {
    if (!newTopic.trim()) return
    const t: RoadmapTopic = { id: uid(), label: newTopic.trim(), done: false }
    const next = months.map((m, i) =>
      i === mi ? { ...m, topics: [...m.topics, t] } : m
    )
    await writeMonths(next)
    setNewTopic('')
    setAddingTopicAt(null)
  }
  const renameTopic = async () => {
    if (!editTopic || !editTopicLabel.trim()) return
    const { mi, tid } = editTopic
    const next = months.map((m, i) =>
      i === mi
        ? {
            ...m,
            topics: m.topics.map((t) => (t.id === tid ? { ...t, label: editTopicLabel.trim() } : t)),
          }
        : m
    )
    await writeMonths(next)
    setEditTopic(null)
    setEditTopicLabel('')
  }
  const deleteTopic = async (mi: number, tid: string) => {
    const next = months.map((m, i) =>
      i === mi ? { ...m, topics: m.topics.filter((t) => t.id !== tid) } : m
    )
    await writeMonths(next)
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text self-start"
      >
        ← All trackers
      </button>

      <Card>
        <div className="flex items-center gap-4">
          <Ring pct={pct} size={64} color="var(--color-info)">
            <span className="text-[11px] font-bold font-mono text-info">
              {Math.round(pct * 100)}%
            </span>
          </Ring>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-text">{tracker.name}</div>
            <div className="text-xs text-muted mt-0.5">
              {done} / {total} tasks
              {tracker.targetLabel ? ` · target ${tracker.targetLabel}` : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void deleteTracker(tracker.id)}
            className="text-muted hover:text-danger p-1.5"
            aria-label="Delete roadmap"
          >
            <Trash2 size={14} aria-hidden />
          </button>
        </div>
        <div className="mt-3">
          <ProgressBar pct={pct} color="var(--color-info)" h={6} />
        </div>
      </Card>

      {months.map((m, mi) => (
        <Card key={mi}>
          <div className="flex items-center justify-between mb-3">
            {editMonthIdx === mi ? (
              <div className="flex gap-2 flex-1">
                <input
                  value={editMonthLabel}
                  onChange={(e) => setEditMonthLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void renameMonth(mi)}
                  autoFocus
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => void renameMonth(mi)}
                  className="px-3 rounded-md bg-brand text-black text-xs font-bold"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMonthIdx(null)
                    setEditMonthLabel('')
                  }}
                  className="px-3 rounded-md bg-surface-2 border border-border text-xs text-muted"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="text-sm font-bold text-info">{m.label}</div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAddingTopicAt(mi)
                      setNewTopic('')
                    }}
                    className="text-xs font-semibold text-info hover:opacity-80 px-2"
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMonthIdx(mi)
                      setEditMonthLabel(m.label)
                    }}
                    className="text-muted hover:text-text p-1"
                    aria-label="Rename month"
                  >
                    <Pencil size={12} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteMonth(mi)}
                    className="text-muted hover:text-danger p-1"
                    aria-label="Delete month"
                  >
                    <Trash2 size={12} aria-hidden />
                  </button>
                </div>
              </>
            )}
          </div>
          {m.topics.map((t, ti) => (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 py-2 ${
                ti < m.topics.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => void toggleTopic(tracker.id, mi, t.id, !t.done)}
                className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 border-2 transition-colors"
                style={{
                  borderColor: t.done ? 'var(--color-success)' : 'rgba(255,255,255,0.15)',
                  background: t.done ? 'var(--color-success)' : 'transparent',
                }}
                aria-label={t.done ? `Uncheck ${t.label}` : `Complete ${t.label}`}
              >
                {t.done && <Check size={11} strokeWidth={3} className="text-black" aria-hidden />}
              </button>
              {editTopic && editTopic.mi === mi && editTopic.tid === t.id ? (
                <div className="flex gap-2 flex-1">
                  <input
                    value={editTopicLabel}
                    onChange={(e) => setEditTopicLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void renameTopic()}
                    autoFocus
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => void renameTopic()}
                    className="px-3 rounded-md bg-brand text-black text-xs font-bold"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTopic(null)
                      setEditTopicLabel('')
                    }}
                    className="px-3 rounded-md bg-surface-2 border border-border text-xs text-muted"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className="text-sm flex-1"
                    style={{
                      color: t.done ? 'var(--color-muted)' : 'var(--color-text)',
                      textDecoration: t.done ? 'line-through' : 'none',
                    }}
                  >
                    {t.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTopic({ mi, tid: t.id })
                      setEditTopicLabel(t.label)
                    }}
                    className="text-muted hover:text-text p-1"
                    aria-label="Rename topic"
                  >
                    <Pencil size={11} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteTopic(mi, t.id)}
                    className="text-muted hover:text-danger p-1"
                    aria-label="Delete topic"
                  >
                    <Trash2 size={11} aria-hidden />
                  </button>
                </>
              )}
            </div>
          ))}
          {addingTopicAt === mi && (
            <div className="flex gap-2 mt-3">
              <input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void addTopic(mi)}
                placeholder="New topic…"
                autoFocus
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => void addTopic(mi)}
                className="px-3 rounded-md bg-info text-black text-xs font-bold"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingTopicAt(null)
                  setNewTopic('')
                }}
                className="px-3 rounded-md bg-surface-2 border border-border text-xs text-muted"
              >
                ✕
              </button>
            </div>
          )}
          {!m.topics.length && addingTopicAt !== mi && (
            <div className="text-xs text-muted text-center py-2">
              No topics in this month yet.
            </div>
          )}
        </Card>
      ))}

      {addingMonth ? (
        <div className="flex gap-2">
          <input
            value={newMonth}
            onChange={(e) => setNewMonth(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void addMonth()}
            placeholder="Month / phase label"
            autoFocus
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={addMonth}
            className="px-3 py-2 rounded-lg bg-info text-black text-sm font-bold"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingMonth(false)
              setNewMonth('')
            }}
            className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-muted"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingMonth(true)}
          className="w-full py-3 rounded-lg border border-dashed border-border bg-surface/50 hover:bg-surface text-sm font-semibold text-muted hover:text-text transition-colors"
        >
          <Plus size={14} className="inline -mt-0.5 mr-1" aria-hidden />
          Add month / phase
        </button>
      )}
    </div>
  )
}
