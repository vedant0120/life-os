import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { db } from '../lib/db'
import type { AppSession } from '../lib/db'
import type { Profile } from '../types'

// ─── State + actions ─────────────────────────────────────────────────────────
// Narrow domain for auth: session, the current user's profile, and a loading
// flag that is true only until the backend resolves the initial session.
// The separate "data is loading" concern lives in DataContext.
export interface AuthState {
  session: AppSession | null
  profile: Profile | null
  loading: boolean
}

type AuthAction =
  | { type: 'SET_SESSION'; session: AppSession | null }
  | { type: 'SET_PROFILE'; profile: Profile | null }
  | { type: 'SET_LOADING'; loading: boolean }

const initialState: AuthState = { session: null, profile: null, loading: true }

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.session }
    case 'SET_PROFILE':
      return { ...state, profile: action.profile }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  // Allow other providers (DataContext) to update the cached profile when
  // they've fetched / mutated it, so we don't re-fetch needlessly.
  setProfile: (p: Profile | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchProfile = useCallback(async (userId: string) => {
    const p = await db.getProfile(userId)
    dispatch({ type: 'SET_PROFILE', profile: p })
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!state.session) return
    await fetchProfile(state.session.userId)
  }, [state.session, fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    await db.signInWithPassword(email, password)
  }, [])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    await db.signUp(email, password, name)
  }, [])

  const signOut = useCallback(async () => {
    await db.signOut()
  }, [])

  const setProfile = useCallback((p: Profile | null) => {
    dispatch({ type: 'SET_PROFILE', profile: p })
  }, [])

  // Initial session + auth subscription. Mirrors the previous App.tsx effect:
  // getSession() on mount, and keep session in sync via onAuthStateChange.
  // Profile fetch is triggered whenever session becomes available.
  useEffect(() => {
    db.getSession().then((session) => {
      dispatch({ type: 'SET_SESSION', session })
      if (session) fetchProfile(session.userId)
      dispatch({ type: 'SET_LOADING', loading: false })
    })
    const unsubscribe = db.onAuthStateChange((session) => {
      dispatch({ type: 'SET_SESSION', session })
      if (session) fetchProfile(session.userId)
      else dispatch({ type: 'SET_PROFILE', profile: null })
    })
    return unsubscribe
  }, [fetchProfile])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
