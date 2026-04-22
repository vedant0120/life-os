import { useState } from 'react'
import { useData } from '../stores/DataContext'

type FitFormState = {
  weight: string
  calories_eaten: string
  calories_burned: string
  note: string
}

// Small empty-state card used across all three trackers. Neutral copy, same
// dark theme as the rest of the app — no hardcoded goals, weights, or
// company targets.
function EmptyTracker({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="card" style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 12 }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{label}</div>
      <div style={{ lineHeight: 1.6 }}>{hint}</div>
    </div>
  )
}

export default function Trackers() {
  const { fitLogs, addFitnessLog } = useData()
  const [tab, setTab] = useState<'dsa' | 'startup' | 'fitness'>('dsa')
  const [showFit, setShowFit] = useState(false)
  const [fitEntry, setFitEntry] = useState<FitFormState>({
    weight: '',
    calories_eaten: '',
    calories_burned: '',
    note: '',
  })

  function handleAddFit() {
    if (!fitEntry.weight) return
    addFitnessLog({
      weight: parseFloat(fitEntry.weight),
      calories_eaten: parseInt(fitEntry.calories_eaten) || 0,
      calories_burned: parseInt(fitEntry.calories_burned) || 0,
      note: fitEntry.note,
    })
    setFitEntry({ weight: '', calories_eaten: '', calories_burned: '', note: '' })
    setShowFit(false)
  }

  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Trackers</div>
        <div className="pt">Progress on big goals</div>
      </div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 16, flexWrap: 'wrap' }}>
        {(
          [
            { id: 'dsa', label: '💻 DSA' },
            { id: 'startup', label: '🚀 Startup' },
            { id: 'fitness', label: '💪 Fitness' },
          ] as const
        ).map((t) => (
          <div
            key={t.id}
            className={'subtab' + (tab === t.id ? ' on' : '')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'dsa' && (
        <EmptyTracker
          label="📚"
          hint="No DSA roadmap yet. This tab is wired up to hold your custom study roadmap — feature coming soon."
        />
      )}

      {tab === 'startup' && (
        <EmptyTracker
          label="🚀"
          hint="No startup milestones yet. This tab is wired up to hold your phase-by-phase project plan — feature coming soon."
        />
      )}

      {tab === 'fitness' && (
        <div>
          <div className="card" style={{ padding: 13, marginBottom: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <div className="st">Weight & Calorie Log</div>
              <button
                className="btn"
                onClick={() => setShowFit(true)}
                style={{
                  background: '#f97316',
                  color: '#fff',
                  padding: '4px 10px',
                  fontFamily: 'inherit',
                }}
              >
                + Log
              </button>
            </div>
            {!fitLogs.length && (
              <div style={{ color: '#555', fontSize: 11, padding: '12px 0' }}>
                No entries yet. Log your first weight reading above to start tracking.
              </div>
            )}
            {[...fitLogs].reverse().map((e, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 9px',
                  borderRadius: 7,
                  background: '#0f0f18',
                  border: '1px solid #1a1a2a',
                  marginBottom: 5,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: '#d4d0c8' }}>{e.date}</div>
                  {e.note && <div style={{ fontSize: 9, color: '#444' }}>{e.note}</div>}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {e.weight && (
                    <div style={{ textAlign: 'right' }}>
                      <div className="st">KG</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>
                        {e.weight}
                      </div>
                    </div>
                  )}
                  {(e.calories_eaten ?? 0) > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div className="st">KCAL</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
                        {e.calories_eaten}
                      </div>
                    </div>
                  )}
                  {(e.calories_burned ?? 0) > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div className="st">BURN</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
                        {e.calories_burned}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showFit && (
            <div className="overlay" onClick={() => setShowFit(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
                  Log Fitness Entry
                </div>
                {(
                  [
                    { k: 'weight', p: 'Weight (kg)' },
                    { k: 'calories_eaten', p: 'Calories eaten' },
                    { k: 'calories_burned', p: 'Calories burned' },
                    { k: 'note', p: 'Note (optional)' },
                  ] as const
                ).map((f) => (
                  <div key={f.k} style={{ marginBottom: 10 }}>
                    <div className="st" style={{ marginBottom: 4 }}>
                      {f.p}
                    </div>
                    <input
                      value={fitEntry[f.k]}
                      onChange={(e) => setFitEntry((x) => ({ ...x, [f.k]: e.target.value }))}
                      placeholder={f.p}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button
                    className="btn"
                    onClick={() => setShowFit(false)}
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
                    onClick={handleAddFit}
                    style={{
                      flex: 1,
                      background: '#f97316',
                      color: '#fff',
                      padding: 9,
                      fontFamily: 'inherit',
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
