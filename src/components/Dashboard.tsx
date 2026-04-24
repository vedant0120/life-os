import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import {
  Card,
  PageHeader,
  SectionTitle,
  Ring,
  ProgressBar,
  Badge,
  StatCard,
} from './ui/primitives'
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

  const todayLogs = logs.filter((l) => l.d === today)
  const doneToday = habits.filter(
    (h) => todayLogs.find((l) => l.h === h)?.s === 'success'
  ).length
  const totalToday = habits.length

  const last7: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last7.push(d.toISOString().slice(0, 10))
  }
  const weekLogs = logs.filter((l) => last7.includes(l.d))
  const weekSuccess = weekLogs.filter((l) => l.s === 'success').length
  const weekTotal = weekLogs.filter((l) => l.s !== null && l.s !== 'skip').length
  const weekPct = weekTotal ? Math.round((weekSuccess / weekTotal) * 100) : 0

  const dsaDone = Object.values(dsaProg).filter(Boolean).length
  const dsaTotal = Object.keys(dsaProg).length
  const startupDone = Object.values(startupProg).filter(Boolean).length
  const startupTotal = Object.keys(startupProg).length

  const latestWeight = fitLogs[fitLogs.length - 1]?.weight ?? null
  const weightLabel = latestWeight != null ? `${latestWeight}kg` : '—'

  const bestStreak = habits.length
    ? Math.max(...habits.map((h) => statsMap[h]?.longest || 0))
    : 0

  const anchorHabits = [...habits]
    .sort((a, b) => (statsMap[b]?.rate || 0) - (statsMap[a]?.rate || 0))
    .slice(0, 5)

  const partnerToday = partnerLogs?.filter((l) => l.d === today) || []
  const partnerDone =
    partnerHabits?.filter((h) => partnerToday.find((l) => l.h === h && l.s === 'success'))
      .length || 0

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
      value: totalToday ? `${doneToday}/${totalToday}` : '—',
      color: 'var(--color-success)',
      hint: totalToday ? `${Math.round((doneToday / totalToday) * 100)}% of habits done` : 'add a habit to start',
    },
    {
      label: 'Week',
      value: weekTotal ? `${weekPct}%` : '—',
      color: 'var(--color-info)',
      hint: weekTotal ? 'last 7-day success rate' : 'log some habits to see weekly',
    },
    {
      label: 'Best streak',
      value: bestStreak ? `${bestStreak}d` : '—',
      color: 'var(--color-plum)',
      hint: bestStreak ? 'longest single-habit run' : 'no streaks yet',
    },
    {
      label: 'Weight',
      value: weightLabel,
      color: 'var(--color-warn)',
      hint: fitLogs.length ? `${fitLogs.length} weigh-ins` : 'no logs yet',
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            color={s.color}
            hint={s.hint}
          />
        ))}
      </div>

      {/* Anchor habits */}
      {habits.length > 0 ? (
        <Card>
          <SectionTitle hint={`${habits.length} tracked`}>Top streaks</SectionTitle>
          <div className="flex flex-col gap-3">
            {anchorHabits.map((h) => {
              const st = statsMap[h]
              const streak = st?.current ?? 0
              const glowing = streak >= 3
              return (
                <div key={h} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      background: 'var(--color-brand)',
                      boxShadow: glowing ? '0 0 10px var(--color-brand)' : 'none',
                    }}
                  />
                  <span className="flex-1 text-[15px] text-text truncate">{h}</span>
                  <span
                    className={`text-[15px] font-semibold font-mono ${
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
        <Card className="flex flex-col items-center text-center gap-3 py-10">
          <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center">
            <Plus size={20} className="text-brand" aria-hidden />
          </div>
          <div>
            <div className="text-base font-semibold text-text">No habits yet</div>
            <div className="text-[14px] text-muted mt-1">
              Add a few daily habits to start tracking streaks.
            </div>
          </div>
          <Link
            to="/habits"
            className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-lg bg-brand text-black text-[14px] font-semibold hover:bg-brand-strong transition-colors"
          >
            <Plus size={16} aria-hidden /> Add your first habit
          </Link>
        </Card>
      )}

      {/* 7-day strip */}
      <Card>
        <SectionTitle
          hint={
            <Link to="/analytics" className="hover:text-text inline-flex items-center gap-1">
              Analytics <ArrowRight size={12} aria-hidden />
            </Link>
          }
        >
          Last 7 days
        </SectionTitle>
        <div className="flex items-end gap-2">
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
              <div key={iso} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div
                  className={`w-full h-14 rounded-lg ${bg} ${
                    isToday ? 'ring-2 ring-brand/60 ring-offset-2 ring-offset-surface' : ''
                  }`}
                  title={`${iso}: ${Math.round(pct * 100)}%`}
                />
                <div className="text-[12px] font-medium text-muted">
                  {DAY_LABELS[date.getDay()]}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Project rings */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className="group bg-surface border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-border-strong transition-colors"
            >
              <Ring pct={p.pct} size={60} color={p.color}>
                <span className="text-[12px] font-semibold font-mono" style={{ color: p.color }}>
                  {Math.round(p.pct * 100)}%
                </span>
              </Ring>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-text truncate">
                  <span className="mr-1.5" aria-hidden>
                    {p.icon}
                  </span>
                  {p.label}
                </div>
                <div className="text-[13px] text-muted mt-1 truncate">{p.sub}</div>
              </div>
              <ArrowRight
                size={16}
                className="text-muted group-hover:text-text transition-colors"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      ) : (
        <Link
          to="/trackers"
          className="group rounded-2xl border border-dashed border-border bg-surface/50 p-5 flex items-center gap-4 hover:border-border-strong hover:bg-surface transition-colors"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-surface-2 border border-border flex items-center justify-center">
            <Plus size={20} className="text-muted group-hover:text-text" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-text">Set up a tracker</div>
            <div className="text-[13px] text-muted mt-1">
              Add roadmaps, checklists, or numeric logs — they'll appear here with progress rings.
            </div>
          </div>
          <ArrowRight size={18} className="text-muted group-hover:text-text" aria-hidden />
        </Link>
      )}

      {/* DSA + Startup progress bars */}
      {(dsaTotal > 0 || startupTotal > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dsaTotal > 0 && (
            <Card>
              <SectionTitle hint={`${dsaDone}/${dsaTotal}`}>DSA progress</SectionTitle>
              <ProgressBar pct={dsaDone / dsaTotal} color="var(--color-info)" h={8} />
              <div className="text-[13px] text-muted mt-3">
                {dsaDone} of {dsaTotal} topics covered
              </div>
            </Card>
          )}
          {startupTotal > 0 && (
            <Card>
              <SectionTitle hint={`${startupDone}/${startupTotal}`}>Startup progress</SectionTitle>
              <ProgressBar pct={startupDone / startupTotal} color="var(--color-plum)" h={8} />
              <div className="text-[13px] text-muted mt-3">
                {startupDone} of {startupTotal} tasks done
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Partner snapshot */}
      {partner && (
        <Card accent="var(--color-success)">
          <SectionTitle
            hint={<Badge text={`${partnerDone} / ${partnerHabits?.length || 0} done`} color="var(--color-success)" />}
          >
            🤝 {partner.name || 'Partner'} today
          </SectionTitle>
          <div className="flex flex-wrap gap-2">
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
                  className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium ${cls}`}
                >
                  {h.length > 20 ? h.slice(0, 20) + '…' : h}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* AI Coach placeholder */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-brand/15 flex items-center justify-center">
            <Sparkles size={18} className="text-brand" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[15px] font-semibold text-text">AI Coach</div>
              <Badge text="Coming soon" color="var(--color-muted)" />
            </div>
            <div className="text-[14px] text-muted mt-1">
              Personalized insights once the backend proxy is wired.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
