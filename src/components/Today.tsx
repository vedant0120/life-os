import { useCallback, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus, SkipForward, X } from 'lucide-react'
import { Card, Ring } from './ui/primitives'
import { todayStr } from './shared'
import { useData } from '../stores/DataContext'
import type { Status } from '../types'

// Tile cycles: none → success → skip → fail → none
const CYCLE: Record<string, Exclude<Status, null> | null> = {
  none: 'success',
  success: 'skip',
  skip: 'fail',
  fail: null,
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

type Btn = 'success' | 'fail' | 'skip'

export default function Today() {
  const { habits, logs, logHabit } = useData()
  const today = todayStr()

  const statusByHabit = useMemo(() => {
    const m: Record<string, Exclude<Status, null> | 'none'> = {}
    habits.forEach((h) => {
      const log = logs.find((l) => l.h === h && l.d === today)
      m[h] = log?.s ?? 'none'
    })
    return m
  }, [habits, logs, today])

  const doneCount = habits.filter((h) => statusByHabit[h] === 'success').length
  const total = habits.length
  const pct = total > 0 ? doneCount / total : 0

  const cycle = useCallback(
    (habit: string) => {
      const next = CYCLE[statusByHabit[habit] ?? 'none']
      if (next === null) return
      void logHabit(habit, next)
    },
    [statusByHabit, logHabit]
  )

  const setStatus = useCallback(
    (habit: string, s: Btn) => {
      if (statusByHabit[habit] !== s) void logHabit(habit, s)
    },
    [statusByHabit, logHabit]
  )

  // Digit keys 1–9 → Nth tile to success
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const n = parseInt(e.key, 10)
      if (!Number.isFinite(n) || n < 1 || n > 9) return
      const habit = habits[n - 1]
      if (habit && statusByHabit[habit] !== 'success') void logHabit(habit, 'success')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [habits, statusByHabit, logHabit])

  return (
    <div className="flex flex-col gap-3">
      {/* Hero */}
      <Card className="flex items-center gap-4" style={{ padding: 16 }}>
        <Ring pct={pct} size={64} color="var(--color-success)" />
        <div className="flex-1 min-w-0">
          <div className="text-xl font-bold text-text font-mono">
            {doneCount}/{total} complete
          </div>
          <div className="text-[13px] text-muted">{formatDate(new Date())}</div>
        </div>
      </Card>

      {total === 0 && (
        <Card className="flex flex-col items-center text-center gap-3 py-10">
          <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center">
            <Plus size={20} className="text-brand" aria-hidden />
          </div>
          <div>
            <div className="text-base font-bold text-text">Nothing to check in yet</div>
            <p className="text-sm text-muted mt-1 max-w-xs">
              Add daily habits from the Habits tab and they'll appear here.
            </p>
          </div>
          <Link
            to="/habits"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand text-black text-sm font-bold hover:bg-brand-strong transition-colors"
          >
            <Plus size={16} aria-hidden /> Add your first habit
          </Link>
        </Card>
      )}

      {habits.map((h, i) => {
        const status = statusByHabit[h]
        const isSuccess = status === 'success'
        const accentColor =
          status === 'success'
            ? 'var(--color-success)'
            : status === 'fail'
              ? 'var(--color-danger)'
              : status === 'skip'
                ? 'var(--color-warn)'
                : 'var(--color-border-strong)'
        return (
          <Card
            key={h}
            style={{
              padding: '12px 14px',
              borderLeft: `3px solid ${accentColor}`,
              boxShadow: isSuccess ? `inset 0 0 20px rgba(34, 197, 94, 0.06)` : 'none',
            }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => cycle(h)}
                className="flex-1 text-left min-w-0 focus-visible:outline-none"
                aria-label={`${h}: ${status === 'none' ? 'not logged' : status}. Press to cycle.`}
              >
                <div className="text-[14px] font-semibold text-text truncate">{h}</div>
                <div className="flex gap-1.5 mt-1 items-center">
                  {i < 9 && (
                    <span className="text-[9px] font-mono text-muted px-1.5 py-0.5 rounded border border-border">
                      {i + 1}
                    </span>
                  )}
                </div>
              </button>
              <div className="flex gap-1.5 items-center shrink-0">
                {(['success', 'fail', 'skip'] as const).map((s) => {
                  const active = status === s
                  const col =
                    s === 'success'
                      ? 'var(--color-success)'
                      : s === 'fail'
                        ? 'var(--color-danger)'
                        : 'var(--color-warn)'
                  const Icon = s === 'success' ? Check : s === 'fail' ? X : SkipForward
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(h, s)}
                      aria-pressed={active}
                      className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                      style={{
                        background: active ? col + '33' : 'rgba(255,255,255,0.04)',
                        color: active ? col : 'var(--color-muted)',
                      }}
                    >
                      <Icon size={14} strokeWidth={2.5} aria-hidden />
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>
        )
      })}

      {total > 0 && (
        <div className="text-[11px] text-muted text-center mt-1">
          Tap a row title to cycle · press{' '}
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-2 text-[10px] font-mono text-text">
            1
          </kbd>
          –
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-2 text-[10px] font-mono text-text">
            9
          </kbd>{' '}
          to mark done
        </div>
      )}
    </div>
  )
}
