import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { db } from '../lib/db'
import { useAuth } from './AuthContext'
import type {
  DSAProgress,
  DietState,
  FinanceSettings,
  FinanceTransaction,
  FitnessLog,
  Habit,
  HabitLog,
  HealthItem,
  HealthStatus,
  JournalPost,
  OnboardingPayload,
  Profile,
  Reaction,
  ScheduleItem,
  ScheduleState,
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
  journal: JournalPost[]
  transactions: FinanceTransaction[]
  financeSettings: FinanceSettings
  diet: DietState
  healthItems: HealthItem[]
  schedule: ScheduleState
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
  | { type: 'SET_JOURNAL'; journal: JournalPost[] }
  | { type: 'SET_TRANSACTIONS'; transactions: FinanceTransaction[] }
  | { type: 'SET_FINANCE_SETTINGS'; settings: FinanceSettings }
  | { type: 'SET_DIET'; diet: DietState }
  | { type: 'SET_HEALTH_ITEMS'; items: HealthItem[] }
  | { type: 'SET_SCHEDULE'; schedule: ScheduleState }
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
  journal: [],
  transactions: [],
  financeSettings: { budgets: {} },
  diet: { meals: [], notes: [] },
  healthItems: [],
  schedule: { items: [] },
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
    case 'SET_JOURNAL':
      return { ...state, journal: action.journal }
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.transactions }
    case 'SET_FINANCE_SETTINGS':
      return { ...state, financeSettings: action.settings }
    case 'SET_DIET':
      return { ...state, diet: action.diet }
    case 'SET_HEALTH_ITEMS':
      return { ...state, healthItems: action.items }
    case 'SET_SCHEDULE':
      return { ...state, schedule: action.schedule }
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
  addJournalPost: (
    post: Omit<JournalPost, 'id' | 'createdAt'>
  ) => Promise<string | undefined>
  updateJournalPost: (
    id: string,
    patch: Partial<Omit<JournalPost, 'id' | 'createdAt'>>
  ) => Promise<void>
  deleteJournalPost: (id: string) => Promise<void>
  addTransaction: (
    tx: Omit<FinanceTransaction, 'id' | 'createdAt'>
  ) => Promise<string | undefined>
  deleteTransaction: (id: string) => Promise<void>
  updateBudget: (categoryId: string, amount: number) => Promise<void>
  updateDiet: (patch: Partial<DietState>) => Promise<void>
  addHealthItem: (
    item: Omit<HealthItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string | undefined>
  updateHealthItem: (
    id: string,
    patch: Partial<{ label: string; status: HealthStatus; note: string }>
  ) => Promise<void>
  deleteHealthItem: (id: string) => Promise<void>
  updateSchedule: (items: ScheduleItem[]) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { session, setProfile } = useAuth()

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadPartner = useCallback(async (partnerId: string) => {
    const p = await db.getProfile(partnerId)
    if (p) {
      dispatch({ type: 'SET_PARTNER', partner: p })
      const [ph, pl] = await Promise.all([db.getHabits(partnerId), db.getLogs(partnerId)])
      dispatch({ type: 'SET_PARTNER_HABITS', habits: ph })
      dispatch({ type: 'SET_PARTNER_LOGS', logs: pl })
    }
  }, [])

  const loadAll = useCallback(
    async (userId: string) => {
      dispatch({ type: 'SET_LOADING', loading: true })
      try {
        const [profile, habits] = await Promise.all([db.getProfile(userId), db.getHabits(userId)])
        if (profile) {
          setProfile(profile)
          if (profile.partner_id) loadPartner(profile.partner_id)
        }
        if (!habits || habits.length === 0) {
          dispatch({ type: 'SET_NEEDS_ONBOARDING', value: true })
          dispatch({ type: 'SET_LOADING', loading: false })
          return
        }
        dispatch({ type: 'SET_HABITS', habits })

        const [logs, dsa, startup, fit] = await Promise.all([
          db.getLogs(userId),
          db.getDSAProgress(userId),
          db.getStartupProgress(userId),
          db.getFitnessLogs(userId),
        ])
        dispatch({ type: 'SET_LOGS', logs })
        dispatch({ type: 'SET_DSA', dsa })
        dispatch({ type: 'SET_STARTUP', startup })
        dispatch({ type: 'SET_FIT_LOGS', fitLogs: fit })
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false })
      }
    },
    [loadPartner, setProfile]
  )

  // ── Load + reset on session change ────────────────────────────────────────
  useEffect(() => {
    if (session) loadAll(session.userId)
    else dispatch({ type: 'RESET' })
  }, [session, loadAll])

  // ── Realtime: partner logs + incoming reactions ───────────────────────────
  // Mirrors the previous App.tsx subscription: partner habit_log inserts/
  // updates flow into partnerLogs, and incoming reactions addressed to me are
  // pushed into the reactions list so Nav badge stays live. Backend-agnostic
  // via db.subscribePartnerLogs / db.subscribeReactions.
  useEffect(() => {
    if (!session) return
    const unsubR = db.subscribeReactions(session.userId, (reactions) => {
      dispatch({ type: 'SET_REACTIONS', reactions })
    })
    const unsubJ = db.subscribeJournalPosts(session.userId, (journal) => {
      dispatch({ type: 'SET_JOURNAL', journal })
    })
    const unsubT = db.subscribeTransactions(session.userId, (transactions) => {
      dispatch({ type: 'SET_TRANSACTIONS', transactions })
    })
    const unsubFS = db.subscribeFinanceSettings(session.userId, (settings) => {
      dispatch({
        type: 'SET_FINANCE_SETTINGS',
        settings: settings ?? { budgets: {} },
      })
    })
    const unsubD = db.subscribeDietState(session.userId, (diet) => {
      dispatch({ type: 'SET_DIET', diet: diet ?? { meals: [], notes: [] } })
    })
    const unsubH = db.subscribeHealthItems(session.userId, (items) => {
      dispatch({ type: 'SET_HEALTH_ITEMS', items })
    })
    const unsubS = db.subscribeScheduleState(session.userId, (schedule) => {
      dispatch({ type: 'SET_SCHEDULE', schedule: schedule ?? { items: [] } })
    })
    const unsubP = state.partner
      ? db.subscribePartnerLogs(state.partner.id, (logs) => {
          dispatch({ type: 'SET_PARTNER_LOGS', logs })
        })
      : null
    return () => {
      unsubR()
      unsubJ()
      unsubT()
      unsubFS()
      unsubD()
      unsubH()
      unsubS()
      if (unsubP) unsubP()
    }
  }, [session, state.partner])

  // ── Action functions (signatures match the previous App.tsx helpers) ──────
  const logHabit = useCallback(
    async (habitName: string, status: Exclude<Status, null>) => {
      if (!session) return
      const today = todayStr()
      dispatch({ type: 'UPSERT_LOG', log: { h: habitName, d: today, s: status } })
      await db.logHabit(session.userId, { h: habitName, d: today, s: status })
    },
    [session]
  )

  const toggleDSA = useCallback(
    async (key: string) => {
      if (!session) return
      const v = !state.dsaProg[key]
      dispatch({ type: 'TOGGLE_DSA', key, value: v })
      await db.toggleDSA(session.userId, key, v)
    },
    [session, state.dsaProg]
  )

  const toggleStartup = useCallback(
    async (key: string) => {
      if (!session) return
      const v = !state.startupProg[key]
      dispatch({ type: 'TOGGLE_STARTUP', key, value: v })
      await db.toggleStartup(session.userId, key, v)
    },
    [session, state.startupProg]
  )

  const addFitnessLog = useCallback(
    async (entry: Partial<FitnessLog>) => {
      if (!session) return
      const e: FitnessLog = { ...entry, user_id: session.userId, date: todayStr() }
      dispatch({ type: 'ADD_FIT_LOG', log: e })
      await db.addFitnessLog(session.userId, e)
    },
    [session]
  )

  const addHabit = useCallback(
    async (name: string, category: string, color: string, icon: string) => {
      if (!session) return
      if (!name.trim()) return
      await db.addHabit(session.userId, { name, category, color, icon, priority: 50 })
      dispatch({ type: 'ADD_HABIT', name })
    },
    [session]
  )

  const sendReaction = useCallback(
    async (type: Reaction['type'], habitName: string | null, message: string) => {
      if (!state.partner || !session) return
      const r: Reaction = {
        from_user: session.userId,
        to_user: state.partner.id,
        type,
        habit_name: habitName,
        message,
        date: todayStr(),
      }
      await db.sendReaction(r)
      dispatch({ type: 'PUSH_REACTION', reaction: r })
    },
    [session, state.partner]
  )

  const linkPartner = useCallback(
    async (partnerEmail: string): Promise<{ error?: string; success?: boolean }> => {
      if (!session) return { error: 'Not signed in.' }
      const res = await db.linkPartner(session.userId, partnerEmail)
      if (res.success) await loadAll(session.userId)
      return res
    },
    [session, loadAll]
  )

  const completeOnboarding = useCallback(
    async (onboardingData: OnboardingPayload) => {
      if (!session) return
      await db.completeOnboarding(session.userId, onboardingData)
      dispatch({ type: 'SET_NEEDS_ONBOARDING', value: false })
      await loadAll(session.userId)
    },
    [session, loadAll]
  )

  const markReactionRead = useCallback(async (reactionId: string) => {
    await db.markReactionRead(reactionId)
  }, [])

  const addJournalPost = useCallback(
    async (post: Omit<JournalPost, 'id' | 'createdAt'>) => {
      if (!session) return undefined
      const id = await db.addJournalPost(session.userId, post)
      // The realtime subscription will refresh the list; we return the id
      // in case the caller wants to navigate to it.
      return id
    },
    [session]
  )

  const updateJournalPost = useCallback(
    async (id: string, patch: Partial<Omit<JournalPost, 'id' | 'createdAt'>>) => {
      if (!session) return
      await db.updateJournalPost(session.userId, id, patch)
    },
    [session]
  )

  const deleteJournalPost = useCallback(
    async (id: string) => {
      if (!session) return
      await db.deleteJournalPost(session.userId, id)
    },
    [session]
  )

  const addTransaction = useCallback(
    async (tx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => {
      if (!session) return undefined
      return await db.addTransaction(session.userId, tx)
    },
    [session]
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!session) return
      await db.deleteTransaction(session.userId, id)
    },
    [session]
  )

  const updateBudget = useCallback(
    async (categoryId: string, amount: number) => {
      if (!session) return
      const nextBudgets = { ...state.financeSettings.budgets, [categoryId]: amount }
      // Optimistic local update — subscription will confirm.
      dispatch({
        type: 'SET_FINANCE_SETTINGS',
        settings: { ...state.financeSettings, budgets: nextBudgets },
      })
      await db.updateFinanceSettings(session.userId, { budgets: nextBudgets })
    },
    [session, state.financeSettings]
  )

  const updateDiet = useCallback(
    async (patch: Partial<DietState>) => {
      if (!session) return
      // Optimistic — subscription will confirm.
      dispatch({ type: 'SET_DIET', diet: { ...state.diet, ...patch } })
      await db.updateDietState(session.userId, patch)
    },
    [session, state.diet]
  )

  const addHealthItem = useCallback(
    async (item: Omit<HealthItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!session) return undefined
      return await db.addHealthItem(session.userId, item)
    },
    [session]
  )

  const updateHealthItem = useCallback(
    async (
      id: string,
      patch: Partial<{ label: string; status: HealthStatus; note: string }>
    ) => {
      if (!session) return
      await db.updateHealthItem(session.userId, id, patch)
    },
    [session]
  )

  const deleteHealthItem = useCallback(
    async (id: string) => {
      if (!session) return
      await db.deleteHealthItem(session.userId, id)
    },
    [session]
  )

  const updateSchedule = useCallback(
    async (items: ScheduleItem[]) => {
      if (!session) return
      const next = { items: [...items].sort((a, b) => a.time.localeCompare(b.time)) }
      dispatch({ type: 'SET_SCHEDULE', schedule: next })
      await db.updateScheduleState(session.userId, next)
    },
    [session]
  )

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
        addJournalPost,
        updateJournalPost,
        deleteJournalPost,
        addTransaction,
        deleteTransaction,
        updateBudget,
        updateDiet,
        addHealthItem,
        updateHealthItem,
        deleteHealthItem,
        updateSchedule,
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
