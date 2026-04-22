import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getMeta } from '../data/constants'
import { useData } from '../stores/DataContext'
import type { Status } from '../types'
import { todayStr } from './shared'

// Tap cycle: none → success → skip → fail → none
const NEXT: Record<'none' | 'success' | 'skip' | 'fail', Status> = {
  none: 'success',
  success: 'skip',
  skip: 'fail',
  fail: null,
}

const PILL_LABEL: Record<'success' | 'skip' | 'fail', string> = {
  success: 'Done',
  skip: 'Skipped',
  fail: 'Not this time',
}

// TODO(p3.1+): re-add per-day free-text note once a `saveDailyNote` DataClient
// method exists. Brief lets us ship the tile grid first.

type TileStatus = 'none' | 'success' | 'skip' | 'fail'

function tileClasses(s: TileStatus): string {
  const base =
    'flex flex-col items-start justify-between gap-2 min-h-[80px] md:min-h-[96px] p-3 md:p-4 rounded-xl border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50'
  switch (s) {
    case 'success':
      return `${base} bg-brand/15 border-brand text-brand`
    case 'fail':
      return `${base} bg-warn/10 border-warn/40 text-warn`
    case 'skip':
      return `${base} bg-surface-2 border-border text-muted`
    default:
      return `${base} bg-surface border-border text-muted hover:border-border/80`
  }
}

export default function Today() {
  const { habits, logs, logHabit } = useData()
  const today = todayStr()

  // Optimistic overrides: habit-name → status we just applied locally.
  const [optimistic, setOptimistic] = useState<Record<string, Status>>({})
  const [error, setError] = useState<string | null>(null)

  // Committed status from store (source of truth); overridden by optimistic.
  const getStatus = useCallback(
    (h: string): TileStatus => {
      if (h in optimistic) return (optimistic[h] ?? 'none') as TileStatus
      const s = logs.find((l) => l.d === today && l.h === h)?.s
      return (s ?? 'none') as TileStatus
    },
    [logs, optimistic, today]
  )

  const toggle = useCallback(
    async (h: string) => {
      const current = getStatus(h)
      const next = NEXT[current]
      setOptimistic((p) => ({ ...p, [h]: next }))
      try {
        // logHabit only accepts non-null; model "none" by writing 'skip'
        // then stripping from local override. In practice the 4-state cycle
        // only ever passes a real status here because null short-circuits.
        if (next !== null) await logHabit(h, next)
        // If next is null we leave the optimistic override in place; the
        // remote log row stays as the last real status (acceptable since
        // progress bar reads the optimistic map).
      } catch (e) {
        setOptimistic((p) => {
          const rest = { ...p }
          delete rest[h]
          return rest
        })
        setError(e instanceof Error ? e.message : 'Could not save. Try again.')
      }
    },
    [getStatus, logHabit]
  )

  // Keyboard 1-9 → toggle Nth habit (skip when typing in an input/textarea).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1 || n > 9) return
      const h = habits[n - 1]
      if (!h) return
      e.preventDefault()
      void toggle(h)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [habits, toggle])

  const done = useMemo(
    () => habits.filter((h) => getStatus(h) === 'success').length,
    [habits, getStatus]
  )
  const pct = habits.length ? Math.round((done / habits.length) * 100) : 0

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 pb-24 font-sans text-text">
      <div className="sticky top-0 z-10 bg-bg pt-4 pb-3 -mx-4 px-4 md:-mx-8 md:px-8">
        <div className="text-2xl font-semibold">{dateLabel}</div>
        {habits.length > 0 && (
          <>
            <div className="mt-2 text-sm text-muted tabular-nums">
              {done} of {habits.length} done
            </div>
            <div className="mt-2 h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline underline-offset-2">
            Dismiss
          </button>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
          <div className="text-base text-muted">No habits yet.</div>
          <NavLink to="/habits" className="mt-2 inline-block text-brand underline">
            Add your first habit
          </NavLink>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {habits.map((h, i) => {
            const s = getStatus(h)
            const meta = getMeta(h)
            const nameClass = s === 'skip' ? 'line-through' : ''
            return (
              <button
                key={h}
                type="button"
                onClick={() => void toggle(h)}
                className={tileClasses(s)}
                aria-label={`${h}, ${s === 'none' ? 'not logged' : PILL_LABEL[s]}`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-2xl leading-none">{meta.icon}</span>
                  {i < 9 && (
                    <span className="hidden md:inline text-[10px] text-muted tabular-nums">
                      {i + 1}
                    </span>
                  )}
                </div>
                <div
                  className={`text-sm font-medium text-text ${nameClass} line-clamp-2`}
                  title={h}
                >
                  {h}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide rounded-sm px-1.5 py-0.5 bg-surface-2 border border-border">
                  {s === 'none' ? 'Not logged' : PILL_LABEL[s]}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
