// ─── Shared domain types for Life OS ─────────────────────────────────────────
// These shapes mirror the actual runtime data that flows between Supabase
// and the React components. They are intentionally narrow — only the fields
// actually read/written by the current code are typed. Broader schemas live
// in supabase/schema.sql.
import type { Session } from '@supabase/supabase-js'

export type { Session }

// Daily log status for a habit check-in. `null` means "not logged yet today".
export type Status = 'success' | 'fail' | 'skip' | null

// Habits are still represented as plain strings (the habit name) across the
// store. We keep the alias so future refactors can swap in a richer shape
// without touching every call-site.
export type Habit = string

// A single habit log record, normalized for in-memory use (see App.tsx loaders
// which map Supabase rows {habit_name, date, status} -> {h, d, s}).
export interface HabitLog {
  h: string
  d: string
  s: Status
}

// Habit metadata (category, color, icon, priority, note) as defined in
// src/data/constants.ts HABIT_META.
export interface HabitMeta {
  cat: string
  col: string
  icon: string
  pri: number
  note: string
}

// Profile row from public.profiles (supabase/schema.sql). Only fields the
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
