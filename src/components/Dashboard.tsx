import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import { Ring, LogRow, calcStats, todayStr } from './shared'
import { getMeta } from '../data/constants'
import { useData } from '../stores/DataContext'
import type { HabitStats } from '../types'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function last7Dates(): { iso: string; label: string; isToday: boolean }[] {
  const out: { iso: string; label: string; isToday: boolean }[] = []
  const today = new Date()
  const todayIso = today.toISOString().split('T')[0]
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    out.push({ iso, label: DAY_LABELS[d.getDay()], isToday: iso === todayIso })
  }
  return out
}

export default function Dashboard() {
  const {
    habits,
    logs,
    logHabit,
    dsaProg,
    startupProg,
    fitLogs,
    partner,
    partnerLogs,
    partnerHabits,
  } = useData()
  const today = todayStr()

  const statsMap = useMemo(() => {
    const m: Record<string, HabitStats> = {}
    habits.forEach((h) => {
      m[h] = calcStats(logs.filter((l) => l.h === h))
    })
    return m
  }, [habits, logs])

  const todayLogs = logs.filter((l) => l.d === today)
  const getTStatus = (h: string) => todayLogs.find((l) => l.h === h)?.s || null
  const doneToday = habits.filter((h) => getTStatus(h) === 'success').length
  const overallScore = habits.length
    ? Math.round(habits.reduce((a, h) => a + (statsMap[h]?.rate || 0), 0) / habits.length)
    : 0
  const bestStreak = habits.length ? Math.max(...habits.map((h) => statsMap[h]?.longest || 0)) : 0
  const weightLostLabel =
    fitLogs.length >= 2 && fitLogs[0].weight != null && fitLogs[fitLogs.length - 1].weight != null
      ? `${(fitLogs[0].weight as number) - (fitLogs[fitLogs.length - 1].weight as number)}kg`
      : '—'
  const dsaDone = Object.values(dsaProg).filter(Boolean).length
  const dsaTotal = Object.keys(dsaProg).length
  const startupDone = Object.values(startupProg).filter(Boolean).length
  const startupTotal = Object.keys(startupProg).length

  const partnerToday = partnerLogs?.filter((l) => l.d === today) || []
  const partnerDone =
    partnerHabits?.filter((h) => partnerToday.find((l) => l.h === h && l.s === 'success')).length ||
    0

  const days = last7Dates()
  const dayCompletion = days.map((d) => {
    if (!habits.length) return 0
    const dayLogs = logs.filter((l) => l.d === d.iso)
    const succ = habits.filter((h) => dayLogs.find((l) => l.h === h && l.s === 'success')).length
    return Math.round((succ / habits.length) * 100)
  })

  const stats = [
    {
      label: 'Habit Score',
      value: overallScore + '%',
      hint: habits.length ? 'last 14d avg' : 'add a habit to start',
      tone: 'text-brand',
    },
    {
      label: 'Done Today',
      value: `${doneToday}/${habits.length}`,
      hint: habits.length ? 'tap to log →' : 'no habits yet',
      tone: 'text-warn',
    },
    {
      label: 'Best Streak',
      value: bestStreak + 'd',
      hint: bestStreak ? 'keep it going' : 'no streaks yet',
      tone: 'text-text',
    },
    {
      label: 'Weight Lost',
      value: weightLostLabel,
      hint: fitLogs.length ? `${fitLogs.length} logs` : 'no logs yet',
      tone: 'text-success',
    },
  ]

  // Only render trackers that the user has actively populated. Labels stay
  // generic to the underlying schema (DSA/Startup/Fitness are the legacy
  // built-ins) — a future P3.4 user-defined-trackers epic will replace this
  // whole block with whatever the user has pinned.
  const projects = [
    dsaTotal > 0 && {
      label: 'DSA Roadmap',
      icon: '💻',
      pct: Math.min(Math.round((dsaDone / dsaTotal) * 100), 100),
      color: '#3b82f6',
      sub: `${dsaDone} / ${dsaTotal} tasks`,
      to: '/trackers',
    },
    startupTotal > 0 && {
      label: 'Startup',
      icon: '🚀',
      pct: Math.min(Math.round((startupDone / startupTotal) * 100), 100),
      color: '#f59e0b',
      sub: `${startupDone} / ${startupTotal} tasks`,
      to: '/trackers',
    },
    fitLogs.length > 0 && {
      label: 'Fitness',
      icon: '💪',
      pct: 0,
      color: '#22c55e',
      sub: `${fitLogs.length} logs`,
      to: '/health',
    },
  ].filter(Boolean) as Array<{
    label: string
    icon: string
    pct: number
    color: string
    sub: string
    to: string
  }>

  return (
    <div className="fade flex flex-col gap-6">
      {/* Header */}
      <header>
        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted/80">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <h1 className="text-2xl font-semibold text-text mt-1">Let's get after it.</h1>
      </header>

      {/* Score cards */}
      <section
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        aria-label="Daily summary"
      >
        {stats.map((c) => (
          <div
            key={c.label}
            className="rounded-lg bg-surface border border-border p-5 flex flex-col gap-3 min-h-[112px]"
          >
            <div className="text-xs font-semibold tracking-wider uppercase text-text/70">
              {c.label}
            </div>
            <div className={`text-3xl font-bold tabular-nums leading-none ${c.tone}`}>
              {c.value}
            </div>
            <div className="text-xs text-muted mt-auto truncate">{c.hint}</div>
          </div>
        ))}
      </section>

      {/* 7-day strip */}
      <section
        aria-label="Last 7 days completion"
        className="rounded-lg bg-surface border border-border p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted">
            Last 7 days
          </div>
          <Link
            to="/analytics"
            className="text-[11px] text-muted hover:text-text inline-flex items-center gap-1"
          >
            Analytics <ArrowRight size={12} aria-hidden />
          </Link>
        </div>
        <div className="flex items-end gap-2">
          {days.map((d, i) => {
            const pct = dayCompletion[i]
            const intensity =
              pct >= 80 ? 'bg-brand' :
              pct >= 50 ? 'bg-brand/70' :
              pct >= 20 ? 'bg-brand/40' :
              pct > 0 ? 'bg-brand/20' :
              'bg-surface-3'
            return (
              <div key={d.iso} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={`w-full h-10 rounded-md ${intensity} ${
                    d.isToday ? 'ring-2 ring-brand/60 ring-offset-2 ring-offset-surface' : ''
                  }`}
                  title={`${d.iso}: ${pct}%`}
                />
                <div className="text-[10px] font-medium text-muted tabular-nums">{d.label}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Project rings — render only trackers the user has populated;
          otherwise show a single neutral CTA rather than three hardcoded
          placeholders. */}
      {projects.length > 0 ? (
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          aria-label="Your trackers"
        >
          {projects.map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className="group rounded-lg bg-surface border border-border p-4 flex items-center gap-4 hover:border-border-strong transition-colors"
            >
              <Ring pct={p.pct} color={p.color} size={56} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text truncate">
                  <span className="mr-1.5" aria-hidden>{p.icon}</span>
                  {p.label}
                </div>
                <div className="text-xs text-muted mt-1 truncate">{p.sub}</div>
              </div>
              <ArrowRight
                size={14}
                className="text-muted group-hover:text-text transition-colors"
                aria-hidden
              />
            </Link>
          ))}
        </section>
      ) : (
        <Link
          to="/trackers"
          className="group rounded-lg border border-dashed border-border bg-surface/50 p-5 flex items-center gap-4 hover:border-border-strong hover:bg-surface transition-colors"
          aria-label="Set up a tracker"
        >
          <div className="w-12 h-12 shrink-0 rounded-md bg-surface-2 border border-border flex items-center justify-center">
            <Plus size={20} className="text-muted group-hover:text-text" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text">Set up a tracker</div>
            <div className="text-xs text-muted mt-1">
              Add roadmaps, checklists, or numeric logs — they'll appear here with progress rings.
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-muted group-hover:text-text transition-colors"
            aria-hidden
          />
        </Link>
      )}

      {/* Partner today snapshot */}
      {partner && (
        <section className="rounded-lg bg-surface border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-success">
              🤝 {partner.name || 'Partner'} today
            </div>
            <span className="text-xs text-success font-semibold tabular-nums">
              {partnerDone}/{partnerHabits?.length || 0} done
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(partnerHabits || []).slice(0, 8).map((h) => {
              const s = partnerToday.find((l) => l.h === h)?.s
              const cls =
                s === 'success'
                  ? 'bg-success/10 border-success/30 text-success'
                  : s === 'fail'
                    ? 'bg-danger/10 border-danger/30 text-danger'
                    : 'bg-surface-2 border-border text-muted'
              return (
                <div
                  key={h}
                  className={`px-2 py-1 rounded-md border text-[11px] font-medium ${cls}`}
                >
                  <span className="mr-1" aria-hidden>{getMeta(h).icon}</span>
                  {h.length > 18 ? h.slice(0, 18) + '…' : h}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Habits today */}
      <section className="rounded-lg bg-surface border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted">
            Your habits today
          </div>
          {habits.length > 0 && (
            <Link
              to="/today"
              className="text-[11px] text-muted hover:text-text inline-flex items-center gap-1"
            >
              Check in <ArrowRight size={12} aria-hidden />
            </Link>
          )}
        </div>
        {habits.length ? (
          <div className="flex flex-col">
            {habits.map((h) => (
              <LogRow
                key={h}
                habit={h}
                todayStatus={getTStatus(h)}
                stats={statsMap[h]}
                logHabit={logHabit}
                showStats={false}
                isAnchor={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-8 px-4 gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Plus size={18} className="text-brand" aria-hidden />
            </div>
            <div>
              <div className="text-sm font-medium text-text">No habits yet</div>
              <div className="text-[12px] text-muted mt-1">
                Add a few daily habits to start tracking your streaks.
              </div>
            </div>
            <Link
              to="/habits"
              className="inline-flex items-center gap-1.5 mt-1 px-3 py-2 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-strong transition-colors"
            >
              <Plus size={14} aria-hidden /> Add your first habit
            </Link>
          </div>
        )}
      </section>

      {/* AI Coach — disabled placeholder */}
      <section className="relative rounded-lg bg-surface border border-border p-4 overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 shrink-0 rounded-md bg-brand/15 flex items-center justify-center">
            <Sparkles size={16} className="text-brand" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-brand">
                AI Coach
              </div>
              <span className="text-[10px] font-medium text-muted px-1.5 py-0.5 rounded bg-surface-2 border border-border">
                Coming soon
              </span>
            </div>
            <div className="text-[12px] text-muted mt-1">
              Personalized insights once the backend proxy is wired.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
