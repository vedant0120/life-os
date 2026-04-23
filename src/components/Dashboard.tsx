import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import { Card, SectionTitle, Ring, ProgressBar, Badge } from './ui/primitives'
import { calcStats, todayStr } from './shared'
import { useData } from '../stores/DataContext'
import type { HabitStats } from '../types'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function Dashboard() {
  const { habits, logs, dsaProg, startupProg, fitLogs, partner, partnerLogs, partnerHabits } =
    useData()
  const today = todayStr()

  const statsMap = useMemo(() => {
    const m: Record<string, HabitStats> = {}
    habits.forEach((h) => {
      m[h] = calcStats(logs.filter((l) => l.h === h))
    })
    return m
  }, [habits, logs])

  // ── Today summary ──────────────────────────────────────────────────────
  const todayLogs = logs.filter((l) => l.d === today)
  const doneToday = habits.filter(
    (h) => todayLogs.find((l) => l.h === h)?.s === 'success'
  ).length
  const totalToday = habits.length
  const todayPct = totalToday ? doneToday / totalToday : 0

  // ── Weekly rate (last 7 days) ──────────────────────────────────────────
  const last7: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last7.push(d.toISOString().slice(0, 10))
  }
  const weekLogs = logs.filter((l) => last7.includes(l.d))
  const weekSuccess = weekLogs.filter((l) => l.s === 'success').length
  const weekTotal = weekLogs.filter((l) => l.s !== null && l.s !== 'skip').length
  const weekPct = weekTotal ? weekSuccess / weekTotal : 0

  // ── Project rings ──────────────────────────────────────────────────────
  const dsaDone = Object.values(dsaProg).filter(Boolean).length
  const dsaTotal = Object.keys(dsaProg).length
  const startupDone = Object.values(startupProg).filter(Boolean).length
  const startupTotal = Object.keys(startupProg).length

  // ── Weight ─────────────────────────────────────────────────────────────
  const firstWeight = fitLogs[0]?.weight ?? null
  const latestWeight = fitLogs[fitLogs.length - 1]?.weight ?? null
  const weightLabel = latestWeight != null ? `${latestWeight}kg` : '—'

  // ── Anchor-ish: top-3 habits by success rate as a proxy until we
  // have a real per-habit anchor flag backed by Firestore. ────────────────
  const anchorHabits = [...habits]
    .sort((a, b) => (statsMap[b]?.rate || 0) - (statsMap[a]?.rate || 0))
    .slice(0, 5)

  // ── Partner ────────────────────────────────────────────────────────────
  const partnerToday = partnerLogs?.filter((l) => l.d === today) || []
  const partnerDone =
    partnerHabits?.filter((h) => partnerToday.find((l) => l.h === h && l.s === 'success'))
      .length || 0

  // ── 7-day heatmap strip ────────────────────────────────────────────────
  const dayCompletion = last7.map((iso) => {
    if (!habits.length) return 0
    const dayLogs = logs.filter((l) => l.d === iso)
    const succ = habits.filter((h) => dayLogs.find((l) => l.h === h && l.s === 'success'))
      .length
    return succ / habits.length
  })

  const stats = [
    {
      label: 'Today',
      val: totalToday ? `${doneToday}/${totalToday}` : '—',
      pct: todayPct,
      color: 'var(--color-success)',
    },
    {
      label: 'Week',
      val: weekTotal ? `${Math.round(weekPct * 100)}%` : '—',
      pct: weekPct,
      color: 'var(--color-info)',
    },
    {
      label: 'DSA',
      val: dsaTotal ? `${dsaDone}/${dsaTotal}` : '—',
      pct: dsaTotal ? dsaDone / dsaTotal : 0,
      color: 'var(--color-warn)',
    },
    {
      label: 'Weight',
      val: weightLabel,
      pct:
        firstWeight != null && latestWeight != null && firstWeight > 0
          ? Math.max(0, Math.min(1, (firstWeight - latestWeight) / Math.max(1, firstWeight - 78)))
          : 0,
      color: 'var(--color-plum)',
    },
  ]

  const projects = [
    dsaTotal > 0 && {
      label: 'DSA Roadmap',
      icon: '💻',
      pct: dsaDone / dsaTotal,
      color: 'var(--color-info)',
      sub: `${dsaDone} / ${dsaTotal} tasks`,
      to: '/trackers',
    },
    startupTotal > 0 && {
      label: 'Startup',
      icon: '🚀',
      pct: startupDone / startupTotal,
      color: 'var(--color-plum)',
      sub: `${startupDone} / ${startupTotal} tasks`,
      to: '/trackers',
    },
    fitLogs.length > 0 && {
      label: 'Fitness',
      icon: '💪',
      pct: 0,
      color: 'var(--color-success)',
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
    <div className="flex flex-col gap-4">
      {/* Header */}
      <header>
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand">
          Life OS
        </div>
        <h1 className="text-[22px] font-bold text-text mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </h1>
      </header>

      {/* Stat rings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {stats.map((s) => (
          <Card key={s.label} className="text-center" style={{ padding: 14 }}>
            <div className="flex justify-center mb-2">
              <Ring pct={s.pct} size={56} color={s.color}>
                <span
                  className="text-[11px] font-bold font-mono"
                  style={{ color: s.color }}
                >
                  {s.val}
                </span>
              </Ring>
            </div>
            <div className="text-[11px] font-semibold text-muted">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Anchor habits */}
      {habits.length > 0 ? (
        <Card>
          <SectionTitle>Anchor habits — streaks</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {anchorHabits.map((h) => {
              const st = statsMap[h]
              const streak = st?.current ?? 0
              const glowing = streak >= 3
              return (
                <div key={h} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: 'var(--color-brand)',
                      boxShadow: glowing ? '0 0 8px var(--color-brand)' : 'none',
                    }}
                  />
                  <span className="flex-1 text-[13px] font-medium text-text truncate">{h}</span>
                  <span
                    className={`text-[13px] font-bold font-mono ${
                      glowing ? 'text-success' : 'text-muted'
                    }`}
                  >
                    {streak}d
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center text-center gap-3 py-8">
          <div className="w-10 h-10 rounded-full bg-brand/15 flex items-center justify-center">
            <Plus size={18} className="text-brand" aria-hidden />
          </div>
          <div>
            <div className="text-sm font-semibold text-text">No habits yet</div>
            <div className="text-xs text-muted mt-1">
              Add a few daily habits to start tracking streaks.
            </div>
          </div>
          <Link
            to="/habits"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand text-black text-xs font-bold hover:bg-brand-strong transition-colors"
          >
            <Plus size={14} aria-hidden /> Add your first habit
          </Link>
        </Card>
      )}

      {/* 7-day strip */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Last 7 days</SectionTitle>
          <Link
            to="/analytics"
            className="text-[11px] text-muted hover:text-text inline-flex items-center gap-1"
          >
            Analytics <ArrowRight size={12} aria-hidden />
          </Link>
        </div>
        <div className="flex items-end gap-1.5">
          {last7.map((iso, i) => {
            const pct = dayCompletion[i]
            const date = new Date(iso)
            const isToday = iso === today
            const bg =
              pct >= 0.8
                ? 'bg-success'
                : pct >= 0.5
                  ? 'bg-success/70'
                  : pct >= 0.2
                    ? 'bg-success/40'
                    : pct > 0
                      ? 'bg-success/20'
                      : 'bg-white/[0.04]'
            return (
              <div key={iso} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={`w-full h-10 rounded-md ${bg} ${
                    isToday ? 'ring-2 ring-brand/60 ring-offset-2 ring-offset-surface' : ''
                  }`}
                  title={`${iso}: ${Math.round(pct * 100)}%`}
                />
                <div className="text-[10px] font-mono text-muted">{DAY_LABELS[date.getDay()]}</div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Project rings */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {projects.map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className="group bg-surface border border-border rounded-[14px] p-4 flex items-center gap-4 hover:border-border-strong transition-colors"
            >
              <Ring pct={p.pct} size={52} color={p.color}>
                <span
                  className="text-[11px] font-bold font-mono"
                  style={{ color: p.color }}
                >
                  {Math.round(p.pct * 100)}%
                </span>
              </Ring>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-text truncate">
                  <span className="mr-1.5" aria-hidden>
                    {p.icon}
                  </span>
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
        </div>
      ) : (
        <Link
          to="/trackers"
          className="group rounded-[14px] border border-dashed border-border bg-surface/50 p-4 flex items-center gap-4 hover:border-border-strong hover:bg-surface transition-colors"
        >
          <div className="w-12 h-12 shrink-0 rounded-md bg-surface-2 border border-border flex items-center justify-center">
            <Plus size={20} className="text-muted group-hover:text-text" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-text">Set up a tracker</div>
            <div className="text-xs text-muted mt-1">
              Add roadmaps, checklists, or numeric logs — they'll appear here with progress rings.
            </div>
          </div>
          <ArrowRight size={16} className="text-muted group-hover:text-text" aria-hidden />
        </Link>
      )}

      {/* DSA + Startup progress bars (compact) */}
      {(dsaTotal > 0 || startupTotal > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {dsaTotal > 0 && (
            <Card>
              <SectionTitle>DSA progress</SectionTitle>
              <ProgressBar pct={dsaDone / dsaTotal} color="var(--color-info)" h={8} />
              <div className="text-xs text-muted mt-2">
                {dsaDone} of {dsaTotal} topics covered
              </div>
            </Card>
          )}
          {startupTotal > 0 && (
            <Card>
              <SectionTitle>Startup progress</SectionTitle>
              <ProgressBar pct={startupDone / startupTotal} color="var(--color-plum)" h={8} />
              <div className="text-xs text-muted mt-2">
                {startupDone} of {startupTotal} tasks done
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Partner snapshot */}
      {partner && (
        <Card accent="var(--color-success)">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>🤝 {partner.name || 'Partner'} today</SectionTitle>
            <Badge
              text={`${partnerDone} / ${partnerHabits?.length || 0} done`}
              color="var(--color-success)"
            />
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
                  className={`px-2.5 py-1 rounded-md border text-[11px] font-medium ${cls}`}
                >
                  {h.length > 18 ? h.slice(0, 18) + '…' : h}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* AI Coach placeholder */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 shrink-0 rounded-md bg-brand/15 flex items-center justify-center">
            <Sparkles size={16} className="text-brand" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-brand">
                AI Coach
              </div>
              <Badge text="Coming soon" color="var(--color-muted)" />
            </div>
            <div className="text-xs text-muted mt-1">
              Personalized insights once the backend proxy is wired.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
