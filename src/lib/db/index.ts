import { firebaseClient } from './firebaseClient'
import type { DataClient } from './types'

export const db: DataClient = firebaseClient

export type { AppSession, DataClient, Unsubscribe } from './types'
