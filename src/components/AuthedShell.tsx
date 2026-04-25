import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Command, Settings as SettingsIcon } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomTabs from './BottomTabs'
import CommandPalette from './ui/CommandPalette'
import Today from './Today'
import Habits from './Habits'
import Trackers from './Trackers'
import Finance from './Finance'
import Diet from './Diet'
import Health from './Health'
import Schedule from './Schedule'
import Analytics from './Analytics'
import Accountability from './Accountability'
import Journal from './Journal'
import Review from './Review'
import Settings from './Settings'

// Authenticated shell:
//   • Persistent sidebar on lg+, bottom tabs on <lg.
//   • Top bar with ⌘K capture button + Settings shortcut.
//   • Default route is /today (Dashboard removed in P1).
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
        <TopBar onOpenPalette={() => setPaletteOpen(true)} />
        <div className="w-full px-6 md:px-10 xl:px-12 2xl:px-16 py-6 md:py-8 flex flex-col gap-6">
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<Today />} />
            <Route path="/review" element={<Review />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/trackers" element={<Trackers />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/health" element={<Health />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/accountability" element={<Accountability />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Navigate to="/today" replace />} />
            <Route path="/welcome" element={<Navigate to="/today" replace />} />
            <Route path="/onboarding" element={<Navigate to="/today" replace />} />
            <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
        </div>
      </main>
      <BottomTabs />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

// ─── Top bar ─────────────────────────────────────────────────────────────────
// Shows current section (subtle), ⌘K capture button, and Settings shortcut.
// Sticky so it stays visible while scrolling long pages.
function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const location = useLocation()
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  const shortcut = isMac ? '⌘K' : 'Ctrl K'
  return (
    <div className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-border">
      <div className="w-full px-6 md:px-10 xl:px-12 2xl:px-16 h-14 flex items-center justify-between gap-3">
        <div className="text-[13px] text-muted font-medium truncate">
          {sectionLabel(location.pathname)}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPalette}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-surface border border-border hover:border-border-strong text-[13px] text-muted hover:text-text transition-colors"
          >
            <Command size={14} aria-hidden />
            <span>Quick capture</span>
            <kbd className="ml-1 px-1.5 py-0.5 rounded bg-surface-2 border border-border text-[11px] font-mono text-muted">
              {shortcut}
            </kbd>
          </button>
          <Link
            to="/settings"
            aria-label="Settings"
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-surface border border-border hover:border-border-strong text-muted hover:text-text transition-colors"
          >
            <SettingsIcon size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}

function sectionLabel(path: string): string {
  const map: Record<string, string> = {
    '/today': 'Today',
    '/review': 'Weekly review',
    '/habits': 'Habits',
    '/trackers': 'Trackers',
    '/journal': 'Journal',
    '/schedule': 'Schedule',
    '/analytics': 'Analytics',
    '/health': 'Health',
    '/diet': 'Diet',
    '/finance': 'Finance',
    '/accountability': 'Accountability',
    '/settings': 'Settings',
  }
  for (const [k, v] of Object.entries(map)) {
    if (path === k || path.startsWith(k + '/')) return v
  }
  return 'Life OS'
}
