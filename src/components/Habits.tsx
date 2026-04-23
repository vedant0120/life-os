import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Star } from 'lucide-react'
import { Card, SectionTitle, ProgressBar, MiniHeatmap } from './ui/primitives'
import { calcStats } from './shared'
import { CAT_COLORS, CATEGORIES } from '../data/constants'
import { useData } from '../stores/DataContext'
import type { HabitStats } from '../types'

// ── Per-habit streak (current run of successes ending at today) ───────────────
function currentStreak(habit: string, logs: { h: string; d: string; s: string | null }[]): number {
  let streak = 0
  const d = new Date()
  // Cap at 365 to avoid infinite loop on bad data
  for (let i = 0; i < 365; i++) {
    const ds = d.toISOString().slice(0, 10)
    const entry = logs.find((l) => l.h === habit && l.d === ds)
    if (entry && entry.s === 'success') {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default function Habits() {
  const { habits, logs, addHabit } = useData()
  const [selected, setSelected] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState<string>(CATEGORIES[0] || 'Career')

  const statsMap = useMemo(() => {
    const m: Record<string, HabitStats> = {}
    habits.forEach((h) => {
      m[h] = calcStats(logs.filter((l) => l.h === h))
    })
    return m
  }, [habits, logs])

  // ── Detail view ────────────────────────────────────────────────────────
  if (selected) {
    const habit = selected
    const records = logs.filter((l) => l.h === habit)
    const stats = calcStats(records)
    const streak = currentStreak(habit, logs)

    // Monthly rate bars (last 6 calendar months that have data)
    const now = new Date()
    const months: { label: string; iso: string; success: number; total: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const iso = d.toISOString().slice(0, 7)
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      const ml = records.filter((r) => r.d.startsWith(iso))
      const success = ml.filter((r) => r.s === 'success').length
      const total = ml.filter((r) => r.s !== 'skip').length
      if (total > 0) months.push({ label, iso, success, total })
    }

    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text self-start"
        >
          <ArrowLeft size={16} aria-hidden /> All habits
        </button>

        <Card>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)' }}
            >
              <Star size={20} className="text-brand" strokeWidth={2.5} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-text truncate">{habit}</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { l: 'Rate', v: `${stats.rate}%`, c: 'var(--color-brand)' },
              { l: 'Streak', v: `${streak}d`, c: 'var(--color-info)' },
              { l: 'Best', v: `${stats.longest}d`, c: 'var(--color-peach)' },
              { l: 'Total', v: stats.total, c: 'var(--color-success)' },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-lg bg-surface-2 border border-border p-2.5 text-center"
              >
                <div className="text-[10px] font-bold tracking-wider uppercase text-muted">
                  {s.l}
                </div>
                <div className="text-lg font-bold font-mono mt-1" style={{ color: s.c }}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {months.length > 0 && (
          <Card>
            <SectionTitle>Monthly</SectionTitle>
            <div className="flex flex-col gap-2">
              {months.map((m) => {
                const rt = m.total > 0 ? m.success / m.total : 0
                const col =
                  rt >= 0.7
                    ? 'var(--color-success)'
                    : rt >= 0.4
                      ? 'var(--color-warn)'
                      : 'var(--color-danger)'
                return (
                  <div key={m.iso} className="flex items-center gap-3">
                    <div className="w-10 text-xs font-semibold text-muted">{m.label}</div>
                    <div className="flex-1">
                      <ProgressBar pct={rt} color={col} h={6} />
                    </div>
                    <div className="text-[11px] font-mono text-muted w-16 text-right">
                      {m.success}/{m.total} · {Math.round(rt * 100)}%
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        <Card>
          <SectionTitle>All entries</SectionTitle>
          <div className="flex flex-wrap gap-1">
            {[...records]
              .sort((a, b) => b.d.localeCompare(a.d))
              .map((e, i) => {
                const bg =
                  e.s === 'success'
                    ? 'bg-success/15 text-success border-success/30'
                    : e.s === 'fail'
                      ? 'bg-danger/15 text-danger border-danger/30'
                      : 'bg-warn/15 text-warn border-warn/30'
                const glyph = e.s === 'success' ? '✓' : e.s === 'fail' ? '✗' : '→'
                return (
                  <div
                    key={i}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${bg}`}
                  >
                    {e.d} {glyph}
                  </div>
                )
              })}
            {!records.length && (
              <div className="text-xs text-muted">No entries logged for this habit yet.</div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // ── List view ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand">
            Habits
          </div>
          <h1 className="text-[22px] font-bold text-text mt-1 font-mono">
            {habits.length} tracked
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand text-black text-sm font-bold hover:bg-brand-strong transition-colors"
        >
          <Plus size={16} aria-hidden /> Add
        </button>
      </header>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-success" /> Done
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-danger" /> Missed
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-warn" /> Skip
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.06]" /> No data
        </div>
      </div>

      {habits.map((h) => {
        const stats = statsMap[h]
        const rate = stats?.rate || 0
        const col =
          rate >= 70
            ? 'var(--color-success)'
            : rate >= 40
              ? 'var(--color-warn)'
              : 'var(--color-danger)'
        const hLogs = logs.filter((l) => l.h === h)
        return (
          <button
            key={h}
            type="button"
            onClick={() => setSelected(h)}
            className="text-left bg-surface border border-border rounded-[14px] p-4 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-text truncate">{h}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[14px] font-bold font-mono" style={{ color: col }}>
                  {rate}%
                </div>
                <div className="text-[10px] text-muted">
                  🔥 {stats?.current || 0}d
                </div>
              </div>
            </div>
            <MiniHeatmap logs={hLogs} days={90} />
            <div className="flex items-center justify-between mt-2 text-[11px] text-muted">
              <span>
                {stats?.total || 0} entries · {stats?.longest || 0}d best
              </span>
            </div>
          </button>
        )
      })}

      {!habits.length && (
        <Card className="flex flex-col items-center text-center gap-3 py-12">
          <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center">
            <Plus size={20} className="text-brand" aria-hidden />
          </div>
          <div>
            <div className="text-sm font-bold text-text">No habits yet</div>
            <div className="text-xs text-muted mt-1">
              Add your first habit to start tracking streaks.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand text-black text-xs font-bold"
          >
            <Plus size={14} aria-hidden /> Add your first habit
          </button>
        </Card>
      )}

      {/* Add modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-surface border border-border rounded-[14px] p-5 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-bold text-text mb-4">Add new habit</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-muted mb-1">
                  Habit name
                </div>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. System design study"
                  autoFocus
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-brand"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-muted mb-1">
                  Category
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => {
                    const active = newCat === c
                    const col = CAT_COLORS[c] || '#94a3b8'
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCat(c)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors"
                        style={{
                          background: active ? col + '22' : 'transparent',
                          borderColor: active ? col + '55' : 'var(--color-border)',
                          color: active ? col : 'var(--color-muted)',
                        }}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newName.trim()}
                  onClick={() => {
                    if (!newName.trim()) return
                    const col = CAT_COLORS[newCat] || '#94a3b8'
                    void addHabit(newName.trim(), newCat, col, '⭐')
                    setNewName('')
                    setShowAdd(false)
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-brand text-black text-sm font-bold hover:bg-brand-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add habit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
