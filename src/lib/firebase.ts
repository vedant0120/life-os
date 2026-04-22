// ─── Firebase lazy initializer ───────────────────────────────────────────────
// Initialization is gated: we only call initializeApp() when the Firebase
// client is actually selected (VITE_BACKEND === 'firebase'). Importing this
// module while VITE_BACKEND is 'supabase' is a no-op — nothing reads the
// env vars until a helper is invoked.
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null

function init(): FirebaseApp {
  if (_app) return _app
  _app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  })
  return _app
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(init())
  return _auth
}

export function getFirestoreDb(): Firestore {
  if (!_db) _db = getFirestore(init())
  return _db
}
