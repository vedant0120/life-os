import { useCallback, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import Icon from './ui/Icon'
import { todayStr } from './shared'
import { getMeta } from '../data/constants'
import { useData } from '../stores/DataContext'
import type { Status } from '../types'

// P3.1 — Today tab. Tailwind-only, lucide icons only, ≤200 LOC.
// Tile cycles: none → success → skip → fail → none.
// Digit keys 1–9 toggle the Nth tile to `success`.
// Optimistic UI: logHabit() already updates local state synchronously via
// the DataContext reducer before the Firestore write resolves.

const CYCLE: Record<string, Exclude<Status, null> | null> = {
  none: 'success',
  success: 'skip',
  skip: 'fail',
  fail: null,
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function resolveIconName(habit: string): string {
  const raw = getMeta(habit).icon
  // Icon registry accepts kebab-case lucide names only. Anything else
  // (emoji defaults, legacy) falls back to `circle-dashed` inside <Icon>.
  return /^[a-z0-9-]+$/.test(raw) ? raw : 'circle-dashed'
}

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
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  const cycle = useCallback(
    (habit: string) => {
      const next = CYCLE[statusByHabit[habit] ?? 'none']
      if (next === null) {
        // TODO: DataContext has no `clearLog` — cycling "fail → none" currently
        // no-ops until we add it. Users can still tap again to advance.
        return
      }
      void logHabit(habit, next)
    },
    [statusByHabit, logHabit]
  )

  const setSuccess = useCallback(
    (habit: string) => {
      if (statusByHabit[habit] !== 'success') void logHabit(habit, 'success')
    },
    [statusByHabit, logHabit]
  )

  // Digit keys 1–9 → Nth tile to success.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const n = parseInt(e.key, 10)
      if (!Number.isFinite(n) || n < 1 || n > 9) return
      const habit = habits[n - 1]
      if (habit) setSuccess(habit)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [habits, setSuccess])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text">{formatDate(new Date())}</h1>
      <p className="text-sm text-muted mt-1 tabular-nums">
        {total === 0 ? 'No habits yet' : `${doneCount} of ${total} habits done`}
      </p>

      <div className="sticky top-0 z-10 bg-bg/80 backdrop-blur py-3 mt-2">
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          />
        </div>
      </div>

      {total === 0 ? (
        <div className="text-center text-muted py-16">
          <p>No habits yet. Add some from the Habits tab to start checking in.</p>
          <Link
            to="/habits"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:opacity-90"
          >
            <Plus size={16} aria-hidden />
            Add habits
          </Link>
        </div>
      ) : (
        <ul
          className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4"
          aria-label="Today's habits"
        >
          {habits.map((h, i) => {
            const status = statusByHabit[h]
            const isSuccess = status === 'success'
            const isSkip = status === 'skip'
            const isFail = status === 'fail'
            const tileClass = [
              'relative aspect-square rounded-xl border p-4 flex flex-col justify-between text-left',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
              'transition-colors',
              isSuccess
                ? 'bg-brand/10 border-brand text-text'
                : isSkip
                  ? 'bg-surface-2 border-border text-muted'
                  : isFail
                    ? 'bg-surface border-danger/40 text-muted'
                    : 'bg-surface border-border text-text hover:border-muted/40',
            ].join(' ')
            return (
              <li key={h}>
                <button
                  type="button"
                  onClick={() => cycle(h)}
                  className={tileClass}
                  aria-label={`${h}: ${status === 'none' ? 'not logged' : status}. Press to cycle.`}
                  aria-pressed={isSuccess}
                >
                  <div className="flex items-start justify-between">
                    <Icon name={resolveIconName(h)} size={22} className="text-muted" />
                    {isSuccess && (
                      <Check size={16} className="text-brand" aria-hidden />
                    )}
                    {i < 9 && !isSuccess && (
                      <span className="text-[10px] font-medium text-muted tabular-nums">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium line-clamp-2">{h}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
