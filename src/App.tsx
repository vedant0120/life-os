import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Landing from './components/Landing'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import AuthedShell from './components/AuthedShell'
import BootSpinner from './components/BootSpinner'
import { useAuth } from './stores/AuthContext'
import { useData } from './stores/DataContext'

// NOTE: A dedicated UiProvider was intentionally skipped for Epic 4 — there is
// no non-trivial UI-only state shared across components today (tabs, forms,
// selections all live in their local component). Add one alongside
// AuthProvider / DataProvider in main.tsx if cross-cutting UI state emerges.

export default function App() {
  const { session, loading: authLoading } = useAuth()
  const { loading: dataLoading, needsOnboarding, completeOnboarding } = useData()
  const navigate = useNavigate()
  const location = useLocation()

  if (authLoading || (session && dataLoading)) return <BootSpinner />

  // ── Logged-out: Landing at "/" + sign-in/up at "/auth" ────────────────
  if (!session) {
    const authMode: 'login' | 'signup' =
      new URLSearchParams(location.search).get('mode') === 'signup' ? 'signup' : 'login'
    return (
      <Routes>
        <Route
          path="/"
          element={
            <Landing
              onSignup={() => navigate('/auth?mode=signup')}
              onLogin={() => navigate('/auth?mode=login')}
            />
          }
        />
        <Route
          path="/auth"
          element={<Auth initialMode={authMode} onBack={() => navigate('/')} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // ── Logged-in but no habits yet → Onboarding ──────────────────────────
  if (needsOnboarding) {
    return (
      <Routes>
        <Route
          path="/onboarding"
          element={
            <Onboarding
              onComplete={async (d) => {
                await completeOnboarding(d)
                navigate('/', { replace: true })
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  // ── Fully authenticated + onboarded: delegate to the authed shell. ────
  return <AuthedShell />
}
