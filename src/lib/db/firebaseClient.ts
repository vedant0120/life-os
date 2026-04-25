// ─── Firebase DataClient ─────────────────────────────────────────────────────
// Firestore-backed DataClient implementation.
//
// Firestore data model (oracle-audited):
//   users/{uid}                              — profile
//   users/{uid}/habits/{habitName}           — habit doc (doc id = encoded name)
//   users/{uid}/logs/{YYYY-MM-DD}            — ONE doc/day, map { entries, weight... }
//   users/{uid}/fitness_logs/{id}
//   users/{uid}/dsa_progress/{topicKey}
//   users/{uid}/startup_progress/{taskKey}
//   accountability_reactions/{id}            — top-level
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  type User,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirestoreDb } from '../firebase'
import { CAT_COLORS } from '../../data/constants'
import type {
  ChecklistItem,
  DSAProgress,
  DietState,
  FinanceSettings,
  FinanceTransaction,
  FitnessLog,
  HabitLog,
  HealthItem,
  JournalPost,
  Profile,
  Reaction,
  RoadmapMonth,
  ScheduleState,
  StartupProgress,
  Status,
  Tracker,
} from '../../types'
import type { AppSession, DataClient, Unsubscribe } from './types'

function toAppSession(u: User | null): AppSession | null {
  if (!u) return null
  return { userId: u.uid, email: u.email }
}

// Habit names contain spaces / punctuation — Firestore doc ids forbid '/'.
// encodeURIComponent is the simplest reversible, deterministic choice.
function habitDocId(name: string): string {
  return encodeURIComponent(name)
}

interface LogDoc {
  entries?: Record<string, Exclude<Status, null>>
}

// Flatten users/{uid}/logs/{date} map docs into the app's HabitLog[] shape.
function flattenLogDocs(
  docs: Array<{ id: string; data: LogDoc }>,
  habitFilter?: (h: string) => boolean
): HabitLog[] {
  const out: HabitLog[] = []
  for (const d of docs) {
    const entries = d.data.entries ?? {}
    for (const [h, s] of Object.entries(entries)) {
      if (habitFilter && !habitFilter(h)) continue
      out.push({ h, d: d.id, s: s as Status })
    }
  }
  return out
}

export const firebaseClient: DataClient = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  onAuthStateChange(cb): Unsubscribe {
    return onAuthStateChanged(getFirebaseAuth(), (u) => cb(toAppSession(u)))
  },
  getSession() {
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
        unsub()
        resolve(toAppSession(u))
      })
    })
  },
  async signInWithPassword(email, password) {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    return { userId: cred.user.uid, email: cred.user.email }
  },
  async signInWithGoogle() {
    const cred = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
    const user = cred.user
    // Create the profile doc on first Google sign-in, mirroring the signUp
    // shape. Use getDoc+setDoc (no merge) so repeat sign-ins don't clobber
    // fields the user has since edited (e.g. partner_status).
    const profileRef = doc(getFirestoreDb(), 'users', user.uid)
    const snap = await getDoc(profileRef)
    if (!snap.exists()) {
      await setDoc(profileRef, {
        id: user.uid,
        email: user.email ?? '',
        name: user.displayName ?? user.email?.split('@')[0] ?? '',
        partner_status: 'none',
        avatar_color: '#818cf8',
        created_at: serverTimestamp(),
      })
    }
    return { userId: user.uid, email: user.email }
  },
  async signUp(email, password, name) {
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
    if (name) await fbUpdateProfile(cred.user, { displayName: name })
    // Create the profile doc immediately on signup (Firebase Auth doesn't
    // fire a server-side trigger in this client-only setup).
    await setDoc(doc(getFirestoreDb(), 'users', cred.user.uid), {
      id: cred.user.uid,
      email,
      name: name ?? email.split('@')[0],
      partner_status: 'none',
      avatar_color: '#818cf8',
      created_at: serverTimestamp(),
    })
    return { userId: cred.user.uid, email: cred.user.email }
  },
  async signOut() {
    await fbSignOut(getFirebaseAuth())
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  async getProfile(userId) {
    const snap = await getDoc(doc(getFirestoreDb(), 'users', userId))
    return snap.exists() ? ({ id: userId, ...snap.data() } as Profile) : null
  },
  async updateProfile(userId, patch) {
    await updateDoc(doc(getFirestoreDb(), 'users', userId), patch)
  },

  // ── Realtime subscriptions ────────────────────────────────────────────────
  subscribeHabits(userId, cb): Unsubscribe {
    const q = query(
      collection(getFirestoreDb(), 'users', userId, 'habits'),
      where('active', '==', true),
      orderBy('priority'),
      limit(100)
    )
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map((d) => (d.data() as { name: string }).name))
    })
  },
  subscribeLogs(userId, cb): Unsubscribe {
    const q = query(
      collection(getFirestoreDb(), 'users', userId, 'logs'),
      orderBy('date', 'desc'),
      limit(90)
    )
    return onSnapshot(q, (snap) => {
      cb(flattenLogDocs(snap.docs.map((d) => ({ id: d.id, data: d.data() as LogDoc }))))
    })
  },
  subscribePartner(partnerId, cb): Unsubscribe {
    return onSnapshot(doc(getFirestoreDb(), 'users', partnerId), (snap) => {
      cb(snap.exists() ? ({ id: partnerId, ...snap.data() } as Profile) : null)
    })
  },
  subscribePartnerHabits(partnerId, cb): Unsubscribe {
    const q = query(
      collection(getFirestoreDb(), 'users', partnerId, 'habits'),
      where('active', '==', true),
      orderBy('priority'),
      limit(100)
    )
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map((d) => (d.data() as { name: string }).name))
    })
  },
  subscribePartnerLogs(partnerId, cb): Unsubscribe {
    const q = query(
      collection(getFirestoreDb(), 'users', partnerId, 'logs'),
      orderBy('date', 'desc'),
      limit(90)
    )
    return onSnapshot(q, (snap) => {
      cb(flattenLogDocs(snap.docs.map((d) => ({ id: d.id, data: d.data() as LogDoc }))))
    })
  },
  subscribeReactions(userId, cb): Unsubscribe {
    // Bounded to 50 most-recent messages either direction (mirrors the
    // `or(to_user.eq, from_user.eq)` filter in DataContext.loadAll).
    const q = query(
      collection(getFirestoreDb(), 'accountability_reactions'),
      where('to_user', '==', userId),
      orderBy('created_at', 'desc'),
      limit(50)
    )
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Reaction) })))
    })
  },

  // ── Data reads ────────────────────────────────────────────────────────────
  async getHabits(userId) {
    const q = query(
      collection(getFirestoreDb(), 'users', userId, 'habits'),
      where('active', '==', true),
      orderBy('priority'),
      limit(100)
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => (d.data() as { name: string }).name)
  },
  async getLogs(userId) {
    const q = query(
      collection(getFirestoreDb(), 'users', userId, 'logs'),
      orderBy('date', 'desc'),
      limit(90)
    )
    const snap = await getDocs(q)
    return flattenLogDocs(snap.docs.map((d) => ({ id: d.id, data: d.data() as LogDoc })))
  },
  async getFitnessLogs(userId) {
    const q = query(collection(getFirestoreDb(), 'users', userId, 'fitness_logs'), orderBy('date'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as FitnessLog) }))
  },
  async getDSAProgress(userId) {
    const snap = await getDocs(collection(getFirestoreDb(), 'users', userId, 'dsa_progress'))
    const p: DSAProgress = {}
    snap.docs.forEach((d) => {
      const data = d.data() as { completed?: boolean }
      if (data.completed) p[d.id] = true
    })
    return p
  },
  async getStartupProgress(userId) {
    const snap = await getDocs(collection(getFirestoreDb(), 'users', userId, 'startup_progress'))
    const p: StartupProgress = {}
    snap.docs.forEach((d) => {
      const data = d.data() as { completed?: boolean }
      if (data.completed) p[d.id] = true
    })
    return p
  },

  // ── Data writes ───────────────────────────────────────────────────────────
  async logHabit(userId, { h, d, s }) {
    // One doc per day holding a map of habit -> status. Using merge so other
    // habits already logged for the same day are preserved.
    const ref = doc(getFirestoreDb(), 'users', userId, 'logs', d)
    await setDoc(ref, { date: d, entries: { [h]: s } }, { merge: true })
  },
  async addHabit(userId, habit) {
    await setDoc(doc(getFirestoreDb(), 'users', userId, 'habits', habitDocId(habit.name)), {
      name: habit.name,
      category: habit.category,
      color: habit.color,
      icon: habit.icon,
      priority: habit.priority ?? 50,
      active: true,
      created_at: serverTimestamp(),
    })
  },
  async toggleDSA(userId, topicKey, value) {
    await setDoc(
      doc(getFirestoreDb(), 'users', userId, 'dsa_progress', topicKey),
      { completed: value, updated_at: serverTimestamp() },
      { merge: true }
    )
  },
  async toggleStartup(userId, taskKey, value) {
    await setDoc(
      doc(getFirestoreDb(), 'users', userId, 'startup_progress', taskKey),
      { completed: value, updated_at: serverTimestamp() },
      { merge: true }
    )
  },
  async addFitnessLog(userId, entry) {
    await addDoc(collection(getFirestoreDb(), 'users', userId, 'fitness_logs'), {
      ...entry,
      user_id: userId,
    })
  },
  async sendReaction(payload) {
    await addDoc(collection(getFirestoreDb(), 'accountability_reactions'), {
      ...payload,
      read: false,
      created_at: serverTimestamp(),
    })
  },
  async markReactionRead(id) {
    await updateDoc(doc(getFirestoreDb(), 'accountability_reactions', id), { read: true })
  },
  async linkPartner(userId, partnerEmail) {
    // Two-sided batch write — sets partner_id on both users atomically.
    const db = getFirestoreDb()
    const snap = await getDocs(
      query(collection(db, 'users'), where('email', '==', partnerEmail), limit(1))
    )
    if (snap.empty) return { error: 'No account found with that email.' }
    const partner = snap.docs[0]
    const batch = writeBatch(db)
    batch.update(doc(db, 'users', userId), {
      partner_id: partner.id,
      partner_email: partnerEmail,
      partner_status: 'linked',
    })
    batch.update(doc(db, 'users', partner.id), {
      partner_id: userId,
      partner_status: 'linked',
    })
    await batch.commit()
    return { success: true }
  },
  async completeOnboarding(userId, payload) {
    // Open-ended onboarding writes:
    //   - profile: name, onboarded=true, anchor_habits[], default settings
    //   - habits subcollection: one doc per anchor with chosen category color
    //   - trackers subcollection: optional empty roadmap if user named one
    // No partner linking, no goal hardcoding, no fitness seed weight — those
    // surfaces have their own dedicated forms post-onboarding.
    const db = getFirestoreDb()
    const { name, selectedCategories, anchorHabits, roadmap } = payload

    const batch = writeBatch(db)
    batch.set(
      doc(db, 'users', userId),
      {
        name,
        onboarded: true,
        anchor_habits: anchorHabits.map((h) => h.name),
        currency: 'USD',
        weight_unit: 'kg',
        review_day: 0, // Sunday
        onboarding_data: { selectedCategories },
      },
      { merge: true }
    )
    const FALLBACK_COLOR = '#94a3b8'
    const FALLBACK_ICON = '⭐'
    anchorHabits.forEach((h, i) => {
      const cat = h.category || 'Life'
      batch.set(doc(db, 'users', userId, 'habits', habitDocId(h.name)), {
        name: h.name,
        category: cat,
        color: CAT_COLORS[cat] || FALLBACK_COLOR,
        icon: FALLBACK_ICON,
        priority: i + 1,
        active: true,
        created_at: serverTimestamp(),
      })
    })
    if (roadmap?.name?.trim()) {
      // addDoc-via-batch isn't supported; we use a deterministic doc ref.
      const ref = doc(collection(db, 'users', userId, 'trackers'))
      batch.set(ref, {
        archetype: 'ordered_roadmap',
        name: roadmap.name.trim(),
        targetLabel: roadmap.targetLabel?.trim() || null,
        order: 0,
        months: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
    await batch.commit()
  },

  // ── Trackers (P2.5) ───────────────────────────────────────────────────────
  // Firestore layout: users/{uid}/trackers/{trackerId} holds the common fields
  // plus archetype-specific embedded arrays (items for checklist, months for
  // roadmap — both bounded). Unbounded time-series (numeric_log entries and
  // freeform_journal entries) live in the `entries` subcollection keyed by
  // YYYY-MM-DD (numeric, one-per-day) or an auto-id (journal, many-per-day).
  subscribeTrackers(userId, cb): Unsubscribe {
    const q = query(
      collection(getFirestoreDb(), 'users', userId, 'trackers'),
      orderBy('order'),
      limit(200)
    )
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Tracker, 'id'>) }) as Tracker))
    })
  },
  async createTracker(userId, tracker) {
    const ref = await addDoc(collection(getFirestoreDb(), 'users', userId, 'trackers'), {
      ...tracker,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  },
  async updateTracker(userId, trackerId, patch) {
    await updateDoc(doc(getFirestoreDb(), 'users', userId, 'trackers', trackerId), {
      ...patch,
      updatedAt: serverTimestamp(),
    })
  },
  async deleteTracker(userId, trackerId) {
    // Note: this does NOT cascade-delete the `entries` subcollection. Client
    // SDK can't do that atomically; a rare cleanup is acceptable for now.
    await deleteDoc(doc(getFirestoreDb(), 'users', userId, 'trackers', trackerId))
  },

  async logNumericEntry(userId, trackerId, entry) {
    // One doc per day; last-write-wins on same date.
    await setDoc(
      doc(getFirestoreDb(), 'users', userId, 'trackers', trackerId, 'entries', entry.date),
      { value: entry.value, note: entry.note ?? null, date: entry.date },
      { merge: true }
    )
  },
  async toggleChecklistItem(userId, trackerId, itemId, done) {
    // Checklist items live IN the tracker doc — read, mutate the matching
    // item, write back. Bounded (~<100 items) so a full rewrite is fine.
    const ref = doc(getFirestoreDb(), 'users', userId, 'trackers', trackerId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data() as { items?: ChecklistItem[] }
    const items = (data.items ?? []).map((it) => (it.id === itemId ? { ...it, done } : it))
    await updateDoc(ref, { items, updatedAt: serverTimestamp() })
  },
  async addJournalEntry(userId, trackerId, entry) {
    const ref = await addDoc(
      collection(getFirestoreDb(), 'users', userId, 'trackers', trackerId, 'entries'),
      { text: entry.text, date: entry.date, createdAt: serverTimestamp() }
    )
    return ref.id
  },
  async updateJournalEntry(userId, trackerId, entryId, text) {
    await updateDoc(
      doc(getFirestoreDb(), 'users', userId, 'trackers', trackerId, 'entries', entryId),
      { text }
    )
  },
  async toggleRoadmapTopic(userId, trackerId, monthIndex, topicId, done) {
    // months[] is embedded in the tracker doc (6-12 months). Read + rewrite
    // the single changed month's topics array.
    const ref = doc(getFirestoreDb(), 'users', userId, 'trackers', trackerId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data() as { months?: RoadmapMonth[] }
    const months = (data.months ?? []).map((m, i) =>
      i === monthIndex
        ? { ...m, topics: m.topics.map((t) => (t.id === topicId ? { ...t, done } : t)) }
        : m
    )
    await updateDoc(ref, { months, updatedAt: serverTimestamp() })
  },

  // ── Journal (top-level) ───────────────────────────────────────────────────
  // users/{uid}/journal_posts/{id} — {type, date, title, content, createdAt}.
  // Kept separate from tracker-scoped journal entries (which live under a
  // specific tracker's `entries` subcollection).
  subscribeJournalPosts(userId, cb): Unsubscribe {
    const q = query(
      collection(getFirestoreDb(), 'users', userId, 'journal_posts'),
      orderBy('date', 'desc'),
      limit(200)
    )
    return onSnapshot(q, (snap) => {
      cb(
        snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as Omit<JournalPost, 'id'>) }) as JournalPost
        )
      )
    })
  },
  async addJournalPost(userId, post) {
    const ref = await addDoc(
      collection(getFirestoreDb(), 'users', userId, 'journal_posts'),
      { ...post, createdAt: serverTimestamp() }
    )
    return ref.id
  },
  async updateJournalPost(userId, id, patch) {
    await updateDoc(doc(getFirestoreDb(), 'users', userId, 'journal_posts', id), patch)
  },
  async deleteJournalPost(userId, id) {
    await deleteDoc(doc(getFirestoreDb(), 'users', userId, 'journal_posts', id))
  },

  // ── Finance ───────────────────────────────────────────────────────────────
  // Transactions live as one doc per tx in users/{uid}/transactions. Budgets
  // (and any future finance settings) live in users/{uid}/settings/finance.
  subscribeTransactions(userId, cb): Unsubscribe {
    const q = query(
      collection(getFirestoreDb(), 'users', userId, 'transactions'),
      orderBy('date', 'desc'),
      limit(500)
    )
    return onSnapshot(q, (snap) => {
      cb(
        snap.docs.map(
          (d) =>
            ({
              id: d.id,
              ...(d.data() as Omit<FinanceTransaction, 'id'>),
            }) as FinanceTransaction
        )
      )
    })
  },
  async addTransaction(userId, tx) {
    const ref = await addDoc(
      collection(getFirestoreDb(), 'users', userId, 'transactions'),
      { ...tx, createdAt: serverTimestamp() }
    )
    return ref.id
  },
  async deleteTransaction(userId, id) {
    await deleteDoc(doc(getFirestoreDb(), 'users', userId, 'transactions', id))
  },
  subscribeFinanceSettings(userId, cb): Unsubscribe {
    return onSnapshot(
      doc(getFirestoreDb(), 'users', userId, 'settings', 'finance'),
      (snap) => {
        cb(snap.exists() ? (snap.data() as FinanceSettings) : null)
      }
    )
  },
  async updateFinanceSettings(userId, patch) {
    // Merge so budgets map is spread-patched and other future fields survive.
    await setDoc(
      doc(getFirestoreDb(), 'users', userId, 'settings', 'finance'),
      patch,
      { merge: true }
    )
  },

  // ── Diet ──────────────────────────────────────────────────────────────────
  // Single settings doc users/{uid}/settings/diet — meals + notes arrays.
  subscribeDietState(userId, cb): Unsubscribe {
    return onSnapshot(
      doc(getFirestoreDb(), 'users', userId, 'settings', 'diet'),
      (snap) => {
        cb(snap.exists() ? (snap.data() as DietState) : null)
      }
    )
  },
  async updateDietState(userId, patch) {
    await setDoc(
      doc(getFirestoreDb(), 'users', userId, 'settings', 'diet'),
      patch,
      { merge: true }
    )
  },

  // ── Health items ──────────────────────────────────────────────────────────
  // Each tracked health concern lives as its own doc so we can later attach
  // a history sub-collection without a parent rewrite.
  subscribeHealthItems(userId, cb): Unsubscribe {
    const q = query(
      collection(getFirestoreDb(), 'users', userId, 'health_items'),
      orderBy('createdAt', 'desc'),
      limit(100)
    )
    return onSnapshot(q, (snap) => {
      cb(
        snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as Omit<HealthItem, 'id'>) }) as HealthItem
        )
      )
    })
  },
  async addHealthItem(userId, item) {
    const ref = await addDoc(
      collection(getFirestoreDb(), 'users', userId, 'health_items'),
      { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
    )
    return ref.id
  },
  async updateHealthItem(userId, id, patch) {
    await updateDoc(doc(getFirestoreDb(), 'users', userId, 'health_items', id), {
      ...patch,
      updatedAt: serverTimestamp(),
    })
  },
  async deleteHealthItem(userId, id) {
    await deleteDoc(doc(getFirestoreDb(), 'users', userId, 'health_items', id))
  },

  // ── Schedule ──────────────────────────────────────────────────────────────
  // Single doc users/{uid}/settings/schedule with ordered items array.
  subscribeScheduleState(userId, cb): Unsubscribe {
    return onSnapshot(
      doc(getFirestoreDb(), 'users', userId, 'settings', 'schedule'),
      (snap) => {
        cb(snap.exists() ? (snap.data() as ScheduleState) : null)
      }
    )
  },
  async updateScheduleState(userId, patch) {
    await setDoc(
      doc(getFirestoreDb(), 'users', userId, 'settings', 'schedule'),
      patch,
      { merge: true }
    )
  },
}
