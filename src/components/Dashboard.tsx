import { useMemo } from 'react'
import { Ring, LogRow, calcStats, todayStr } from './shared'
import { getMeta } from '../data/constants'
import { useData } from '../stores/DataContext'
import type { HabitStats } from '../types'

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
  // Weight-lost card: derived from fitness logs. With < 2 entries, show "—"
  // since we don't have a hardcoded starting weight to compare against.
  const weightLostLabel =
    fitLogs.length >= 2 && fitLogs[0].weight != null && fitLogs[fitLogs.length - 1].weight != null
      ? `${(fitLogs[0].weight as number) - (fitLogs[fitLogs.length - 1].weight as number)}kg`
      : '—'
  const dsaDone = Object.values(dsaProg).filter(Boolean).length
  const dsaTotal = Object.keys(dsaProg).length
  const startupDone = Object.values(startupProg).filter(Boolean).length
  const startupTotal = Object.keys(startupProg).length

  // Partner today
  const partnerToday = partnerLogs?.filter((l) => l.d === today) || []
  const partnerDone =
    partnerHabits?.filter((h) => partnerToday.find((l) => l.h === h && l.s === 'success')).length ||
    0

  return (
    <div className="fade">
      <div style={{ marginBottom: 16 }}>
        <div className="st">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
        <div className="pt">Let's get after it.</div>
      </div>

      {/* Score cards */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9, marginBottom: 14 }}
      >
        {[
          { l: 'Habit Score', v: overallScore + '%', c: '#818cf8' },
          { l: 'Done Today', v: `${doneToday}/${habits.length}`, c: '#f97316' },
          { l: 'Best Streak', v: bestStreak + 'd', c: '#ec4899' },
          { l: 'Weight Lost', v: weightLostLabel, c: '#22c55e' },
        ].map((c, i) => (
          <div key={i} className="card" style={{ padding: '13px 11px' }}>
            <div className="st">{c.l}</div>
            <div
              style={{ fontSize: 21, fontWeight: 800, color: c.c, lineHeight: 1.1, marginTop: 6 }}
            >
              {c.v}
            </div>
          </div>
        ))}
      </div>

      {/* Progress rings — divisors are dynamic based on the user's actual
          tracker data; if they haven't set up a roadmap yet the ring stays
          at 0% rather than comparing against a hardcoded total. */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 14 }}
      >
        {[
          {
            label: 'DSA Roadmap',
            icon: '💻',
            pct: dsaTotal ? Math.min(Math.round((dsaDone / dsaTotal) * 100), 100) : 0,
            color: '#3b82f6',
            sub: dsaTotal ? `${dsaDone}/${dsaTotal} tasks` : 'No roadmap yet',
          },
          {
            label: 'Startup',
            icon: '🚀',
            pct: startupTotal ? Math.min(Math.round((startupDone / startupTotal) * 100), 100) : 0,
            color: '#f59e0b',
            sub: startupTotal ? `${startupDone}/${startupTotal} tasks` : 'No roadmap yet',
          },
          {
            label: 'Fitness',
            icon: '💪',
            pct: 0,
            color: '#22c55e',
            sub: fitLogs.length ? `${fitLogs.length} logs` : 'No logs yet',
          },
        ].map((c, i) => (
          <div
            key={i}
            className="card"
            style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <Ring pct={c.pct} color={c.color} size={46} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e8e6e1' }}>
                {c.icon} {c.label}
              </div>
              <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Partner today snapshot */}
      {partner && (
        <div
          style={{
            background: '#0a0f1a',
            border: '1px solid #1a2a1a',
            borderRadius: 10,
            padding: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: '#22c55e',
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              🤝 {partner.name || 'Partner'} Today
            </div>
            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>
              {partnerDone}/{partnerHabits?.length || 0} done
            </span>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(partnerHabits || []).slice(0, 8).map((h) => {
              const s = partnerToday.find((l) => l.h === h)?.s
              return (
                <div
                  key={h}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: s === 'success' ? '#16301a' : s === 'fail' ? '#2a1010' : '#1a1a2a',
                    border:
                      '1px solid ' +
                      (s === 'success' ? '#22c55e33' : s === 'fail' ? '#ef444433' : '#2a2a3a'),
                    fontSize: 10,
                    color: s === 'success' ? '#22c55e' : s === 'fail' ? '#ef4444' : '#555',
                  }}
                >
                  {getMeta(h).icon} {h.length > 16 ? h.slice(0, 16) + '…' : h}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Your habits today — single generic list; no anchor distinction
          in the template. */}
      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <div className="st" style={{ marginBottom: 8 }}>
          Your Habits Today
        </div>
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
        {!habits.length && (
          <div style={{ color: '#444', fontSize: 12, textAlign: 'center', padding: 16 }}>
            No habits yet — go to Habits tab to add some.
          </div>
        )}
      </div>

      {/* AI Coach — disabled placeholder pending backend proxy (future epic) */}
      <div
        style={{
          background: '#0d0d1a',
          border: '1px solid #2a2a5a',
          borderRadius: 10,
          padding: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg,transparent,#818cf8,transparent)',
          }}
        ></div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: '#818cf8',
            textTransform: 'uppercase',
          }}
        >
          ◈ AI Coach — coming soon
        </div>
        <div style={{ color: '#2a2a3a', fontSize: 11, marginTop: 8 }}>
          Personalized insights once the backend proxy is wired.
        </div>
      </div>
    </div>
  )
}
