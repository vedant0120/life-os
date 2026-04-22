export default function Schedule() {
  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Daily Schedule</div>
        <div className="pt">Your weekday & weekend plan</div>
      </div>
      <div
        className="card"
        style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 12 }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>🗓️</div>
        <div style={{ lineHeight: 1.6 }}>
          Your daily schedule goes here. Feature coming soon — you'll be able to block out your
          morning routine, deep work windows, and weekend rituals.
        </div>
      </div>
    </div>
  )
}
