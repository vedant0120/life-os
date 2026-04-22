import { useState } from 'react'

const HABIT_TEMPLATES = {
  'DSA & Career': [
    { name: 'Interview Coding', category: 'Career', color: '#3b82f6', icon: '💻', priority: 1, note: 'DSA daily — LeetCode problems' },
    { name: 'Business Case study', category: 'Career', color: '#3b82f6', icon: '💼', priority: 2, note: '1 case/day — business acumen' },
    { name: 'System Design study', category: 'Career', color: '#3b82f6', icon: '🏗️', priority: 3, note: 'Distributed systems concepts' },
  ],
  'Fitness & Health': [
    { name: 'Workout', category: 'Fitness', color: '#f97316', icon: '💪', priority: 1, note: '4-5x/week gym or cardio' },
    { name: 'Diet tracking', category: 'Health', color: '#22c55e', icon: '🥗', priority: 2, note: 'Stay within calorie target' },
    { name: 'No eating junk', category: 'Health', color: '#22c55e', icon: '🚫', priority: 3, note: 'Clean eating for gut health' },
    { name: 'Food log', category: 'Health', color: '#22c55e', icon: '📋', priority: 4, note: 'Log everything — awareness first' },
  ],
  'Mindset & Morning': [
    { name: 'SAVERS', category: 'Mindset', color: '#a855f7', icon: '🧘', priority: 1, note: 'Silence, Affirmations, Visualize, Exercise, Read, Scribe' },
    { name: 'Meditation', category: 'Mindset', color: '#a855f7', icon: '🧘', priority: 2, note: '10-20 min daily mindfulness' },
    { name: 'Journaling', category: 'Mindset', color: '#a855f7', icon: '📓', priority: 3, note: 'Daily reflection and gratitude' },
    { name: 'Reading', category: 'Mindset', color: '#a855f7', icon: '📚', priority: 4, note: '20-30 min daily' },
  ],
  'Startup & Business': [
    { name: 'Work on startup', category: 'Career', color: '#f59e0b', icon: '🚀', priority: 1, note: 'Daily startup tasks' },
    { name: 'Customer calls', category: 'Career', color: '#f59e0b', icon: '📞', priority: 2, note: 'Talk to users regularly' },
    { name: 'Build in public', category: 'Career', color: '#f59e0b', icon: '📢', priority: 3, note: 'Share progress on social' },
  ],
  'Self-Care & Life': [
    { name: 'Skin and Hair-care Routine', category: 'Self-Care', color: '#14b8a6', icon: '✨', priority: 1, note: 'Evening wind-down ritual' },
    { name: 'Laundry', category: 'Life', color: '#94a3b8', icon: '🧺', priority: 2, note: 'Weekly life admin' },
    { name: 'Walk or Hike', category: 'Fitness', color: '#f97316', icon: '🥾', priority: 3, note: 'Outdoor movement and fresh air' },
    { name: 'Photography', category: 'Creative', color: '#ec4899', icon: '📸', priority: 4, note: 'Creative outlet' },
  ],
}

const DSA_TARGETS = [
  { id: 'faang', label: 'FAANG / Top Tech', sub: 'Google, Meta, Amazon, Netflix', color: '#3b82f6' },
  { id: 'quant', label: 'Quant / HFT', sub: 'HRT, Jane Street, Citadel', color: '#f59e0b' },
  { id: 'startup', label: 'Top Startups', sub: 'Series B+, fast-growing companies', color: '#22c55e' },
  { id: 'any', label: 'Any better job', sub: 'Upgrade from current role', color: '#818cf8' },
]

const FITNESS_GOALS = [
  { id: 'lose', label: 'Lose weight & get lean', icon: '📉', color: '#22c55e' },
  { id: 'build', label: 'Build muscle', icon: '💪', color: '#f97316' },
  { id: 'recomp', label: 'Full body recomposition', icon: '⚡', color: '#818cf8' },
  { id: 'endurance', label: 'Endurance & fitness', icon: '🏃', color: '#3b82f6' },
  { id: 'maintain', label: 'Maintain current shape', icon: '✅', color: '#14b8a6' },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '',
    focusAreas: [],
    selectedHabits: [],
    dsaTarget: '',
    fitnessGoal: '',
    currentWeight: '',
    targetWeight: '',
    monthlyIncome: '',
    wakeTime: '5:30',
    partnerEmail: '',
  })

  const STEPS = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'focus', title: 'Focus Areas' },
    { id: 'habits', title: 'Your Habits' },
    { id: 'goals', title: 'Goal Details' },
    { id: 'schedule', title: 'Your Schedule' },
    { id: 'partner', title: 'Accountability' },
    { id: 'done', title: 'Ready!' },
  ]

  const focusAreas = [
    { id: 'dsa', label: 'DSA & Interview Prep', icon: '💻', color: '#3b82f6' },
    { id: 'fitness', label: 'Fitness & Health', icon: '💪', color: '#f97316' },
    { id: 'mindset', label: 'Mindset & Morning Routine', icon: '🧘', color: '#a855f7' },
    { id: 'startup', label: 'Startup / Side Project', icon: '🚀', color: '#f59e0b' },
    { id: 'selfcare', label: 'Self-Care & Lifestyle', icon: '✨', color: '#14b8a6' },
  ]

  const focusToTemplate = { dsa: 'DSA & Career', fitness: 'Fitness & Health', mindset: 'Mindset & Morning', startup: 'Startup & Business', selfcare: 'Self-Care & Life' }

  function toggleFocus(id) {
    setData(d => {
      const areas = d.focusAreas.includes(id) ? d.focusAreas.filter(x => x !== id) : [...d.focusAreas, id]
      // Auto-select habits from template
      const allTemplateHabits = areas.flatMap(a => HABIT_TEMPLATES[focusToTemplate[a]] || [])
      const habitNames = allTemplateHabits.map(h => h.name)
      return { ...d, focusAreas: areas, selectedHabits: habitNames }
    })
  }

  function toggleHabit(name) {
    setData(d => ({
      ...d,
      selectedHabits: d.selectedHabits.includes(name) ? d.selectedHabits.filter(x => x !== name) : [...d.selectedHabits, name],
    }))
  }

  const relevantTemplates = data.focusAreas.map(a => focusToTemplate[a]).filter(Boolean)
  const allRelevantHabits = relevantTemplates.flatMap(t => HABIT_TEMPLATES[t] || [])

  function handleComplete() {
    // Build the final habits list from selected habit names + template data
    const habitData = allRelevantHabits.filter(h => data.selectedHabits.includes(h.name))
    onComplete({ ...data, habitData })
  }

  const inp = (field, placeholder, type = 'text') => (
    <input type={type} value={data[field]} onChange={e => setData(d => ({ ...d, [field]: e.target.value }))} placeholder={placeholder}
      style={{ background: '#0f0f18', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e8e6e1', padding: '10px 14px', fontFamily: 'Georgia, serif', fontSize: 13, outline: 'none', width: '100%' }} />
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e6e1', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#555' }}>Step {step + 1} of {STEPS.length}</div>
            <div style={{ fontSize: 11, color: '#555' }}>{STEPS[step].title}</div>
          </div>
          <div style={{ height: 3, background: '#1a1a2a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#3b82f6,#818cf8)', borderRadius: 2, width: `${(step / (STEPS.length - 1)) * 100}%`, transition: 'width 0.4s ease' }}></div>
          </div>
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#3b82f6,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>◈</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Welcome to Life OS</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>Let's build your personal system in 2 minutes. We'll set up your habits, goals, and connect you with an accountability partner.</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>What should we call you?</div>
              {inp('name', 'Your first name')}
            </div>
            <button onClick={() => data.name.trim() && setStep(1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', width: '100%', fontFamily: 'Georgia, serif', fontSize: 14, cursor: 'pointer', opacity: data.name.trim() ? 1 : 0.4 }}>
              Let's build your system →
            </button>
          </div>
        )}

        {/* Step 1: Focus Areas */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Hey {data.name}! What are you working on?</div>
              <div style={{ fontSize: 12, color: '#666' }}>Select all that apply. We'll build your habit stack from these.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {focusAreas.map(f => {
                const active = data.focusAreas.includes(f.id)
                return (
                  <div key={f.id} onClick={() => toggleFocus(f.id)} style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid ' + (active ? f.color + '66' : '#1e1e2e'), background: active ? f.color + '11' : '#13131a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
                    <span style={{ fontSize: 20 }}>{f.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#e8e6e1' : '#c4c0d8' }}>{f.label}</div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid ' + (active ? f.color : '#2a2a3a'), background: active ? f.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>{active ? '✓' : ''}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ background: '#1a1a2a', color: '#888', border: 'none', borderRadius: 8, padding: '10px', flex: 1, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>Back</button>
              <button onClick={() => data.focusAreas.length > 0 && setStep(2)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', flex: 2, fontFamily: 'Georgia, serif', cursor: 'pointer', opacity: data.focusAreas.length > 0 ? 1 : 0.4 }}>Next: Review habits →</button>
            </div>
          </div>
        )}

        {/* Step 2: Habit Selection */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Your habit stack</div>
              <div style={{ fontSize: 12, color: '#666' }}>We pre-selected based on your goals. Toggle any off you don't need.</div>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto', marginBottom: 20 }}>
              {relevantTemplates.map(tmpl => (
                <div key={tmpl} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{tmpl}</div>
                  {(HABIT_TEMPLATES[tmpl] || []).map(h => {
                    const active = data.selectedHabits.includes(h.name)
                    return (
                      <div key={h.name} onClick={() => toggleHabit(h.name)} style={{ padding: '10px 13px', borderRadius: 8, border: '1px solid ' + (active ? h.color + '44' : '#1a1a2a'), background: active ? h.color + '0d' : '#0f0f18', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, transition: 'all 0.15s' }}>
                        <span style={{ fontSize: 16 }}>{h.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: active ? '#e8e6e1' : '#888' }}>{h.name}</div>
                          <div style={{ fontSize: 9, color: '#555', marginTop: 1 }}>{h.note}</div>
                        </div>
                        <div style={{ width: 16, height: 16, borderRadius: 3, border: '1px solid ' + (active ? h.color : '#2a2a3a'), background: active ? h.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', flexShrink: 0 }}>{active ? '✓' : ''}</div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 14 }}>{data.selectedHabits.length} habits selected · You can always add/remove more later</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ background: '#1a1a2a', color: '#888', border: 'none', borderRadius: 8, padding: '10px', flex: 1, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>Back</button>
              <button onClick={() => setStep(3)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', flex: 2, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>Next: Set your goals →</button>
            </div>
          </div>
        )}

        {/* Step 3: Goal Details */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Let's get specific</div>
              <div style={{ fontSize: 12, color: '#666' }}>Only fill in what's relevant to you.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.focusAreas.includes('dsa') && (
                <div>
                  <div style={{ fontSize: 11, color: '#3b82f6', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>💻 Interview Target</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {DSA_TARGETS.map(t => (
                      <div key={t.id} onClick={() => setData(d => ({ ...d, dsaTarget: t.id }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid ' + (data.dsaTarget === t.id ? t.color + '66' : '#1a1a2a'), background: data.dsaTarget === t.id ? t.color + '11' : '#0f0f18', cursor: 'pointer' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: data.dsaTarget === t.id ? '#e8e6e1' : '#888' }}>{t.label}</div>
                        <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{t.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.focusAreas.includes('fitness') && (
                <div>
                  <div style={{ fontSize: 11, color: '#f97316', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>💪 Fitness Goal</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {FITNESS_GOALS.map(g => (
                      <div key={g.id} onClick={() => setData(d => ({ ...d, fitnessGoal: g.id }))} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid ' + (data.fitnessGoal === g.id ? g.color + '66' : '#1a1a2a'), background: data.fitnessGoal === g.id ? g.color + '11' : '#0f0f18', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span>{g.icon}</span>
                        <span style={{ fontSize: 12, color: data.fitnessGoal === g.id ? '#e8e6e1' : '#888' }}>{g.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, color: '#555', letterSpacing: 1, marginBottom: 5 }}>CURRENT WEIGHT (KG)</div>
                      {inp('currentWeight', 'e.g. 85', 'number')}
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: '#555', letterSpacing: 1, marginBottom: 5 }}>TARGET WEIGHT (KG)</div>
                      {inp('targetWeight', 'e.g. 72', 'number')}
                    </div>
                  </div>
                </div>
              )}
              {(data.focusAreas.includes('startup') || data.focusAreas.includes('dsa')) && (
                <div>
                  <div style={{ fontSize: 11, color: '#f59e0b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>💰 Monthly Income (optional)</div>
                  {inp('monthlyIncome', 'e.g. 7500 (helps with finance planning)')}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setStep(2)} style={{ background: '#1a1a2a', color: '#888', border: 'none', borderRadius: 8, padding: '10px', flex: 1, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>Back</button>
              <button onClick={() => setStep(4)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', flex: 2, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>When do you start your day?</div>
              <div style={{ fontSize: 12, color: '#666' }}>This shapes your morning routine block.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[{ t: '4:30', l: '4:30 AM — Extreme early bird' }, { t: '5:00', l: '5:00 AM — Early bird' }, { t: '5:30', l: '5:30 AM — Early riser (recommended)' }, { t: '6:00', l: '6:00 AM — Morning person' }, { t: '6:30', l: '6:30 AM — Relaxed morning' }, { t: '7:00', l: '7:00 AM — Standard morning' }].map(w => (
                <div key={w.t} onClick={() => setData(d => ({ ...d, wakeTime: w.t }))} style={{ padding: '12px 16px', borderRadius: 9, border: '1px solid ' + (data.wakeTime === w.t ? '#3b82f666' : '#1a1a2a'), background: data.wakeTime === w.t ? '#0a1428' : '#0f0f18', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: data.wakeTime === w.t ? '#e8e6e1' : '#888' }}>{w.l}</span>
                  {data.wakeTime === w.t && <span style={{ color: '#3b82f6', fontSize: 12 }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(3)} style={{ background: '#1a1a2a', color: '#888', border: 'none', borderRadius: 8, padding: '10px', flex: 1, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>Back</button>
              <button onClick={() => setStep(5)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', flex: 2, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 5: Partner */}
        {step === 5 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Got an accountability partner?</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7 }}>If they've already signed up, enter their email to link. You'll see each other's habits in real time and can send reactions. You can also do this later.</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Partner's Email (optional)</div>
              {inp('partnerEmail', 'partner@email.com', 'email')}
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 9, background: '#0a1408', border: '1px solid #1a2a18', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#22c55e', marginBottom: 4 }}>🤝 What you get with a partner</div>
              <div style={{ fontSize: 10, color: '#888', lineHeight: 1.6 }}>Real-time habit visibility · 🔥 fire and 👀 nudge reactions · Streak competitions · Private messaging</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(4)} style={{ background: '#1a1a2a', color: '#888', border: 'none', borderRadius: 8, padding: '10px', flex: 1, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>Back</button>
              <button onClick={() => setStep(6)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', flex: 2, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>
                {data.partnerEmail ? 'Link partner & finish →' : 'Skip & finish →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Done */}
        {step === 6 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>You're all set, {data.name}!</div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7, marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' }}>
              Your system is ready. {data.selectedHabits.length} habits loaded. Wake time set to {data.wakeTime} AM.{data.partnerEmail ? ' We\'ll link your partner as soon as they confirm.' : ''}
            </div>
            <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 10, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Your setup</div>
              {[
                { l: 'Focus areas', v: data.focusAreas.length + ' selected' },
                { l: 'Habits', v: data.selectedHabits.length + ' habits ready' },
                { l: 'Wake time', v: data.wakeTime + ' AM' },
                data.dsaTarget && { l: 'DSA target', v: DSA_TARGETS.find(t => t.id === data.dsaTarget)?.label || '' },
                data.fitnessGoal && { l: 'Fitness goal', v: FITNESS_GOALS.find(g => g.id === data.fitnessGoal)?.label || '' },
                data.partnerEmail && { l: 'Partner', v: data.partnerEmail },
              ].filter(Boolean).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #111' }}>
                  <span style={{ fontSize: 11, color: '#666' }}>{r.l}</span>
                  <span style={{ fontSize: 11, color: '#c4c0d8', fontWeight: 600 }}>{r.v}</span>
                </div>
              ))}
            </div>
            <button onClick={handleComplete} style={{ background: 'linear-gradient(135deg,#3b82f6,#818cf8)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 40px', fontFamily: 'Georgia, serif', fontSize: 15, cursor: 'pointer', width: '100%', fontWeight: 600 }}>
              Open my Life OS →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
