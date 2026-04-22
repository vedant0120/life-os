// ─── Backend selector ────────────────────────────────────────────────────────
// Selects the active DataClient at module load based on VITE_BACKEND.
// Defaults to 'supabase' so existing deployments keep working without env
// changes. The choice is static — it cannot change at runtime.
import { supabaseClient } from './supabaseClient'
import { firebaseClient } from './firebaseClient'
import type { DataClient } from './types'

const backend = (import.meta.env.VITE_BACKEND ?? 'supabase') as 'supabase' | 'firebase'

export const db: DataClient = backend === 'firebase' ? firebaseClient : supabaseClient
export const activeBackend = backend

export type { AppSession, DataClient, Unsubscribe } from './types'
