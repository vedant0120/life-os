import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, RefreshCw } from 'lucide-react'
import { Card, PageHeader, SectionTitle } from './ui/primitives'
import { useAuth } from '../stores/AuthContext'
import { useData } from '../stores/DataContext'

const CURRENCIES = [
  { id: 'USD', label: 'USD — US Dollar' },
  { id: 'EUR', label: 'EUR — Euro' },
  { id: 'GBP', label: 'GBP — British Pound' },
  { id: 'INR', label: 'INR — Indian Rupee' },
  { id: 'CAD', label: 'CAD — Canadian Dollar' },
  { id: 'AUD', label: 'AUD — Australian Dollar' },
]

const REVIEW_DAYS = [
  { id: 0, label: 'Sunday' },
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
] as const

const inputCls =
  'bg-bg border border-border rounded-lg px-3 py-2 text-[14px] text-text outline-none focus:border-brand'

export default function Settings() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { updateMyProfile } = useData()
  const [busy, setBusy] = useState(false)

  if (!profile) return null

  const set = async (patch: Partial<typeof profile>) => {
    setBusy(true)
    try {
      await updateMyProfile(patch)
    } finally {
      setBusy(false)
    }
  }

  const reRunSetup = async () => {
    if (!confirm('Re-run the welcome setup? Your existing habits and data stay.')) return
    await set({ onboarded: false })
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="App preferences and account" />

      {/* Profile */}
      <Card>
        <SectionTitle>Profile</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
              Display name
            </label>
            <input
              defaultValue={profile.name || ''}
              onBlur={(e) => {
                const v = e.target.value.trim()
                if (v && v !== profile.name) void set({ name: v })
              }}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
              Email
            </label>
            <div className="px-3 py-2 text-[14px] text-muted">
              {profile.email || '—'}
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <SectionTitle>Preferences</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
              Currency
            </label>
            <select
              value={profile.currency || 'USD'}
              onChange={(e) => void set({ currency: e.target.value })}
              className={inputCls}
              disabled={busy}
            >
              {CURRENCIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
              Weight unit
            </label>
            <select
              value={profile.weight_unit || 'kg'}
              onChange={(e) =>
                void set({ weight_unit: e.target.value as 'kg' | 'lb' })
              }
              className={inputCls}
              disabled={busy}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
              Weekly review day
            </label>
            <select
              value={profile.review_day ?? 0}
              onChange={(e) =>
                void set({
                  review_day: Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                })
              }
              className={inputCls}
              disabled={busy}
            >
              {REVIEW_DAYS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Setup */}
      <Card>
        <SectionTitle>Setup</SectionTitle>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={reRunSetup}
            className="self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-2 border border-border text-[14px] text-text hover:border-border-strong transition-colors"
          >
            <RefreshCw size={14} aria-hidden /> Re-run welcome setup
          </button>
          <p className="text-[13px] text-muted">
            Walks you back through name, categories, anchors, and goal.
            Existing habits and data stay.
          </p>
        </div>
      </Card>

      {/* Account */}
      <Card>
        <SectionTitle>Account</SectionTitle>
        <button
          type="button"
          onClick={() => void signOut()}
          className="self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-2 border border-border text-[14px] text-text hover:border-border-strong transition-colors"
        >
          <LogOut size={14} aria-hidden /> Sign out
        </button>
      </Card>
    </div>
  )
}
