// ─── Firebase lazy initializer ───────────────────────────────────────────────
// Initialization is lazy: initializeApp() only runs on first helper invocation,
// so importing this module is cheap and doesn't read env vars at module load.
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
