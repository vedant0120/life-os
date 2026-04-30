import { useMemo } from 'react'
import { BarChart3, Flame } from 'lucide-react'
import { Card, PageHeader, SectionTitle, ProgressBar } from './ui/primitives'
import { calcStats } from './shared'
import { useData } from '../stores/DataContext'
import type { HabitStats } from '../types'

export default function Analytics() {
  const { habits, logs } = useData()

  const statsMap = useMemo(() => {
    const m: Record<string, HabitStats> = {}
    habits.forEach((h) => {
      m[h] = calcStats(logs.filter((l) => l.h === h))
    })
    return m
  }, [habits, logs])

  const overallScore = habits.length
    ? Math.round(habits.reduce((a, h) => a + (statsMap[h]?.rate || 0), 0) / habits.length)
    : 0

  // Last 30 days completion by day
  const last30: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last30.push(d.toISOString().slice(0, 10))
  }
  const dailyRates = last30.map((date) => {
    const dayLogs = logs.filter((l) => l.d === date)
    const success = dayLogs.filter((l) => l.s === 'success').length
    const countable = dayLogs.filter((l) => l.s !== 'skip').length
    return { date, rate: countable ? success / countable : 0, total: dayLogs.length }
  })

  // Rankings
  const ranked = habits
    .map((h) => {
      const st = statsMap[h]
      return { name: h, rate: st?.rate || 0, total: st?.total || 0, streak: st?.current || 0 }
    })
    .sort((a, b) => b.rate - a.rate)

  if (!habits.length) {
    return (
      <Card className="flex flex-col items-center text-center gap-3 py-16">
        <BarChart3 size={40} className="text-muted" aria-hidden />
        <div className="text-sm font-bold text-text">No data yet</div>
        <div className="text-xs text-muted max-w-xs">
          Add habits and log a few days to see your 30-day completion chart and rankings here.
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        subtitle={`${overallScore}% overall success across ${habits.length} habits`}
      />

      {/* 30-day bar chart */}
      <Card>
        <SectionTitle>30-day completion rate</SectionTitle>
        <div className="flex items-end gap-[3px] h-[100px]">
          {dailyRates.map((d) => {
            const heightPct = Math.max(d.rate * 100, d.total ? 4 : 2)
            const bg =
              d.rate >= 0.7
                ? 'bg-success'
                : d.rate >= 0.4
                  ? 'bg-warn'
                  : d.total
                    ? 'bg-danger'
                    : 'bg-white/[0.06]'
            return (
              <div
                key={d.date}
                title={`${d.date}: ${Math.round(d.rate * 100)}%`}
                className={`flex-1 rounded-t-[2px] transition-[height] ${bg}`}
                style={{ height: `${heightPct}%` }}
              />
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-mono text-muted">{last30[0]}</span>
          <span className="text-[10px] font-mono text-muted">{last30[last30.length - 1]}</span>
        </div>
      </Card>

      {/* Habit rankings */}
      <Card>
        <SectionTitle>Habit rankings</SectionTitle>
        <div className="flex flex-col">
          {ranked.map((h, i) => {
            const col =
              h.rate >= 70
                ? 'var(--color-success)'
                : h.rate >= 40
                  ? 'var(--color-warn)'
                  : 'var(--color-danger)'
            return (
              <div
                key={h.name}
                className="flex items-center gap-3 py-2 border-b border-border last:border-b-0"
              >
                <span
                  className={`w-6 text-xs font-bold tabular-nums text-center ${
                    i < 3 ? 'text-success' : 'text-muted'
                  }`}
                >
                  #{i + 1}
                </span>
                <span className="flex-1 text-[13px] text-text truncate">{h.name}</span>
                <span className="text-[11px] text-muted tabular-nums inline-flex items-center gap-1">
                  <Flame size={11} aria-hidden /> {h.streak}d
                </span>
                <span
                  className="text-[13px] font-bold font-mono w-12 text-right"
                  style={{ color: col }}
                >
                  {h.rate}%
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Per-habit progress */}
      <Card>
        <SectionTitle>Per-habit completion</SectionTitle>
        <div className="flex flex-col gap-4">
          {ranked.map((h) => {
            const col =
              h.rate >= 70
                ? 'var(--color-success)'
                : h.rate >= 40
                  ? 'var(--color-warn)'
                  : 'var(--color-danger)'
            return (
              <div key={h.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-semibold text-text truncate">{h.name}</span>
                  <span className="text-[12px] font-bold font-mono" style={{ color: col }}>
                    {h.rate}%
                  </span>
                </div>
                <ProgressBar pct={h.rate / 100} color={col} h={6} />
                <div className="text-[10px] text-muted mt-1">
                  {h.total} entries tracked
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
