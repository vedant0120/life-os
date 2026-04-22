import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './Nav'
import Dashboard from './Dashboard'
import Today from './Today'
import Habits from './Habits'
import Trackers from './Trackers'
import Finance from './Finance'
import Diet from './Diet'
import Health from './Health'
import Schedule from './Schedule'
import Analytics from './Analytics'
import Accountability from './Accountability'

// Authenticated shell: sticky Nav + route outlet. Split out of App.tsx so the
// top-level file stays a thin orchestrator.
export default function AuthedShell() {
  return (
    <div style={{ flex: 1, minHeight: '100vh', background: '#0a0a0f', color: '#e8e6e1' }}>
      <Nav />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/trackers" element={<Trackers />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/health" element={<Health />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/accountability" element={<Accountability />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
