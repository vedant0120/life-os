// ─── GENERIC CATEGORY PRIMITIVES ─────────────────────────────────────────────
// These are the only hardcoded values remaining in the app. Everything
// user-specific (habits, goals, diet, schedule, finance, health) is either
// seeded through Onboarding or fetched from Firestore.
import type { HabitMeta } from '../types'

export const CAT_COLORS: Record<string, string> = {
  Career: '#3b82f6',
  Health: '#22c55e',
  Fitness: '#f97316',
  Mindset: '#a855f7',
  'Self-Care': '#14b8a6',
  Creative: '#ec4899',
  Life: '#94a3b8',
}

export const CATEGORIES = Object.keys(CAT_COLORS)

// Neutral default metadata for any habit the app hasn't seen before. A future
// epic will back this with a per-user `habit_meta` map in Firestore.
export function getMeta(_h: string): HabitMeta {
  return { cat: 'Life', col: '#94a3b8', icon: '⭐', pri: 99, note: '' }
}
