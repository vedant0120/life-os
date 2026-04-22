export default function Diet() {
  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Nutrition Plan</div>
        <div className="pt">Your meal plan</div>
      </div>
      <div
        className="card"
        style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 12 }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>🥗</div>
        <div style={{ lineHeight: 1.6 }}>
          Your meal plan goes here. Feature coming soon — you'll be able to log meals, set protein
          and calorie targets, and track your daily nutrition.
        </div>
      </div>
    </div>
  )
}
