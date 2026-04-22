import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type {
  DSAProgress,
  FitnessLog,
  Habit,
  HabitLog,
  OnboardingPayload,
  Profile,
  Reaction,
  StartupProgress,
  Status,
} from '../types'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── State + actions ─────────────────────────────────────────────────────────
export interface DataState {
  habits: Habit[]
  logs: HabitLog[]
  dsaProg: DSAProgress
  startupProg: StartupProgress
  fitLogs: FitnessLog[]
  partner: Profile | null
  partnerHabits: Habit[]
  partnerLogs: HabitLog[]
  reactions: Reaction[]
  loading: boolean
  needsOnboarding: boolean
}

type DataAction =
  | { type: 'SET_HABITS'; habits: Habit[] }
  | { type: 'ADD_HABIT'; name: Habit }
  | { type: 'SET_LOGS'; logs: HabitLog[] }
  | { type: 'UPSERT_LOG'; log: HabitLog }
  | { type: 'SET_DSA'; dsa: DSAProgress }
  | { type: 'TOGGLE_DSA'; key: string; value: boolean }
  | { type: 'SET_STARTUP'; startup: StartupProgress }
  | { type: 'TOGGLE_STARTUP'; key: string; value: boolean }
  | { type: 'SET_FIT_LOGS'; fitLogs: FitnessLog[] }
  | { type: 'ADD_FIT_LOG'; log: FitnessLog }
  | { type: 'SET_PARTNER'; partner: Profile | null }
  | { type: 'SET_PARTNER_HABITS'; habits: Habit[] }
  | { type: 'SET_PARTNER_LOGS'; logs: HabitLog[] }
  | { type: 'UPSERT_PARTNER_LOG'; log: HabitLog }
  | { type: 'SET_REACTIONS'; reactions: Reaction[] }
  | { type: 'PUSH_REACTION'; reaction: Reaction }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_NEEDS_ONBOARDING'; value: boolean }
  | { type: 'RESET' }

const initialState: DataState = {
  habits: [],
  logs: [],
  dsaProg: {},
  startupProg: {},
  fitLogs: [],
  partner: null,
  partnerHabits: [],
  partnerLogs: [],
  reactions: [],
  loading: true,
  needsOnboarding: false,
}

function reducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_HABITS':
      return { ...state, habits: action.habits }
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.name] }
    case 'SET_LOGS':
      return { ...state, logs: action.logs }
    case 'UPSERT_LOG': {
      const f = state.logs.filter((l) => !(l.h === action.log.h && l.d === action.log.d))
      return { ...state, logs: [action.log, ...f] }
    }
    case 'SET_DSA':
      return { ...state, dsaProg: action.dsa }
    case 'TOGGLE_DSA':
      return { ...state, dsaProg: { ...state.dsaProg, [action.key]: action.value } }
    case 'SET_STARTUP':
      return { ...state, startupProg: action.startup }
    case 'TOGGLE_STARTUP':
      return { ...state, startupProg: { ...state.startupProg, [action.key]: action.value } }
    case 'SET_FIT_LOGS':
      return { ...state, fitLogs: action.fitLogs }
    case 'ADD_FIT_LOG':
      return { ...state, fitLogs: [...state.fitLogs, action.log] }
    case 'SET_PARTNER':
      return { ...state, partner: action.partner }
    case 'SET_PARTNER_HABITS':
      return { ...state, partnerHabits: action.habits }
    case 'SET_PARTNER_LOGS':
      return { ...state, partnerLogs: action.logs }
    case 'UPSERT_PARTNER_LOG': {
      const f = state.partnerLogs.filter((l) => !(l.h === action.log.h && l.d === action.log.d))
      return { ...state, partnerLogs: [action.log, ...f] }
    }
    case 'SET_REACTIONS':
      return { ...state, reactions: action.reactions }
    case 'PUSH_REACTION':
      return { ...state, reactions: [action.reaction, ...state.reactions] }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_NEEDS_ONBOARDING':
      return { ...state, needsOnboarding: action.value }
    case 'RESET':
      return { ...initialState, loading: false }
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
interface DataContextValue extends DataState {
  logHabit: (habitName: string, status: Exclude<Status, null>) => Promise<void>
  addHabit: (name: string, category: string, color: string, icon: string) => Promise<void>
  toggleDSA: (key: string) => Promise<void>
  toggleStartup: (key: string) => Promise<void>
  addFitnessLog: (entry: Partial<FitnessLog>) => Promise<void>
  sendReaction: (type: Reaction['type'], habitName: string | null, message: string) => Promise<void>
  linkPartner: (partnerEmail: string) => Promise<{ error?: string; success?: boolean }>
  completeOnboarding: (data: OnboardingPayload) => Promise<void>
  markReactionRead: (reactionId: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { session, setProfile } = useAuth()

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadPartner = useCallback(async (partnerId: string) => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', partnerId).single()
    if (p) {
      dispatch({ type: 'SET_PARTNER', partner: p as Profile })
      const { data: ph } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', partnerId)
        .eq('active', true)
        .order('priority')
      if (ph)
        dispatch({
          type: 'SET_PARTNER_HABITS',
          habits: ph.map((h: { name: string }) => h.name),
        })
      const { data: pl } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', partnerId)
        .order('date', { ascending: false })
        .limit(200)
      if (pl)
        dispatch({
          type: 'SET_PARTNER_LOGS',
          logs: pl.map(
            (l: { habit_name: string; date: string; status: Status }) =>
              ({ h: l.habit_name, d: l.date, s: l.status }) as HabitLog
          ),
        })
    }
  }, [])

  const loadAll = useCallback(
    async (userId: string) => {
      dispatch({ type: 'SET_LOADING', loading: true })
      try {
        const [profileResult, habitsResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId)
            .eq('active', true)
            .order('priority'),
        ])
        if (profileResult.data) {
          setProfile(profileResult.data as Profile)
          if (profileResult.data.partner_id) loadPartner(profileResult.data.partner_id)
        }
        if (!habitsResult.data || habitsResult.data.length === 0) {
          dispatch({ type: 'SET_NEEDS_ONBOARDING', value: true })
          dispatch({ type: 'SET_LOADING', loading: false })
          return
        }
        dispatch({
          type: 'SET_HABITS',
          habits: habitsResult.data.map((h: { name: string }) => h.name),
        })

        const [logsRes, dsaRes, startupRes, fitRes, reactionsRes] = await Promise.all([
          supabase
            .from('habit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(500),
          supabase.from('dsa_progress').select('*').eq('user_id', userId),
          supabase.from('startup_progress').select('*').eq('user_id', userId),
          supabase.from('fitness_logs').select('*').eq('user_id', userId).order('date'),
          supabase
            .from('accountability_reactions')
            .select('*')
            .or(`to_user.eq.${userId},from_user.eq.${userId}`)
            .order('created_at', { ascending: false })
            .limit(50),
        ])
        if (logsRes.data)
          dispatch({
            type: 'SET_LOGS',
            logs: logsRes.data.map(
              (l: { habit_name: string; date: string; status: Status }) =>
                ({ h: l.habit_name, d: l.date, s: l.status }) as HabitLog
            ),
          })
        if (dsaRes.data) {
          const p: DSAProgress = {}
          dsaRes.data.forEach((d: { topic_key: string; completed: boolean }) => {
            if (d.completed) p[d.topic_key] = true
          })
          dispatch({ type: 'SET_DSA', dsa: p })
        }
        if (startupRes.data) {
          const p: StartupProgress = {}
          startupRes.data.forEach((d: { task_key: string; completed: boolean }) => {
            if (d.completed) p[d.task_key] = true
          })
          dispatch({ type: 'SET_STARTUP', startup: p })
        }
        if (fitRes.data) dispatch({ type: 'SET_FIT_LOGS', fitLogs: fitRes.data as FitnessLog[] })
        if (reactionsRes.data)
          dispatch({ type: 'SET_REACTIONS', reactions: reactionsRes.data as Reaction[] })
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false })
      }
    },
    [loadPartner, setProfile]
  )

  // ── Load + reset on session change ────────────────────────────────────────
  useEffect(() => {
    if (session) loadAll(session.user.id)
    else dispatch({ type: 'RESET' })
  }, [session, loadAll])

  // ── Realtime: partner logs + incoming reactions ───────────────────────────
  // Mirrors the previous App.tsx subscription exactly: partner habit_log
  // inserts/updates flow into partnerLogs, and accountability_reactions
  // inserts addressed to me are pushed into the reactions list so Nav badge
  // stays live.
  useEffect(() => {
    if (!session || !state.partner) return
    const channel = supabase
      .channel('realtime-partner')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_logs',
          filter: `user_id=eq.${state.partner.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const l = payload.new as { habit_name: string; date: string; status: Status }
            dispatch({
              type: 'UPSERT_PARTNER_LOG',
              log: { h: l.habit_name, d: l.date, s: l.status },
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'accountability_reactions',
          filter: `to_user=eq.${session.user.id}`,
        },
        (payload) => {
          dispatch({ type: 'PUSH_REACTION', reaction: payload.new as Reaction })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, state.partner])

  // ── Action functions (signatures match the previous App.tsx helpers) ──────
  const logHabit = useCallback(
    async (habitName: string, status: Exclude<Status, null>) => {
      if (!session) return
      const today = todayStr()
      dispatch({ type: 'UPSERT_LOG', log: { h: habitName, d: today, s: status } })
      await supabase
        .from('habit_logs')
        .upsert(
          { user_id: session.user.id, habit_name: habitName, date: today, status },
          { onConflict: 'user_id,habit_name,date' }
        )
    },
    [session]
  )

  const toggleDSA = useCallback(
    async (key: string) => {
      if (!session) return
      const v = !state.dsaProg[key]
      dispatch({ type: 'TOGGLE_DSA', key, value: v })
      await supabase
        .from('dsa_progress')
        .upsert(
          { user_id: session.user.id, topic_key: key, completed: v },
          { onConflict: 'user_id,topic_key' }
        )
    },
    [session, state.dsaProg]
  )

  const toggleStartup = useCallback(
    async (key: string) => {
      if (!session) return
      const v = !state.startupProg[key]
      dispatch({ type: 'TOGGLE_STARTUP', key, value: v })
      await supabase
        .from('startup_progress')
        .upsert(
          { user_id: session.user.id, task_key: key, completed: v },
          { onConflict: 'user_id,task_key' }
        )
    },
    [session, state.startupProg]
  )

  const addFitnessLog = useCallback(
    async (entry: Partial<FitnessLog>) => {
      if (!session) return
      const e: FitnessLog = { ...entry, user_id: session.user.id, date: todayStr() }
      dispatch({ type: 'ADD_FIT_LOG', log: e })
      await supabase.from('fitness_logs').insert(e)
    },
    [session]
  )

  const addHabit = useCallback(
    async (name: string, category: string, color: string, icon: string) => {
      if (!session) return
      if (!name.trim()) return
      await supabase
        .from('habits')
        .insert({ user_id: session.user.id, name, category, color, icon, priority: 50 })
      dispatch({ type: 'ADD_HABIT', name })
    },
    [session]
  )

  const sendReaction = useCallback(
    async (type: Reaction['type'], habitName: string | null, message: string) => {
      if (!state.partner || !session) return
      const r: Reaction = {
        from_user: session.user.id,
        to_user: state.partner.id,
        type,
        habit_name: habitName,
        message,
        date: todayStr(),
      }
      await supabase.from('accountability_reactions').insert(r)
      dispatch({ type: 'PUSH_REACTION', reaction: r })
    },
    [session, state.partner]
  )

  const linkPartner = useCallback(
    async (partnerEmail: string): Promise<{ error?: string; success?: boolean }> => {
      if (!session) return { error: 'Not signed in.' }
      const { data: p } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', partnerEmail)
        .single()
      if (!p) return { error: 'No account found with that email.' }
      await supabase.rpc('link_partners', { user_a: session.user.id, user_b: p.id })
      await loadAll(session.user.id)
      return { success: true }
    },
    [session, loadAll]
  )

  const completeOnboarding = useCallback(
    async (onboardingData: OnboardingPayload) => {
      if (!session) return
      const userId = session.user.id
      const {
        habitData,
        name,
        currentWeight,
        targetWeight,
        monthlyIncome,
        wakeTime,
        dsaTarget,
        fitnessGoal,
        partnerEmail,
      } = onboardingData
      await supabase
        .from('profiles')
        .update({
          name,
          onboarding_data: {
            currentWeight,
            targetWeight,
            monthlyIncome,
            wakeTime,
            dsaTarget,
            fitnessGoal,
          },
        })
        .eq('id', userId)
      if (habitData.length > 0) {
        await supabase.from('habits').insert(
          habitData.map((h, i) => ({
            user_id: userId,
            name: h.name,
            category: h.category,
            color: h.color,
            icon: h.icon,
            priority: i + 1,
            note: h.note,
          }))
        )
      }
      if (currentWeight) {
        await supabase.from('fitness_logs').insert({
          user_id: userId,
          date: todayStr(),
          weight: parseFloat(currentWeight),
          calories_eaten: 0,
          calories_burned: 0,
          note: 'Starting weight',
        })
      }
      if (partnerEmail) {
        const { data: p } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', partnerEmail)
          .single()
        if (p) await supabase.rpc('link_partners', { user_a: userId, user_b: p.id })
      }
      dispatch({ type: 'SET_NEEDS_ONBOARDING', value: false })
      await loadAll(userId)
    },
    [session, loadAll]
  )

  const markReactionRead = useCallback(async (reactionId: string) => {
    await supabase.from('accountability_reactions').update({ read: true }).eq('id', reactionId)
  }, [])

  return (
    <DataContext.Provider
      value={{
        ...state,
        logHabit,
        addHabit,
        toggleDSA,
        toggleStartup,
        addFitnessLog,
        sendReaction,
        linkPartner,
        completeOnboarding,
        markReactionRead,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
