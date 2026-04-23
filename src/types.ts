// ─── Shared domain types for Life OS ─────────────────────────────────────────
// These shapes mirror the actual runtime data that flows between Firestore
// and the React components. They are intentionally narrow — only the fields
// actually read/written by the current code are typed.

// Daily log status for a habit check-in. `null` means "not logged yet today".
export type Status = 'success' | 'fail' | 'skip' | null

// Habits are still represented as plain strings (the habit name) across the
// store. We keep the alias so future refactors can swap in a richer shape
// without touching every call-site.
export type Habit = string

// A single habit log record, normalized for in-memory use (see App.tsx loaders
// which map day-doc entries {habit_name, date, status} -> {h, d, s}).
export interface HabitLog {
  h: string
  d: string
  s: Status
}

// Habit metadata (category, color, icon, priority, note). The legacy
// hardcoded map has been removed; getMeta() in src/data/constants.ts returns
// a neutral default for any habit. A future epic can back this with a
// per-user Firestore map.
export interface HabitMeta {
  cat: string
  col: string
  icon: string
  pri: number
  note: string
}

// Profile row from the `users/{uid}` Firestore doc. Only fields the
// app actually reads are required; everything else is optional.
export interface Profile {
  id: string
  email?: string | null
  name?: string | null
  partner_id?: string | null
  partner_email?: string | null
  partner_status?: string | null
  avatar_color?: string | null
  onboarding_data?: Record<string, unknown> | null
  created_at?: string | null
}

// Reaction / message row from public.accountability_reactions.
export interface Reaction {
  id?: string
  from_user: string
  to_user: string
  type: 'fire' | 'nudge' | 'cheer' | 'message'
  habit_name?: string | null
  message?: string | null
  date?: string
  read?: boolean
  created_at?: string
}

// Fitness log row from public.fitness_logs.
export interface FitnessLog {
  id?: string
  user_id?: string
  date: string
  weight?: number | null
  calories_eaten?: number | null
  calories_burned?: number | null
  note?: string | null
}

// DSA + Startup progress are stored as `{ [key]: true }` where key is
// `${monthIndex}-${itemIndex}` (see Trackers.tsx + App.tsx loaders).
export type DSAProgress = Record<string, boolean>
export type StartupProgress = Record<string, boolean>
// Goal progress table stores arbitrary 0-100 numbers keyed by goal_id.
export type GoalProgress = Record<string, number>

// Per-habit aggregated stats computed by calcStats() in components/shared.tsx.
export interface HabitStats {
  rate: number
  current: number
  longest: number
  total: number
}

// Shape of the onboarding wizard payload passed to App.handleOnboardingComplete.
export interface OnboardingPayload {
  name: string
  focusAreas: string[]
  selectedHabits: string[]
  dsaTarget: string
  fitnessGoal: string
  currentWeight: string
  targetWeight: string
  monthlyIncome: string
  wakeTime: string
  partnerEmail: string
  habitData: OnboardingHabit[]
}

// Habit template entry used by the onboarding wizard.
export interface OnboardingHabit {
  name: string
  category: string
  color: string
  icon: string
  priority: number
  note: string
}

// NOTE: The old `SharedProps` interface was removed in Epic 4 — components
// now read state and actions from `useAuth()` / `useData()` (src/stores/)
// instead of receiving prop blobs from App.tsx.

// ─── Tracker archetypes (P2.5) ───────────────────────────────────────────────
// Five shapes of "thing a user wants to track" surface in the app. Modeled as
// a discriminated union on `archetype` so the TrackerBuilder (P2.6) and the
// Trackers tab (P3.4) can branch at the type level without casts.
export type TrackerArchetype =
  | 'streak_habit'
  | 'ordered_roadmap'
  | 'numeric_log'
  | 'checklist'
  | 'freeform_journal'

// Fields every tracker has. `createdAt` / `updatedAt` are Firestore server
// timestamps on the wire; kept as `unknown` to avoid leaking the SDK type.
export interface TrackerCommon {
  id: string
  archetype: TrackerArchetype
  name: string
  emoji?: string
  color?: string
  order?: number
  createdAt?: unknown
  updatedAt?: unknown
}

// Streak habits reuse the users/{uid}/habits collection. This variant exists
// so the union covers all five archetypes uniformly; the doc lives elsewhere.
export interface StreakHabitTracker extends TrackerCommon {
  archetype: 'streak_habit'
  habitName: string
}

export interface RoadmapTopic {
  id: string
  label: string
  done?: boolean
}
export interface RoadmapMonth {
  label: string
  topics: RoadmapTopic[]
}
export interface OrderedRoadmapTracker extends TrackerCommon {
  archetype: 'ordered_roadmap'
  months: RoadmapMonth[]
  targetLabel?: string
}

export interface NumericLogTracker extends TrackerCommon {
  archetype: 'numeric_log'
  unit?: string
  dailyGoal?: number
}
export interface NumericEntry {
  date: string // YYYY-MM-DD (doc id)
  value: number
  note?: string
}

export interface ChecklistItem {
  id: string
  label: string
  done?: boolean
}
export interface ChecklistTracker extends TrackerCommon {
  archetype: 'checklist'
  items: ChecklistItem[]
}

export interface FreeformJournalTracker extends TrackerCommon {
  archetype: 'freeform_journal'
  prompt?: string
}
export interface JournalEntry {
  id: string
  date: string // YYYY-MM-DD
  text: string
  createdAt?: unknown
}

export type Tracker =
  | StreakHabitTracker
  | OrderedRoadmapTracker
  | NumericLogTracker
  | ChecklistTracker
  | FreeformJournalTracker

// ─── Journal (P4 top-level tab) ──────────────────────────────────────────────
// Distinct from the tracker-scoped `JournalEntry` above: this is the app-wide
// journal surfaced as its own tab. Lives in users/{uid}/journal_posts.
export type JournalPostType = 'daily' | 'weekly' | 'monthly'

export interface JournalPost {
  id: string
  type: JournalPostType
  date: string // YYYY-MM-DD
  title: string
  content: string
  createdAt?: unknown
}

// ─── Finance (P4 top-level tab) ──────────────────────────────────────────────
// users/{uid}/transactions/{id} — append-only ledger
// users/{uid}/settings/finance — single doc { budgets: {catId: number} }
export type FinanceTxType = 'income' | 'expense' | 'invest'

export interface FinanceTransaction {
  id: string
  type: FinanceTxType
  date: string // YYYY-MM-DD
  amount: number
  category: string // expense cat id, income cat id, or invest bucket id
  note?: string
  createdAt?: unknown
}

export interface FinanceSettings {
  budgets: Record<string, number>
}
