// ─── DataClient interface ────────────────────────────────────────────────────
// Backend-agnostic surface consumed by AuthContext / DataContext.
// Implementation: ./firebaseClient.ts (re-exported as `db` via ./index.ts).
import type {
  DSAProgress,
  FitnessLog,
  HabitLog,
  NumericEntry,
  OnboardingPayload,
  Profile,
  Reaction,
  StartupProgress,
  Status,
  Tracker,
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
  signInWithGoogle(): Promise<AppSession>
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

  // ── Trackers (P2.5) ───────────────────────────────────────────────────────
  // CRUD on users/{uid}/trackers. Streak habits reuse the habits collection
  // and are NOT written through here — only the other four archetypes.
  subscribeTrackers(userId: string, cb: (trackers: Tracker[]) => void): Unsubscribe
  createTracker(userId: string, tracker: Omit<Tracker, 'id'>): Promise<string>
  updateTracker(userId: string, trackerId: string, patch: Partial<Tracker>): Promise<void>
  deleteTracker(userId: string, trackerId: string): Promise<void>

  // Per-archetype entry methods (unbounded time-series use subcollections;
  // bounded arrays on checklist/roadmap are patched via updateTracker).
  logNumericEntry(userId: string, trackerId: string, entry: NumericEntry): Promise<void>
  toggleChecklistItem(
    userId: string,
    trackerId: string,
    itemId: string,
    done: boolean
  ): Promise<void>
  addJournalEntry(
    userId: string,
    trackerId: string,
    entry: { date: string; text: string }
  ): Promise<string>
  updateJournalEntry(
    userId: string,
    trackerId: string,
    entryId: string,
    text: string
  ): Promise<void>
  toggleRoadmapTopic(
    userId: string,
    trackerId: string,
    monthIndex: number,
    topicId: string,
    done: boolean
  ): Promise<void>
}
