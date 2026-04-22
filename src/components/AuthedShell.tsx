import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomTabs from './BottomTabs'
import CommandPalette from './ui/CommandPalette'
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

// Authenticated shell: persistent sidebar on lg+, bottom tabs on <lg,
// plus the ⌘K command palette. Self-managed responsive breakpoints live
// on Sidebar (lg:flex) and BottomTabs (lg:hidden).
export default function AuthedShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen bg-bg text-text font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col pb-14 lg:pb-0">
        <div className="mx-auto w-full max-w-4xl xl:max-w-6xl px-6 md:px-8 py-6 md:py-8">
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
      </main>
      <BottomTabs />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
