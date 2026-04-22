// ─── DataClient interface ────────────────────────────────────────────────────
// Backend-agnostic surface consumed by AuthContext / DataContext.
// Implementation: ./firebaseClient.ts (re-exported as `db` via ./index.ts).
import type {
  DSAProgress,
  FitnessLog,
  HabitLog,
  OnboardingPayload,
  Profile,
  Reaction,
  StartupProgress,
  Status,
} from '../../types'

// Normalized session shape — the interface only needs userId + email, so
// backend-specific auth types don't leak into callers.
export interface AppSession {
  userId: string
  email: string | null
}

export type Unsubscribe = () => void

export interface DataClient {
  // ── Auth ──────────────────────────────────────────────────────────────────
  onAuthStateChange(cb: (session: AppSession | null) => void): Unsubscribe
  getSession(): Promise<AppSession | null>
  signInWithPassword(email: string, password: string): Promise<AppSession>
  signUp(email: string, password: string, name?: string): Promise<AppSession | null>
  signOut(): Promise<void>

  // ── Profile ───────────────────────────────────────────────────────────────
  getProfile(userId: string): Promise<Profile | null>
  updateProfile(userId: string, patch: Partial<Profile>): Promise<void>

  // ── Realtime subscriptions ────────────────────────────────────────────────
  subscribeHabits(userId: string, cb: (habits: string[]) => void): Unsubscribe
  subscribeLogs(userId: string, cb: (logs: HabitLog[]) => void): Unsubscribe
  subscribePartner(partnerId: string, cb: (partner: Profile | null) => void): Unsubscribe
  subscribePartnerHabits(partnerId: string, cb: (habits: string[]) => void): Unsubscribe
  subscribePartnerLogs(partnerId: string, cb: (logs: HabitLog[]) => void): Unsubscribe
  subscribeReactions(userId: string, cb: (reactions: Reaction[]) => void): Unsubscribe

  // ── Data reads ────────────────────────────────────────────────────────────
  getHabits(userId: string): Promise<string[]>
  getLogs(userId: string): Promise<HabitLog[]>
  getFitnessLogs(userId: string): Promise<FitnessLog[]>
  getDSAProgress(userId: string): Promise<DSAProgress>
  getStartupProgress(userId: string): Promise<StartupProgress>

  // ── Data writes ───────────────────────────────────────────────────────────
  logHabit(userId: string, log: { h: string; d: string; s: Exclude<Status, null> }): Promise<void>
  addHabit(
    userId: string,
    habit: { name: string; category: string; color: string; icon: string; priority?: number }
  ): Promise<void>
  toggleDSA(userId: string, topicKey: string, value: boolean): Promise<void>
  toggleStartup(userId: string, taskKey: string, value: boolean): Promise<void>
  addFitnessLog(userId: string, entry: FitnessLog): Promise<void>
  sendReaction(payload: Reaction): Promise<void>
  markReactionRead(id: string): Promise<void>
  linkPartner(userId: string, partnerEmail: string): Promise<{ error?: string; success?: boolean }>
  completeOnboarding(userId: string, payload: OnboardingPayload): Promise<void>
}
