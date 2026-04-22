import { useMemo } from 'react'
import { LogRow, calcStats, todayStr } from './shared'
import { ANCHOR_HABITS, CATEGORIES, CAT_COLORS, getMeta } from '../data/constants'
import type { SharedProps, HabitStats } from '../types'

type TodayProps = Pick<SharedProps, 'habits' | 'logs' | 'logHabit'> & Partial<SharedProps>

export default function Today({ habits, logs, logHabit }: TodayProps) {
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

      <div
        style={{
          background: '#09111e',
          border: '1px solid #1a2a4a',
          borderRadius: 10,
          padding: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: '#3b82f6',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 9,
            fontWeight: 700,
          }}
        >
          ⭐ Anchor Habits — Do These First
        </div>
        {ANCHOR_HABITS.map((h) => (
          <LogRow
            key={h}
            habit={h}
            todayStatus={getTStatus(h)}
            stats={statsMap[h]}
            logHabit={logHabit}
            showStats={true}
            isAnchor={true}
          />
        ))}
      </div>

      {CATEGORIES.map((cat) => {
        const ch = habits.filter((h) => getMeta(h).cat === cat && !ANCHOR_HABITS.includes(h))
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

      {isWeekend && (
        <div
          style={{
            background: '#0a1a0a',
            border: '1px solid #1a3a1a',
            borderRadius: 10,
            padding: 12,
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: '#22c55e',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 9,
              fontWeight: 700,
            }}
          >
            🌤 Weekend Intentions
          </div>
          {[
            { icon: '🥾', t: 'Walk or Hike', n: '60-90 min outdoor — ~400 kcal' },
            { icon: '🌿', t: 'Vegan Café Lunch', n: 'Nourishing treat — enjoy it' },
            { icon: '🥦', t: 'Sunday Meal Prep', n: 'Prep 5 days of lunches' },
            { icon: '📊', t: 'Weekly Review', n: 'Review DSA + habits + plan next week' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 9,
                marginBottom: 8,
                padding: '7px 9px',
                borderRadius: 7,
                background: '#0a1408',
                border: '1px solid #1a2a18',
              }}
            >
              <span style={{ fontSize: 15 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: '#d4d0c8' }}>{s.t}</div>
                <div style={{ fontSize: 9, color: '#555', marginTop: 1 }}>{s.n}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
