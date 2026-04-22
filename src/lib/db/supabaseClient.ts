// ─── Supabase DataClient ─────────────────────────────────────────────────────
// Wraps the existing Supabase calls in the DataClient interface. Behavior
// is preserved verbatim from the previous direct-supabase call sites in
// AuthContext.tsx / DataContext.tsx / Auth.tsx / Onboarding.tsx.
import { supabase } from '../supabase'
import type { Session } from '@supabase/supabase-js'
import type {
  DSAProgress,
  FitnessLog,
  HabitLog,
  Profile,
  Reaction,
  StartupProgress,
  Status,
} from '../../types'
import type { AppSession, DataClient, Unsubscribe } from './types'

function toAppSession(s: Session | null): AppSession | null {
  if (!s) return null
  return { userId: s.user.id, email: s.user.email ?? null }
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export const supabaseClient: DataClient = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  onAuthStateChange(cb): Unsubscribe {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => cb(toAppSession(session)))
    return () => subscription.unsubscribe()
  },
  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return toAppSession(session)
  },
  async signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const s = toAppSession(data.session)
    if (!s) throw new Error('No session returned')
    return s
  },
  async signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: name ? { data: { name } } : undefined,
    })
    if (error) throw error
    return toAppSession(data.session)
  },
  async signOut() {
    await supabase.auth.signOut()
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  async getProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    return (data as Profile | null) ?? null
  },
  async updateProfile(userId, patch) {
    await supabase.from('profiles').update(patch).eq('id', userId)
  },

  // ── Realtime (Supabase realtime postgres_changes on partner rows + reactions)
  // The legacy code only subscribed to partner logs and reactions — own
  // habits/logs were one-shot reads. We expose subscribe* methods so the
  // interface is uniform; the Supabase implementation falls back to a
  // one-shot fetch for own data where no realtime existed before.
  subscribeHabits(userId, cb): Unsubscribe {
    let cancelled = false
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('priority')
      .then(({ data }) => {
        if (cancelled) return
        cb((data ?? []).map((h: { name: string }) => h.name))
      })
    return () => {
      cancelled = true
    }
  },
  subscribeLogs(userId, cb): Unsubscribe {
    let cancelled = false
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (cancelled) return
        cb(
          (data ?? []).map(
            (l: { habit_name: string; date: string; status: Status }) =>
              ({ h: l.habit_name, d: l.date, s: l.status }) as HabitLog
          )
        )
      })
    return () => {
      cancelled = true
    }
  },
  subscribePartner(partnerId, cb): Unsubscribe {
    let cancelled = false
    supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single()
      .then(({ data }) => {
        if (!cancelled) cb((data as Profile | null) ?? null)
      })
    return () => {
      cancelled = true
    }
  },
  subscribePartnerHabits(partnerId, cb): Unsubscribe {
    let cancelled = false
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', partnerId)
      .eq('active', true)
      .order('priority')
      .then(({ data }) => {
        if (!cancelled) cb((data ?? []).map((h: { name: string }) => h.name))
      })
    return () => {
      cancelled = true
    }
  },
  subscribePartnerLogs(partnerId, cb): Unsubscribe {
    // Initial fetch + realtime channel — mirrors previous DataContext behavior.
    let current: HabitLog[] = []
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', partnerId)
      .order('date', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        current = (data ?? []).map(
          (l: { habit_name: string; date: string; status: Status }) =>
            ({ h: l.habit_name, d: l.date, s: l.status }) as HabitLog
        )
        cb(current)
      })
    const channel = supabase
      .channel(`realtime-partner-logs-${partnerId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${partnerId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const l = payload.new as { habit_name: string; date: string; status: Status }
            const next: HabitLog = { h: l.habit_name, d: l.date, s: l.status }
            current = [next, ...current.filter((x) => !(x.h === next.h && x.d === next.d))]
            cb(current)
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  },
  subscribeReactions(userId, cb): Unsubscribe {
    let current: Reaction[] = []
    supabase
      .from('accountability_reactions')
      .select('*')
      .or(`to_user.eq.${userId},from_user.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        current = (data ?? []) as Reaction[]
        cb(current)
      })
    const channel = supabase
      .channel(`realtime-reactions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'accountability_reactions',
          filter: `to_user=eq.${userId}`,
        },
        (payload) => {
          current = [payload.new as Reaction, ...current]
          cb(current)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  },

  // ── Data reads ────────────────────────────────────────────────────────────
  async getHabits(userId) {
    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('priority')
    return (data ?? []).map((h: { name: string }) => h.name)
  },
  async getLogs(userId) {
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(500)
    return (data ?? []).map(
      (l: { habit_name: string; date: string; status: Status }) =>
        ({ h: l.habit_name, d: l.date, s: l.status }) as HabitLog
    )
  },
  async getFitnessLogs(userId) {
    const { data } = await supabase
      .from('fitness_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date')
    return (data ?? []) as FitnessLog[]
  },
  async getDSAProgress(userId) {
    const { data } = await supabase.from('dsa_progress').select('*').eq('user_id', userId)
    const p: DSAProgress = {}
    ;(data ?? []).forEach((d: { topic_key: string; completed: boolean }) => {
      if (d.completed) p[d.topic_key] = true
    })
    return p
  },
  async getStartupProgress(userId) {
    const { data } = await supabase.from('startup_progress').select('*').eq('user_id', userId)
    const p: StartupProgress = {}
    ;(data ?? []).forEach((d: { task_key: string; completed: boolean }) => {
      if (d.completed) p[d.task_key] = true
    })
    return p
  },

  // ── Data writes ───────────────────────────────────────────────────────────
  async logHabit(userId, { h, d, s }) {
    await supabase
      .from('habit_logs')
      .upsert(
        { user_id: userId, habit_name: h, date: d, status: s },
        { onConflict: 'user_id,habit_name,date' }
      )
  },
  async addHabit(userId, habit) {
    await supabase.from('habits').insert({
      user_id: userId,
      name: habit.name,
      category: habit.category,
      color: habit.color,
      icon: habit.icon,
      priority: habit.priority ?? 50,
    })
  },
  async toggleDSA(userId, topicKey, value) {
    await supabase
      .from('dsa_progress')
      .upsert(
        { user_id: userId, topic_key: topicKey, completed: value },
        { onConflict: 'user_id,topic_key' }
      )
  },
  async toggleStartup(userId, taskKey, value) {
    await supabase
      .from('startup_progress')
      .upsert(
        { user_id: userId, task_key: taskKey, completed: value },
        { onConflict: 'user_id,task_key' }
      )
  },
  async addFitnessLog(userId, entry) {
    await supabase.from('fitness_logs').insert({ ...entry, user_id: userId })
  },
  async sendReaction(payload) {
    await supabase.from('accountability_reactions').insert(payload)
  },
  async markReactionRead(id) {
    await supabase.from('accountability_reactions').update({ read: true }).eq('id', id)
  },
  async linkPartner(userId, partnerEmail) {
    const { data: p } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', partnerEmail)
      .single()
    if (!p) return { error: 'No account found with that email.' }
    await supabase.rpc('link_partners', { user_a: userId, user_b: p.id })
    return { success: true }
  },
  async completeOnboarding(userId, payload) {
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
    } = payload
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
  },
}
