import { WEEKDAY_SCHEDULE, SAT_SCHEDULE, SUN_SCHEDULE } from '../data/constants'

export default function Schedule() {
  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Daily Schedule</div>
        <div className="pt">5:30am Routine · 10am Work Start</div>
      </div>

      {/* Weekday */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#3b82f6',
            marginBottom: 11,
            letterSpacing: 0.5,
          }}
        >
          ⏰ Monday – Friday
        </div>
        {WEEKDAY_SCHEDULE.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 11, marginBottom: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: s.anchor ? '#0a1a2a' : '#13131a',
                  border: '1px solid ' + (s.anchor ? '#3b82f644' : '#1e1e2e'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              {i < WEEKDAY_SCHEDULE.length - 1 && (
                <div style={{ width: 1, height: 18, background: '#1e1e2e', margin: '2px 0' }}></div>
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                <span style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1 }}>
                  {s.time}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: s.anchor ? 700 : 400,
                    color: s.anchor ? '#e8e6e1' : '#c4c0d8',
                  }}
                >
                  {s.task}
                </span>
                {s.anchor && (
                  <span className="tag" style={{ background: '#3b82f622', color: '#3b82f6' }}>
                    PRIORITY
                  </span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: 9, color: '#444' }}>{s.dur}</span>
              </div>
              <div style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {[
          { label: 'Saturday', icon: '🌤', color: '#22c55e', items: SAT_SCHEDULE },
          { label: 'Sunday', icon: '🌿', color: '#a855f7', items: SUN_SCHEDULE },
        ].map(({ label, icon, color, items }) => (
          <div key={label} className="card" style={{ padding: 13 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 11 }}>
              {icon} {label}
            </div>
            {items.map((s, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 9,
                  padding: '8px 10px',
                  borderRadius: 7,
                  background: '#0f0f18',
                  border: '1px solid #1a1a2a',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 9, color: '#555' }}>{s.time}</span>
                  <span style={{ fontSize: 9, color: '#444' }}>{s.dur}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#d4d0c8', marginBottom: 2 }}>
                  {s.icon} {s.task}
                </div>
                <div style={{ fontSize: 9, color: '#555', lineHeight: 1.4 }}>{s.note}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
