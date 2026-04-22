import { useState } from 'react'
import { Ring } from './shared'
import { DSA_MONTHS, DSA_REVISION, STARTUP_MONTHS, FITNESS_MILESTONES, WORKOUT_DAYS } from '../data/constants'

export default function Trackers({ dsaProg, startupProg, fitLogs, toggleDSA, toggleStartup, addFitnessLog }) {
  const [tab, setTab] = useState('dsa')
  const [showFit, setShowFit] = useState(false)
  const [fitEntry, setFitEntry] = useState({ weight: '', calories_eaten: '', calories_burned: '', note: '' })

  function monProg(mi, items, prog) {
    const done = items.filter((_, i) => prog[`${mi}-${i}`]).length
    return { done, total: items.length, pct: Math.round(done / items.length * 100) }
  }

  function handleAddFit() {
    if (!fitEntry.weight) return
    addFitnessLog({ weight: parseFloat(fitEntry.weight), calories_eaten: parseInt(fitEntry.calories_eaten) || 0, calories_burned: parseInt(fitEntry.calories_burned) || 0, note: fitEntry.note })
    setFitEntry({ weight: '', calories_eaten: '', calories_burned: '', note: '' })
    setShowFit(false)
  }

  const latestWeight = fitLogs?.[fitLogs.length - 1]?.weight || 100
  const weightLost = 100 - latestWeight

  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}><div className="st">Trackers</div><div className="pt">Progress on big goals</div></div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 16, flexWrap: 'wrap' }}>
        {[{ id: 'dsa', label: '💻 DSA' }, { id: 'startup', label: '🚀 Startup' }, { id: 'fitness', label: '💪 Fitness' }].map(t => (
          <div key={t.id} className={'subtab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {/* DSA */}
      {tab === 'dsa' && (
        <div>
          <div style={{ background: '#09111e', border: '1px solid #1a2a4a', borderRadius: 9, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 8 }}>
              {[{ l: 'Target', v: 'Google / Netflix / HRT', c: '#3b82f6' }, { l: 'Apply from', v: 'October 2025', c: '#f59e0b' }, { l: 'Daily', v: '2.5 hrs · 3-5 problems', c: '#22c55e' }].map((s, i) => (
                <div key={i}><div className="st">{s.l}</div><div style={{ fontSize: 11, fontWeight: 700, color: s.c, marginTop: 3 }}>{s.v}</div></div>
              ))}
            </div>
            <div style={{ fontSize: 9, color: '#555', padding: '6px 8px', background: '#0a0f1a', borderRadius: 6 }}>
              Daily: 15min re-solve → 105min new problems → 30min editorial + pattern journal
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>📚 6-Month Roadmap</div>
            {DSA_MONTHS.map((m, mi) => {
              const prog = monProg(mi, m.topics, dsaProg)
              return (
                <div key={mi} className="card" style={{ padding: 13, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div><div style={{ fontSize: 11, fontWeight: 700, color: '#e8e6e1', marginBottom: 2 }}>{m.label}</div><div style={{ fontSize: 9, color: '#3b82f6' }}>{m.milestone}</div></div>
                    <Ring pct={prog.pct} color={prog.pct === 100 ? '#22c55e' : '#3b82f6'} size={38} />
                  </div>
                  <div className="bar" style={{ marginBottom: 8 }}><div className="fill" style={{ width: prog.pct + '%', background: 'linear-gradient(90deg,#3b82f666,#3b82f6)' }}></div></div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
                    {m.topics.map((t, ti) => {
                      const done = dsaProg[`${mi}-${ti}`]
                      return (
                        <button key={ti} className="btn" onClick={() => toggleDSA(`${mi}-${ti}`)} style={{ background: done ? '#1a2a4a' : '#1a1a2a', color: done ? '#3b82f6' : '#555', border: '1px solid ' + (done ? '#3b82f644' : '#2a2a3a'), padding: '3px 9px', fontFamily: 'inherit', fontSize: 10 }}>
                          {done ? '✓ ' : ''}{t}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 8, color: '#444' }}>{m.target}</div>
                </div>
              )
            })}
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#a855f7', marginBottom: 8 }}>🧠 Revision Strategy — 5 Layers</div>
            {DSA_REVISION.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, padding: '10px 12px', borderRadius: 8, background: '#0f0f18', border: '1px solid #1a1a2a' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#e8e6e1' }}>{r.layer}</div>
                    <span className="tag" style={{ background: '#a855f722', color: '#a855f7' }}>{r.timing}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#888', lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STARTUP */}
      {tab === 'startup' && (
        <div>
          <div style={{ background: '#0f1209', border: '1px solid #2a3a1a', borderRadius: 9, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
              {[{ l: 'Type', v: 'SaaS Product', c: '#f59e0b' }, { l: 'Stage', v: 'Idea Stage', c: '#f97316' }, { l: 'Launch', v: 'Sep 2025', c: '#22c55e' }].map((s, i) => (
                <div key={i}><div className="st">{s.l}</div><div style={{ fontSize: 11, fontWeight: 700, color: s.c, marginTop: 3 }}>{s.v}</div></div>
              ))}
            </div>
          </div>
          {STARTUP_MONTHS.map((m, mi) => {
            const prog = monProg(mi, m.tasks, startupProg)
            return (
              <div key={mi} className="card" style={{ padding: 13, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span className="tag" style={{ background: '#f59e0b22', color: '#f59e0b', marginBottom: 4, display: 'inline-block' }}>{m.phase}</span>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#e8e6e1' }}>{m.label}</div>
                  </div>
                  <Ring pct={prog.pct} color={prog.pct === 100 ? '#22c55e' : '#f59e0b'} size={38} />
                </div>
                <div className="bar" style={{ marginBottom: 9 }}><div className="fill" style={{ width: prog.pct + '%', background: 'linear-gradient(90deg,#f59e0b66,#f59e0b)' }}></div></div>
                {m.tasks.map((t, ti) => {
                  const done = startupProg[`${mi}-${ti}`]
                  return (
                    <div key={ti} onClick={() => toggleStartup(`${mi}-${ti}`)} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, padding: '7px 9px', borderRadius: 7, background: '#0f0f18', border: '1px solid #1a1a2a', cursor: 'pointer' }}>
                      <div className="check" style={{ borderColor: done ? '#f59e0b' : '#2a2a3a', background: done ? '#f59e0b22' : 'transparent', color: '#f59e0b' }}>{done ? '✓' : ''}</div>
                      <div style={{ fontSize: 10, color: done ? '#c4c0d8' : '#666', textDecoration: done ? 'line-through' : 'none' }}>{t}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* FITNESS */}
      {tab === 'fitness' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
            {[{ l: 'Current', v: latestWeight + 'kg', c: '#f97316' }, { l: 'Lost', v: weightLost + 'kg', c: '#22c55e' }, { l: 'To Goal', v: (latestWeight - 78) + 'kg', c: '#ef4444' }, { l: 'Target', v: '78kg', c: '#818cf8' }].map((s, i) => (
              <div key={i} className="card" style={{ padding: 12 }}><div className="st">{s.l}</div><div style={{ fontSize: 18, fontWeight: 800, color: s.c, marginTop: 5 }}>{s.v}</div></div>
            ))}
          </div>

          <div className="card" style={{ padding: 13, marginBottom: 10 }}>
            <div className="st" style={{ marginBottom: 10 }}>Calorie & Workout Targets</div>
            {[{ l: 'Daily calorie target', v: '1,500 kcal', sub: '~900 kcal food deficit', c: '#22c55e' }, { l: 'Workout burn target', v: '400–550 kcal', sub: 'per session · 4-5x/week', c: '#f97316' }, { l: 'Protein target', v: '120-130g/day', sub: '1.3g per kg body weight', c: '#3b82f6' }, { l: 'Bad health days', v: '1,800+ kcal', sub: 'No gym. Walk only. Heal first.', c: '#ef4444' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #111' }}>
                <div><div style={{ fontSize: 11, color: '#c4c0d8' }}>{s.l}</div><div style={{ fontSize: 9, color: '#444', marginTop: 1 }}>{s.sub}</div></div>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.c, flexShrink: 0, marginLeft: 10 }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 13, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="st">Weight Log</div>
              <button className="btn" onClick={() => setShowFit(true)} style={{ background: '#f97316', color: '#fff', padding: '4px 10px', fontFamily: 'inherit' }}>+ Log</button>
            </div>
            {[...fitLogs].reverse().map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 9px', borderRadius: 7, background: '#0f0f18', border: '1px solid #1a1a2a', marginBottom: 5 }}>
                <div><div style={{ fontSize: 10, color: '#d4d0c8' }}>{e.date}</div>{e.note && <div style={{ fontSize: 9, color: '#444' }}>{e.note}</div>}</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {e.weight && <div style={{ textAlign: 'right' }}><div className="st">KG</div><div style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>{e.weight}</div></div>}
                  {e.calories_eaten > 0 && <div style={{ textAlign: 'right' }}><div className="st">KCAL</div><div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{e.calories_eaten}</div></div>}
                  {e.calories_burned > 0 && <div style={{ textAlign: 'right' }}><div className="st">BURN</div><div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{e.calories_burned}</div></div>}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 13, marginBottom: 10 }}>
            <div className="st" style={{ marginBottom: 11 }}>Weight Milestones</div>
            {FITNESS_MILESTONES.map((m, i) => {
              const reached = latestWeight <= m.weight
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9, opacity: reached ? 1 : 0.55 }}>
                  <div style={{ width: 54, fontSize: 9, color: '#666', flexShrink: 0 }}>{m.month}</div>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: reached ? '#22c55e22' : '#1a1a2a', border: '1px solid ' + (reached ? '#22c55e' : '#2a2a3a'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#22c55e', flexShrink: 0 }}>{reached ? '✓' : ''}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: '#c4c0d8', fontWeight: reached ? 600 : 400 }}>{m.weight}kg</span>
                      <span style={{ fontSize: 9, color: '#444' }}>{m.bf}% BF</span>
                    </div>
                    <div className="bar"><div className="fill" style={{ width: reached ? '100%' : Math.max(0, Math.round((100 - latestWeight) / (100 - m.weight) * 100)) + '%', background: '#22c55e' }}></div></div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card" style={{ padding: 13 }}>
            <div className="st" style={{ marginBottom: 11 }}>5-Day Workout Split</div>
            {WORKOUT_DAYS.map((d, i) => (
              <div key={i} style={{ marginBottom: 9, padding: '10px 12px', borderRadius: 8, background: '#0f0f18', border: '1px solid #1a1a2a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#e8e6e1' }}>{d.day}</span>
                      <span className="tag" style={{ background: '#f97316' + (d.focus.includes('Rest') ? '11' : '22'), color: d.focus.includes('Rest') ? '#94a3b8' : '#f97316' }}>{d.focus}</span>
                    </div>
                    <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{d.muscles}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{d.burn}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {d.exercises.map((e, j) => (
                    <div key={j} style={{ padding: '2px 8px', borderRadius: 4, background: '#1a1a2a', border: '1px solid #2a2a3a', fontSize: 9, color: '#888' }}>{e.name} <span style={{ color: '#555' }}>{e.sets}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {showFit && (
            <div className="overlay" onClick={() => setShowFit(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Log Fitness Entry</div>
                {[{ k: 'weight', p: 'Weight (kg)' }, { k: 'calories_eaten', p: 'Calories eaten' }, { k: 'calories_burned', p: 'Calories burned' }, { k: 'note', p: 'Note (optional)' }].map(f => (
                  <div key={f.k} style={{ marginBottom: 10 }}>
                    <div className="st" style={{ marginBottom: 4 }}>{f.p}</div>
                    <input value={fitEntry[f.k]} onChange={e => setFitEntry(x => ({ ...x, [f.k]: e.target.value }))} placeholder={f.p} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button className="btn" onClick={() => setShowFit(false)} style={{ flex: 1, background: '#1a1a2a', color: '#888', padding: 9, fontFamily: 'inherit' }}>Cancel</button>
                  <button className="btn" onClick={handleAddFit} style={{ flex: 1, background: '#f97316', color: '#fff', padding: 9, fontFamily: 'inherit' }}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
