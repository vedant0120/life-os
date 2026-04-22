import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, Session } from '../types'

// ─── State + actions ─────────────────────────────────────────────────────────
// Narrow domain for auth: session, the current user's profile, and a loading
// flag that is true only until Supabase resolves the initial session.
// The separate "data is loading" concern lives in DataContext.
export interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
}

type AuthAction =
  | { type: 'SET_SESSION'; session: Session | null }
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
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    dispatch({ type: 'SET_PROFILE', profile: (data as Profile | null) ?? null })
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!state.session) return
    await fetchProfile(state.session.user.id)
  }, [state.session, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const setProfile = useCallback((p: Profile | null) => {
    dispatch({ type: 'SET_PROFILE', profile: p })
  }, [])

  // Initial session + auth subscription. Mirrors the previous App.tsx effect:
  // getSession() on mount, and keep session in sync via onAuthStateChange.
  // Profile fetch is triggered whenever session becomes available.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: 'SET_SESSION', session })
      if (session) fetchProfile(session.user.id)
      dispatch({ type: 'SET_LOADING', loading: false })
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      dispatch({ type: 'SET_SESSION', session })
      if (session) fetchProfile(session.user.id)
      else dispatch({ type: 'SET_PROFILE', profile: null })
    })
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return (
    <AuthContext.Provider value={{ ...state, signOut, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
