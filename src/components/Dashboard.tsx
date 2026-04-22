import { useMemo, useState } from 'react'
import { Ring, LogRow, calcStats, todayStr } from './shared'
import { ANCHOR_HABITS, getMeta } from '../data/constants'
import type { SharedProps, HabitStats } from '../types'

type DashboardProps = Pick<
  SharedProps,
  | 'habits'
  | 'logs'
  | 'logHabit'
  | 'dsaProg'
  | 'startupProg'
  | 'fitLogs'
  | 'partner'
  | 'partnerLogs'
  | 'partnerHabits'
> &
  Partial<SharedProps>

export default function Dashboard({
  habits,
  logs,
  logHabit,
  dsaProg,
  startupProg,
  fitLogs,
  partner,
  partnerLogs,
  partnerHabits,
}: DashboardProps) {
  const [aiText, setAiText] = useState('')
  const [aiLoad, setAiLoad] = useState(false)
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
  const doneToday = ANCHOR_HABITS.filter((h) => getTStatus(h) === 'success').length
  const overallScore = habits.length
    ? Math.round(habits.reduce((a, h) => a + (statsMap[h]?.rate || 0), 0) / habits.length)
    : 0
  const bestStreak = habits.length ? Math.max(...habits.map((h) => statsMap[h]?.longest || 0)) : 0
  const latestWeight = fitLogs?.[fitLogs.length - 1]?.weight || 100
  const weightLost = 100 - latestWeight
  const dsaDone = Object.values(dsaProg).filter(Boolean).length
  const startupDone = Object.values(startupProg).filter(Boolean).length

  // Partner today
  const partnerToday = partnerLogs?.filter((l) => l.d === today) || []
  const partnerDone =
    partnerHabits?.filter((h) => partnerToday.find((l) => l.h === h && l.s === 'success')).length ||
    0

  async function getAI() {
    setAiLoad(true)
    setAiText('')
    const dsaStats = statsMap['Interview Coding'] || { rate: 0, current: 0 }
    const ctx = `DSA: ${dsaStats.rate}% rate, ${dsaStats.current}d streak. Target: Google/Netflix/HRT Oct 2025.\nWorkout: ${statsMap['Workout']?.rate || 0}% rate. Health: gut motility recovery.\nDiet: ${statsMap['1500 Kcal Diet']?.rate || 0}% rate.\nOverall: ${overallScore}%. Weight: ${latestWeight}kg, goal 78kg.`
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          messages: [
            {
              role: 'user',
              content: `Life coach. Context:\n${ctx}\n\n3 sharp insights (focus on DSA for Google/Netflix/HRT) + 1 challenge this week. Under 140 words. Direct and motivating.`,
            },
          ],
        }),
      })
      const d = await r.json()
      setAiText(d.content?.[0]?.text || 'No response.')
    } catch {
      setAiText('Connection failed. Try again.')
    }
    setAiLoad(false)
  }

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
        <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 2 }}>
          🎯 Google/Netflix/HRT · 💪 Lose 22kg · 🚀 SaaS launch · 🫀 Gut health first
        </div>
      </div>

      {/* Score cards */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9, marginBottom: 14 }}
      >
        {[
          { l: 'Habit Score', v: overallScore + '%', c: '#818cf8' },
          { l: 'Done Today', v: `${doneToday}/${ANCHOR_HABITS.length}`, c: '#f97316' },
          { l: 'Best Streak', v: bestStreak + 'd', c: '#ec4899' },
          { l: 'Weight Lost', v: weightLost + 'kg', c: '#22c55e' },
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

      {/* Progress rings */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 14 }}
      >
        {[
          {
            label: 'DSA Roadmap',
            icon: '💻',
            pct: Math.min(Math.round((dsaDone / 36) * 100), 100),
            color: '#3b82f6',
            sub: '→ Google/Netflix/HRT',
          },
          {
            label: 'Startup',
            icon: '🚀',
            pct: Math.min(Math.round((startupDone / 24) * 100), 100),
            color: '#f59e0b',
            sub: 'idea → launch',
          },
          {
            label: 'Weight Goal',
            icon: '💪',
            pct: Math.min(Math.round((weightLost / 22) * 100), 100),
            color: '#22c55e',
            sub: `${latestWeight}kg → 78kg`,
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

      {/* Anchor habits */}
      <div
        style={{
          background: '#09111e',
          border: '1px solid #1a2a4a',
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: '#3b82f6',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          ⭐ Anchor Habits
        </div>
        {ANCHOR_HABITS.map((h) => (
          <LogRow
            key={h}
            habit={h}
            todayStatus={getTStatus(h)}
            stats={statsMap[h]}
            logHabit={logHabit}
            showStats={false}
            isAnchor={true}
          />
        ))}
      </div>

      {/* Other habits */}
      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <div className="st" style={{ marginBottom: 8 }}>
          Other Habits
        </div>
        {habits
          .filter((h) => !ANCHOR_HABITS.includes(h))
          .map((h) => (
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

      {/* AI Coach */}
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 9,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: '#818cf8',
              textTransform: 'uppercase',
            }}
          >
            ◈ AI Coach
          </div>
          <button
            className="btn"
            onClick={getAI}
            style={{
              background: '#1a1a3a',
              color: '#818cf8',
              padding: '5px 11px',
              border: '1px solid #2a2a5a',
              fontFamily: 'inherit',
            }}
          >
            {aiLoad ? 'Analyzing...' : 'Get Insight'}
          </button>
        </div>
        {aiLoad && (
          <div style={{ color: '#444', fontSize: 11, animation: 'blink 1.5s infinite' }}>
            Analyzing patterns...
          </div>
        )}
        {aiText && (
          <div style={{ color: '#c4c0d8', fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {aiText}
          </div>
        )}
        {!aiText && !aiLoad && (
          <div style={{ color: '#2a2a3a', fontSize: 11 }}>
            Health-aware coaching on DSA, gut recovery, and life goals.
          </div>
        )}
      </div>
    </div>
  )
}
