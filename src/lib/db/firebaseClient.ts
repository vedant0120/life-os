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

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

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
    const db = getFirestoreDb()
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

    const batch = writeBatch(db)
    batch.set(
      doc(db, 'users', userId),
      {
        name,
        onboarded: true,
        onboarding_data: {
          currentWeight,
          targetWeight,
          monthlyIncome,
          wakeTime,
          dsaTarget,
          fitnessGoal,
        },
      },
      { merge: true }
    )
    habitData.forEach((h, i) => {
      batch.set(doc(db, 'users', userId, 'habits', habitDocId(h.name)), {
        name: h.name,
        category: h.category,
        color: h.color,
        icon: h.icon,
        priority: i + 1,
        note: h.note,
        active: true,
        created_at: serverTimestamp(),
      })
    })
    await batch.commit()

    if (currentWeight) {
      await addDoc(collection(db, 'users', userId, 'fitness_logs'), {
        user_id: userId,
        date: todayStr(),
        weight: parseFloat(currentWeight),
        calories_eaten: 0,
        calories_burned: 0,
        note: 'Starting weight',
      })
    }
    if (partnerEmail) {
      const snap = await getDocs(
        query(collection(db, 'users'), where('email', '==', partnerEmail), limit(1))
      )
      if (!snap.empty) {
        const partner = snap.docs[0]
        const linkBatch = writeBatch(db)
        linkBatch.update(doc(db, 'users', userId), {
          partner_id: partner.id,
          partner_email: partnerEmail,
          partner_status: 'linked',
        })
        linkBatch.update(doc(db, 'users', partner.id), {
          partner_id: userId,
          partner_status: 'linked',
        })
        await linkBatch.commit()
      }
    }
  },
}
