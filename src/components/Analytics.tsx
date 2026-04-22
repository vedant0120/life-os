import { useMemo } from 'react'
import { calcStats, last14 } from './shared'
import { ANCHOR_HABITS, getMeta, CAT_COLORS, CATEGORIES } from '../data/constants'

export default function Analytics({ habits, logs }) {
  const L14 = last14()

  const statsMap = useMemo(() => {
    const m = {}
    habits.forEach((h) => {
      m[h] = calcStats(logs.filter((l) => l.h === h))
    })
    return m
  }, [habits, logs])

  const overallScore = habits.length
    ? Math.round(habits.reduce((a, h) => a + (statsMap[h]?.rate || 0), 0) / habits.length)
    : 0

  if (!habits.length)
    return (
      <div className="fade" style={{ textAlign: 'center', padding: 60, color: '#444' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 12 }}>No habit data yet. Start logging to see analytics.</div>
      </div>
    )

  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Analytics</div>
        <div className="pt">Performance Overview — {overallScore}% avg success</div>
      </div>

      {/* Anchor habits */}
      <div className="card" style={{ padding: 13, marginBottom: 12 }}>
        <div className="st" style={{ marginBottom: 12 }}>
          Anchor Habits Performance
        </div>
        {ANCHOR_HABITS.map((h) => {
          const s = statsMap[h] || { rate: 0, current: 0 }
          const meta = getMeta(h)
          return (
            <div key={h} style={{ marginBottom: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: '#c4c0d8' }}>
                  {meta.icon} {h}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.rate >= 70 ? '#22c55e' : s.rate >= 40 ? '#f59e0b' : '#ef4444',
                  }}
                >
                  {s.rate}% · 🔥{s.current}d
                </div>
              </div>
              <div className="bar">
                <div className="fill" style={{ width: s.rate + '%', background: meta.col }}></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* By category */}
      <div className="card" style={{ padding: 13, marginBottom: 12 }}>
        <div className="st" style={{ marginBottom: 12 }}>
          By Category
        </div>
        {CATEGORIES.map((cat) => {
          const ch = habits.filter((h) => getMeta(h).cat === cat)
          if (!ch.length) return null
          const avg = Math.round(ch.reduce((a, h) => a + (statsMap[h]?.rate || 0), 0) / ch.length)
          const cc = CAT_COLORS[cat] || '#818cf8'
          return (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: '#c4c0d8' }}>
                  {cat} <span style={{ color: '#444', fontSize: 9 }}>({ch.length})</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: cc }}>{avg}%</div>
              </div>
              <div className="bar">
                <div className="fill" style={{ width: avg + '%', background: cc }}></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Top vs needs work */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 12 }}>
        {[
          {
            label: '🏆 Top Habits',
            color: '#22c55e',
            sorted: [...habits]
              .sort((a, b) => (statsMap[b]?.rate || 0) - (statsMap[a]?.rate || 0))
              .slice(0, 5),
          },
          {
            label: '⚠️ Needs Work',
            color: '#ef4444',
            sorted: [...habits]
              .sort((a, b) => (statsMap[a]?.rate || 0) - (statsMap[b]?.rate || 0))
              .slice(0, 5),
          },
        ].map(({ label, color, sorted }) => (
          <div key={label} className="card" style={{ padding: 13 }}>
            <div
              style={{
                fontSize: 9,
                color,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 11,
              }}
            >
              {label}
            </div>
            {sorted.map((h) => (
              <div
                key={h}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 7,
                  paddingBottom: 7,
                  borderBottom: '1px solid #111',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: '#c4c0d8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '70%',
                  }}
                >
                  {getMeta(h).icon} {h}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>
                  {statsMap[h]?.rate || 0}%
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Heatmap last 14 days */}
      <div className="card" style={{ padding: 13, marginBottom: 12 }}>
        <div className="st" style={{ marginBottom: 12 }}>
          14-Day Heatmap
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, justifyContent: 'flex-end' }}>
          {L14.map((d) => (
            <div
              key={d}
              style={{
                width: 10,
                fontSize: 7,
                color: '#444',
                textAlign: 'center',
                transform: 'rotate(-45deg)',
                transformOrigin: 'bottom',
              }}
            >
              {d.slice(5)}
            </div>
          ))}
        </div>
        {habits.map((h) => {
          const meta = getMeta(h)
          const hl = logs.filter((l) => l.h === h)
          return (
            <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <div
                style={{
                  fontSize: 10,
                  color: '#888',
                  width: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {meta.icon} {h}
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {L14.map((d, i) => {
                  const r = hl.find((l) => l.d === d)
                  return (
                    <div
                      key={i}
                      className="hcell"
                      title={d}
                      style={{
                        background: !r
                          ? '#1a1a2a'
                          : r.s === 'success'
                            ? meta.col
                            : r.s === 'fail'
                              ? '#ef4444'
                              : '#f59e0b',
                        opacity: !r ? 0.2 : 1,
                      }}
                    ></div>
                  )
                })}
              </div>
              <div style={{ fontSize: 9, color: '#555', marginLeft: 3 }}>
                {statsMap[h]?.rate || 0}%
              </div>
            </div>
          )
        })}
        <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 9, color: '#555' }}>
          <span>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                background: '#22c55e',
                borderRadius: 2,
                marginRight: 4,
              }}
            ></span>
            Success
          </span>
          <span>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                background: '#ef4444',
                borderRadius: 2,
                marginRight: 4,
              }}
            ></span>
            Failed
          </span>
          <span>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                background: '#f59e0b',
                borderRadius: 2,
                marginRight: 4,
              }}
            ></span>
            Skipped
          </span>
          <span>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                background: '#1a1a2a',
                borderRadius: 2,
                marginRight: 4,
              }}
            ></span>
            Not logged
          </span>
        </div>
      </div>

      {/* Full table */}
      <div className="card" style={{ padding: 13 }}>
        <div className="st" style={{ marginBottom: 11 }}>
          Full Summary
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Habit', 'Rate', 'Streak', 'Best', 'Total'].map((h) => (
                <th
                  key={h}
                  style={{
                    fontSize: 8,
                    color: '#444',
                    textAlign: h === 'Habit' ? 'left' : 'right',
                    padding: '0 0 7px',
                    borderBottom: '1px solid #1a1a2a',
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => {
              const s = statsMap[h] || { rate: 0, current: 0, longest: 0, total: 0 }
              const meta = getMeta(h)
              return (
                <tr key={h}>
                  <td
                    style={{
                      padding: '6px 0',
                      borderBottom: '1px solid #0f0f18',
                      fontSize: 10,
                      color: '#c4c0d8',
                    }}
                  >
                    {meta.icon} {h}
                  </td>
                  <td
                    style={{
                      padding: '6px 0',
                      borderBottom: '1px solid #0f0f18',
                      textAlign: 'right',
                      fontSize: 10,
                      fontWeight: 700,
                      color: s.rate >= 70 ? '#22c55e' : s.rate >= 40 ? '#f59e0b' : '#ef4444',
                    }}
                  >
                    {s.rate}%
                  </td>
                  <td
                    style={{
                      padding: '6px 0',
                      borderBottom: '1px solid #0f0f18',
                      textAlign: 'right',
                      fontSize: 10,
                      color: '#818cf8',
                    }}
                  >
                    {s.current}d
                  </td>
                  <td
                    style={{
                      padding: '6px 0',
                      borderBottom: '1px solid #0f0f18',
                      textAlign: 'right',
                      fontSize: 10,
                      color: '#f97316',
                    }}
                  >
                    {s.longest}d
                  </td>
                  <td
                    style={{
                      padding: '6px 0',
                      borderBottom: '1px solid #0f0f18',
                      textAlign: 'right',
                      fontSize: 10,
                      color: '#555',
                    }}
                  >
                    {s.total}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
