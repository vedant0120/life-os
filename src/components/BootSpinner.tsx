// Full-viewport boot spinner shown while the session / initial data load
// resolve. Previously inlined in App.tsx; extracted so App.tsx can stay a
// thin orchestrator.
export default function BootSpinner() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>◈</div>
        <div style={{ fontSize: 11, color: '#444', letterSpacing: 2 }}>LOADING...</div>
      </div>
    </div>
  )
}
