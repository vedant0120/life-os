import { MEALS, HEALTH_FLAGS } from '../data/constants'

export default function Diet() {
  const totalProtein = MEALS.reduce((a, m) => a + m.total.protein, 0)
  const totalKcal = MEALS.reduce((a, m) => a + m.total.kcal, 0)

  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Nutrition Plan</div>
        <div className="pt">Lacto-Vegetarian · Non-Soy · Gut-First</div>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 14 }}
      >
        {[
          { l: 'Daily Protein', v: totalProtein + 'g', sub: 'target: 120-130g', c: '#3b82f6' },
          { l: 'Daily Calories', v: totalKcal, sub: 'target: ~1500', c: '#22c55e' },
          { l: 'Gut Protocol', v: 'Active', sub: 'ginger · fenugreek · chia', c: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <div className="st">{s.l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c, marginTop: 5 }}>{s.v}</div>
            <div style={{ fontSize: 9, color: '#444', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Diet flags */}
      <div
        style={{
          background: '#0d0a0a',
          border: '1px solid #3a1a1a',
          borderRadius: 9,
          padding: 11,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: '#ef4444',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 7,
            fontWeight: 700,
          }}
        >
          ⚠️ Diet Flags
        </div>
        <div
          style={{
            padding: '8px 10px',
            borderRadius: 7,
            background: '#1a0a0a',
            border: '1px solid #3a1a1a',
            fontSize: 10,
            color: '#c4c0d8',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: '#f59e0b' }}>Soy sauce swap:</strong> Replace with coconut aminos
          in your stir-fry — same umami, no soy/gluten. Critical for gut healing with active
          inflammation.
          <br />
          <strong style={{ color: '#f59e0b' }}>Legumes + gut:</strong> Introduce lentils/chickpeas
          slowly (start 40g dry, increase weekly). Soak 8hrs before cooking to minimise gas.
          <br />
          <strong style={{ color: '#22c55e' }}>Bottle gourd soup:</strong> Keep this. Ginger +
          fenugreek + jeera is a genuinely therapeutic combo for gut motility.
        </div>
      </div>

      {/* Meal plan */}
      {MEALS.map((meal, i) => (
        <div key={i} className="card" style={{ padding: 13, marginBottom: 9 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 9,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{meal.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e8e6e1' }}>{meal.label}</div>
                <div style={{ fontSize: 9, color: '#555' }}>{meal.time}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div className="st">PROTEIN</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>
                  {meal.total.protein}g
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="st">KCAL</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>
                  {meal.total.kcal}
                </div>
              </div>
            </div>
          </div>
          {meal.items.map((item, j) => (
            <div
              key={j}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #0f0f18',
              }}
            >
              <div style={{ fontSize: 10, color: '#888' }}>{item.food}</div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: '#3b82f6' }}>{item.protein}g</span>
                <span style={{ fontSize: 10, color: '#555' }}>{item.kcal} cal</span>
              </div>
            </div>
          ))}
          {meal.note && (
            <div
              style={{
                fontSize: 9,
                color: '#555',
                marginTop: 7,
                padding: '5px 7px',
                background: '#0f0f18',
                borderRadius: 5,
                lineHeight: 1.5,
              }}
            >
              {meal.note}
            </div>
          )}
        </div>
      ))}

      {/* Gut healing habits */}
      <div className="card" style={{ padding: 13 }}>
        <div
          style={{
            fontSize: 9,
            color: '#22c55e',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          ✅ Gut-Healing Daily Habits
        </div>
        {[
          { h: 'Warm lemon water at 5:30am', note: 'Kickstarts gut motility every morning' },
          { h: 'Chia seeds pre-bed', note: 'Soluble fiber → better morning bowel movement' },
          {
            h: 'Bottle gourd soup (keep!)',
            note: 'Ginger + fenugreek + jeera = therapeutic combo',
          },
          { h: 'Coconut aminos not soy sauce', note: 'Reduces gut inflammation triggers' },
          { h: 'Sublingual B12 methylcobalamin', note: 'Bypasses impaired gut absorption' },
          {
            h: 'Gentle walks on bad days',
            note: 'Movement aids motility without stressing the body',
          },
        ].map((g, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 7,
              padding: '7px 9px',
              borderRadius: 7,
              background: '#0a1408',
              border: '1px solid #1a2a18',
            }}
          >
            <div style={{ color: '#22c55e', fontSize: 11, flexShrink: 0 }}>✓</div>
            <div>
              <div style={{ fontSize: 11, color: '#d4d0c8', fontWeight: 500 }}>{g.h}</div>
              <div style={{ fontSize: 9, color: '#555', marginTop: 1 }}>{g.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
