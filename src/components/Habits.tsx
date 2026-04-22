import { useMemo, useState } from 'react'
import { calcStats, last14 } from './shared'
import { getMeta, CATEGORIES } from '../data/constants'
import { useData } from '../stores/DataContext'
import type { HabitStats } from '../types'

export default function Habits() {
  const { habits, logs, addHabit } = useData()
  const [selHabit, setSelHabit] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState('Career')
  const L14 = last14()

  const statsMap = useMemo(() => {
    const m: Record<string, HabitStats> = {}
    habits.forEach((h) => {
      m[h] = calcStats(logs.filter((l) => l.h === h))
    })
    return m
  }, [habits, logs])

  if (selHabit) {
    const habit = selHabit
    const meta = getMeta(habit)
    const records = logs.filter((l) => l.h === habit)
    const stats = calcStats(records)
    const months = [
      { l: 'Mar', n: 3 },
      { l: 'Apr', n: 4 },
      { l: 'May', n: 5 },
      { l: 'Jun', n: 6 },
      { l: 'Jul', n: 7 },
    ]
    return (
      <div className="fade">
        <button
          className="btn"
          onClick={() => setSelHabit(null)}
          style={{
            background: '#1a1a2a',
            color: '#818cf8',
            padding: '6px 12px',
            marginBottom: 14,
            fontFamily: 'inherit',
          }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: meta.col + '22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {meta.icon}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e6e1' }}>{habit}</div>
            <div style={{ display: 'flex', gap: 5, marginTop: 3 }}>
              <span className="tag" style={{ background: meta.col + '22', color: meta.col }}>
                {meta.cat}
              </span>
            </div>
            {meta.note && (
              <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>{meta.note}</div>
            )}
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {[
            { l: 'Rate', v: stats.rate + '%', c: meta.col },
            { l: 'Streak', v: stats.current + 'd', c: '#818cf8' },
            { l: 'Best', v: stats.longest + 'd', c: '#f97316' },
            { l: 'Total', v: stats.total, c: '#22c55e' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 12 }}>
              <div className="st">{s.l}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: s.c, marginTop: 5 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 14, marginBottom: 10 }}>
          <div className="st" style={{ marginBottom: 12 }}>
            Monthly
          </div>
          {months.map(({ l, n }) => {
            const ml = records.filter((r) => new Date(r.d).getMonth() + 1 === n)
            if (!ml.length) return null
            const s = ml.filter((r) => r.s === 'success').length
            const t = ml.filter((r) => r.s !== 'skip').length
            const rt = t > 0 ? Math.round((s / t) * 100) : 0
            return (
              <div
                key={l}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}
              >
                <div style={{ width: 22, fontSize: 10, color: '#666' }}>{l}</div>
                <div className="bar" style={{ flex: 1 }}>
                  <div
                    className="fill"
                    style={{
                      width: rt + '%',
                      background: rt >= 70 ? meta.col : rt >= 40 ? '#f59e0b' : '#ef4444',
                    }}
                  ></div>
                </div>
                <div style={{ fontSize: 10, color: '#888', width: 55, textAlign: 'right' }}>
                  {s}/{t} · {rt}%
                </div>
              </div>
            )
          })}
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="st" style={{ marginBottom: 10 }}>
            All entries
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[...records]
              .sort((a, b) => b.d.localeCompare(a.d))
              .map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: '2px 7px',
                    borderRadius: 4,
                    background:
                      e.s === 'success' ? '#16301a' : e.s === 'fail' ? '#2a1010' : '#2a2008',
                    fontSize: 9,
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  <span style={{ color: '#555' }}>{e.d}</span>
                  <span
                    style={{
                      color: e.s === 'success' ? '#22c55e' : e.s === 'fail' ? '#ef4444' : '#f59e0b',
                    }}
                  >
                    {e.s === 'success' ? '✓' : e.s === 'fail' ? '✗' : '→'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div>
          <div className="st">All Habits</div>
          <div className="pt">{habits.length} Tracked</div>
        </div>
        <button
          className="btn"
          onClick={() => setShowAdd(true)}
          style={{
            background: '#818cf8',
            color: '#fff',
            padding: '7px 14px',
            fontFamily: 'inherit',
          }}
        >
          + Add
        </button>
      </div>
      {habits.map((h) => {
        const meta = getMeta(h)
        const stats = statsMap[h]
        const hl = logs.filter((l) => l.h === h)
        return (
          <div
            key={h}
            className="card"
            style={{
              padding: 13,
              marginBottom: 7,
              cursor: 'pointer',
              borderColor: '#1e1e2e',
            }}
            onClick={() => setSelHabit(h)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: meta.col + '22',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {meta.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#c4c0d8',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </div>
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
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color:
                      stats?.rate >= 70 ? '#22c55e' : stats?.rate >= 40 ? '#f59e0b' : '#ef4444',
                  }}
                >
                  {stats?.rate || 0}%
                </div>
                <div style={{ fontSize: 9, color: '#444' }}>🔥{stats?.current || 0}d</div>
              </div>
            </div>
          </div>
        )
      })}
      {!habits.length && (
        <div style={{ textAlign: 'center', padding: 40, color: '#444' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 12 }}>No habits yet. Add your first habit above.</div>
        </div>
      )}

      {showAdd && (
        <div className="overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Add New Habit</div>
            <div style={{ marginBottom: 10 }}>
              <div className="st" style={{ marginBottom: 4 }}>
                Habit Name
              </div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. System Design study"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="st" style={{ marginBottom: 4 }}>
                Category
              </div>
              <select value={newCat} onChange={(e) => setNewCat(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => setShowAdd(false)}
                style={{
                  flex: 1,
                  background: '#1a1a2a',
                  color: '#888',
                  padding: 9,
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={() => {
                  addHabit(newName, newCat, '#818cf8', '⭐')
                  setNewName('')
                  setShowAdd(false)
                }}
                style={{
                  flex: 1,
                  background: '#818cf8',
                  color: '#fff',
                  padding: 9,
                  fontFamily: 'inherit',
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
