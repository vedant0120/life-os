export default function Health() {
  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Health Dashboard</div>
        <div className="pt">Personal health tracker</div>
      </div>
      <div
        className="card"
        style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 12 }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>🫀</div>
        <div style={{ lineHeight: 1.6 }}>
          Health tracker coming soon. You'll be able to log symptoms, track medications, and share
          structured notes with your doctor.
        </div>
      </div>
    </div>
  )
}
