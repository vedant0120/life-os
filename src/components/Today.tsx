import { useMemo } from 'react'
import { LogRow, calcStats, todayStr } from './shared'
import { CATEGORIES, CAT_COLORS, getMeta } from '../data/constants'
import { useData } from '../stores/DataContext'
import type { HabitStats } from '../types'

export default function Today() {
  const { habits, logs, logHabit } = useData()
  const today = todayStr()
  const isWeekend = [0, 6].includes(new Date().getDay())

  const statsMap = useMemo(() => {
    const m: Record<string, HabitStats> = {}
    habits.forEach((h) => {
      m[h] = calcStats(logs.filter((l) => l.h === h))
    })
    return m
  }, [habits, logs])

  const todayLogs = logs.filter((l) => l.d === today)
  const getTStatus = (h: string) => todayLogs.find((l) => l.h === h)?.s || null

  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">{isWeekend ? 'Weekend' : 'Weekday'} Check-in</div>
        <div className="pt">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {!habits.length && (
        <div
          className="card"
          style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 12 }}
        >
          No habits yet — add some from the Habits tab to start checking in.
        </div>
      )}

      {CATEGORIES.map((cat) => {
        const ch = habits.filter((h) => getMeta(h).cat === cat)
        if (!ch.length) return null
        const cc = CAT_COLORS[cat] || '#818cf8'
        const done = ch.filter((h) => getTStatus(h) === 'success').length
        return (
          <div key={cat} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <div style={{ width: 3, height: 12, borderRadius: 2, background: cc }}></div>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: cc,
                }}
              >
                {cat}
              </div>
              <div style={{ fontSize: 8, color: '#444' }}>
                {done}/{ch.length}
              </div>
            </div>
            {ch.map((h) => (
              <LogRow
                key={h}
                habit={h}
                todayStatus={getTStatus(h)}
                stats={statsMap[h]}
                logHabit={logHabit}
                showStats={true}
                isAnchor={false}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
