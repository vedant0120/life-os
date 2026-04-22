import { HEALTH_FLAGS, PCP_BULLETS } from '../data/constants'

export default function Health() {
  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Health Dashboard</div>
        <div className="pt">Active Condition Monitor</div>
      </div>

      {/* Current medical status */}
      <div
        style={{
          background: '#0d0a0a',
          border: '1px solid #3a1a1a',
          borderRadius: 9,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: '#ef4444',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 9,
            fontWeight: 700,
          }}
        >
          🏥 Current Medical Status
        </div>
        {[
          {
            l: 'Primary Condition',
            v: 'Gut Motility Disorder',
            sub: 'Post H.pylori treatment (Aug 2025)',
          },
          {
            l: 'Current Medications',
            v: 'Rifaximin · Prucalopride · Sompraz-L',
            sub: 'Started mid-Feb 2026',
          },
          {
            l: 'Supplements',
            v: 'B12 + D3+K daily',
            sub: 'Sublingual methylcobalamin recommended',
          },
          { l: 'Last CRP', v: '5.87 — elevated', sub: 'Ongoing gut inflammation' },
          { l: 'Last B12', v: '327 — suboptimal', sub: 'Optimal: 500-900' },
          {
            l: 'Ferritin',
            v: 'NEVER TESTED ⚠️',
            sub: 'Urgent — likely cause of fatigue/brain fog',
          },
          {
            l: 'Testosterone/Prolactin',
            v: 'Not yet tested ⚠️',
            sub: 'Levosulpiride may be causing suppression',
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '7px 0',
              borderBottom: '1px solid #1a0a0a',
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: '#c4c0d8' }}>{s.l}</div>
              <div style={{ fontSize: 9, color: '#555', marginTop: 1 }}>{s.sub}</div>
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: s.v.includes('⚠️') ? '#ef4444' : '#888',
                textAlign: 'right',
                maxWidth: '45%',
                flexShrink: 0,
              }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>

      {/* Action flags */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>
          🚨 Action Flags
        </div>
        {HEALTH_FLAGS.map((f, i) => (
          <div
            key={i}
            style={{
              marginBottom: 8,
              padding: '10px 12px',
              borderRadius: 8,
              background: f.severity === 'high' ? '#1a0808' : '#120e08',
              border: '1px solid ' + (f.severity === 'high' ? '#3a1010' : '#2a1a08'),
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: f.severity === 'high' ? '#ef4444' : '#f59e0b',
                marginBottom: 4,
              }}
            >
              {f.flag}
            </div>
            <div style={{ fontSize: 10, color: '#888', lineHeight: 1.6 }}>{f.action}</div>
          </div>
        ))}
      </div>

      {/* PCP checklist */}
      <div className="card" style={{ padding: 13, marginBottom: 12 }}>
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
          📋 What to Tell Your PCP — Bring This List
        </div>
        {PCP_BULLETS.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 7,
              marginBottom: 7,
              padding: '7px 9px',
              borderRadius: 7,
              background: '#0f0f18',
              border: '1px solid #1a1a2a',
            }}
          >
            <div style={{ color: '#3b82f6', fontSize: 11, flexShrink: 0 }}>→</div>
            <div style={{ fontSize: 10, color: '#c4c0d8', lineHeight: 1.5 }}>{t}</div>
          </div>
        ))}
        <div
          style={{
            marginTop: 10,
            padding: '8px 10px',
            borderRadius: 7,
            background: '#0a1a0a',
            border: '1px solid #1a3a1a',
            fontSize: 10,
            color: '#888',
            lineHeight: 1.6,
          }}
        >
          📁 Bring your Indian reports PDFs (August 2025 CBC, LFT, HbA1c, TSH, B12, CRP,
          calprotectin, TTG-IgA) · Also the CECT Enterography referral from Dr. Raj Vigna Venugopal,
          Manipal Hospital Bangalore, February 2026.
        </div>
      </div>

      {/* Symptom tracker */}
      <div className="card" style={{ padding: 13 }}>
        <div
          style={{
            fontSize: 9,
            color: '#f59e0b',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          📊 Symptoms to Monitor Daily
        </div>
        {[
          { symptom: 'Bloating', scale: 'none / mild / moderate / severe' },
          { symptom: 'Constipation', scale: 'none / mild / moderate / severe' },
          { symptom: 'Brain fog', scale: 'clear / mild fog / heavy fog' },
          { symptom: 'Energy level', scale: '1–10' },
          { symptom: 'Dizziness', scale: 'none / occasional / frequent' },
          { symptom: 'Libido', scale: 'normal / reduced / absent' },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #111',
            }}
          >
            <div style={{ fontSize: 11, color: '#c4c0d8' }}>{s.symptom}</div>
            <div style={{ fontSize: 9, color: '#555' }}>{s.scale}</div>
          </div>
        ))}
        <div style={{ fontSize: 9, color: '#444', marginTop: 10 }}>
          Note: Log these in your food log or notes daily. Patterns help your doctor.
        </div>
      </div>
    </div>
  )
}
