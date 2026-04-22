import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Landing from './components/Landing'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import Nav from './components/Nav'
import Dashboard from './components/Dashboard'
import Today from './components/Today'
import Habits from './components/Habits'
import Trackers from './components/Trackers'
import Finance from './components/Finance'
import Diet from './components/Diet'
import Health from './components/Health'
import Schedule from './components/Schedule'
import Analytics from './components/Analytics'
import Accountability from './components/Accountability'
import type {
  Session,
  Profile,
  Habit,
  HabitLog,
  Status,
  DSAProgress,
  StartupProgress,
  FitnessLog,
  Reaction,
  OnboardingPayload,
} from './types'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [partner, setPartner] = useState<Profile | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [partnerLogs, setPartnerLogs] = useState<HabitLog[]>([])
  const [partnerHabits, setPartnerHabits] = useState<Habit[]>([])
  const [dsaProg, setDsaProg] = useState<DSAProgress>({})
  const [startupProg, setStartupProg] = useState<StartupProgress>({})
  const [fitLogs, setFitLogs] = useState<FitnessLog[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function resetState() {
    setProfile(null)
    setPartner(null)
    setHabits([])
    setLogs([])
    setPartnerLogs([])
    setPartnerHabits([])
    setDsaProg({})
    setStartupProg({})
    setFitLogs([])
    setReactions([])
    setNeedsOnboarding(false)
  }

  const loadPartner = useCallback(async (partnerId: string) => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', partnerId).single()
    if (p) {
      setPartner(p as Profile)
      const { data: ph } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', partnerId)
        .eq('active', true)
        .order('priority')
      if (ph) setPartnerHabits(ph.map((h: { name: string }) => h.name))
      const { data: pl } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', partnerId)
        .order('date', { ascending: false })
        .limit(200)
      if (pl)
        setPartnerLogs(
          pl.map(
            (l: { habit_name: string; date: string; status: Status }) =>
              ({ h: l.habit_name, d: l.date, s: l.status }) as HabitLog
          )
        )
    }
  }, [])

  const loadLogs = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(500)
    if (data)
      setLogs(
        data.map(
          (l: { habit_name: string; date: string; status: Status }) =>
            ({ h: l.habit_name, d: l.date, s: l.status }) as HabitLog
        )
      )
  }, [])

  const loadDSA = useCallback(async (userId: string) => {
    const { data } = await supabase.from('dsa_progress').select('*').eq('user_id', userId)
    if (data) {
      const p: DSAProgress = {}
      data.forEach((d: { topic_key: string; completed: boolean }) => {
        if (d.completed) p[d.topic_key] = true
      })
      setDsaProg(p)
    }
  }, [])

  const loadStartup = useCallback(async (userId: string) => {
    const { data } = await supabase.from('startup_progress').select('*').eq('user_id', userId)
    if (data) {
      const p: StartupProgress = {}
      data.forEach((d: { task_key: string; completed: boolean }) => {
        if (d.completed) p[d.task_key] = true
      })
      setStartupProg(p)
    }
  }, [])

  const loadFitness = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('fitness_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date')
    if (data) setFitLogs(data as FitnessLog[])
  }, [])

  const loadReactions = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('accountability_reactions')
      .select('*')
      .or(`to_user.eq.${userId},from_user.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setReactions(data as Reaction[])
  }, [])

  const loadAll = useCallback(
    async (userId: string) => {
      setLoading(true)
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
          setNeedsOnboarding(true)
          setLoading(false)
          return
        }
        setHabits(habitsResult.data.map((h: { name: string }) => h.name))
        await Promise.all([
          loadLogs(userId),
          loadDSA(userId),
          loadStartup(userId),
          loadFitness(userId),
          loadReactions(userId),
        ])
      } finally {
        setLoading(false)
      }
    },
    [loadPartner, loadLogs, loadDSA, loadStartup, loadFitness, loadReactions]
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadAll(session.user.id)
      else setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (session) loadAll(session.user.id)
      else {
        setLoading(false)
        resetState()
      }
    })
    return () => subscription.unsubscribe()
  }, [loadAll])

  async function logHabit(habitName: string, status: Exclude<Status, null>) {
    if (!session) return
    const today = todayStr()
    setLogs((prev) => {
      const f = prev.filter((l) => !(l.h === habitName && l.d === today))
      return [{ h: habitName, d: today, s: status }, ...f]
    })
    await supabase
      .from('habit_logs')
      .upsert(
        { user_id: session.user.id, habit_name: habitName, date: today, status },
        { onConflict: 'user_id,habit_name,date' }
      )
  }

  async function toggleDSA(key: string) {
    if (!session) return
    const v = !dsaProg[key]
    setDsaProg((p) => ({ ...p, [key]: v }))
    await supabase
      .from('dsa_progress')
      .upsert(
        { user_id: session.user.id, topic_key: key, completed: v },
        { onConflict: 'user_id,topic_key' }
      )
  }

  async function toggleStartup(key: string) {
    if (!session) return
    const v = !startupProg[key]
    setStartupProg((p) => ({ ...p, [key]: v }))
    await supabase
      .from('startup_progress')
      .upsert(
        { user_id: session.user.id, task_key: key, completed: v },
        { onConflict: 'user_id,task_key' }
      )
  }

  async function addFitnessLog(entry: Partial<FitnessLog>) {
    if (!session) return
    const e: FitnessLog = { ...entry, user_id: session.user.id, date: todayStr() }
    setFitLogs((prev) => [...prev, e])
    await supabase.from('fitness_logs').insert(e)
  }

  async function addHabit(name: string, category: string, color: string, icon: string) {
    if (!session) return
    if (!name.trim()) return
    await supabase
      .from('habits')
      .insert({ user_id: session.user.id, name, category, color, icon, priority: 50 })
    setHabits((prev) => [...prev, name])
  }

  async function sendReaction(type: Reaction['type'], habitName: string | null, message: string) {
    if (!partner || !session) return
    const r: Reaction = {
      from_user: session.user.id,
      to_user: partner.id,
      type,
      habit_name: habitName,
      message,
      date: todayStr(),
    }
    await supabase.from('accountability_reactions').insert(r)
    setReactions((prev) => [r, ...prev])
  }

  async function linkPartner(partnerEmail: string): Promise<{ error?: string; success?: boolean }> {
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
  }

  async function handleOnboardingComplete(onboardingData: OnboardingPayload) {
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
    setNeedsOnboarding(false)
    await loadAll(userId)
    // After completing onboarding, drop the user on the Dashboard.
    navigate('/', { replace: true })
  }

  useEffect(() => {
    if (!session || !partner) return
    const channel = supabase
      .channel('realtime-partner')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${partner.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const l = payload.new as { habit_name: string; date: string; status: Status }
            setPartnerLogs((prev) => {
              const f = prev.filter((x) => !(x.h === l.habit_name && x.d === l.date))
              return [{ h: l.habit_name, d: l.date, s: l.status }, ...f]
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
          setReactions((prev) => [payload.new as Reaction, ...prev])
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, partner])

  if (loading)
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

  // ── Logged-out: Landing at "/" + sign-in/up at "/auth" ─────────────────
  // Landing has its own "Login / Sign Up" CTAs; clicking either sends the
  // user to /auth (?mode=signup for the signup variant). Any other path
  // for an unauthenticated user redirects to the landing page.
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
        {/* Deep links while logged out: remember target, bounce to "/" so the
            landing page shows first. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // ── Logged-in but no habits yet → Onboarding ───────────────────────────
  // Onboarding is its own route. Any other path while un-onboarded
  // redirects here so deep links still get gated.
  if (needsOnboarding) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding onComplete={handleOnboardingComplete} />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  // ── Fully authenticated + onboarded: Nav + app routes ──────────────────
  const sharedProps = {
    session,
    profile,
    partner,
    habits,
    logs,
    partnerLogs,
    partnerHabits,
    dsaProg,
    startupProg,
    fitLogs,
    reactions,
    logHabit,
    toggleDSA,
    toggleStartup,
    addFitnessLog,
    addHabit,
    sendReaction,
    linkPartner,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e6e1' }}>
      <Nav
        profile={profile}
        partner={partner}
        reactions={reactions.filter((r) => !r.read && r.to_user === session?.user?.id)}
      />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px' }}>
        <Routes>
          <Route path="/" element={<Dashboard {...sharedProps} />} />
          <Route path="/today" element={<Today {...sharedProps} />} />
          <Route path="/habits" element={<Habits {...sharedProps} />} />
          <Route path="/trackers" element={<Trackers {...sharedProps} />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/health" element={<Health />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/accountability" element={<Accountability {...sharedProps} />} />
          <Route path="/analytics" element={<Analytics {...sharedProps} />} />
          {/* Already signed in → /auth and /onboarding bounce back home. */}
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
