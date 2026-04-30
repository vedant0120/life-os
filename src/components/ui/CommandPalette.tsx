import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sun,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Wallet,
  Utensils,
  Heart,
  Calendar,
  Users,
  LogOut,
  Download,
  BookText,
  CalendarCheck,
  Settings as SettingsIcon,
  Check,
  Pencil,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../stores/AuthContext'
import { useData } from '../../stores/DataContext'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { todayStr } from '../shared'
import { EXPENSE_CATS, INCOME_CATS } from '../../data/finance'
import Sheet from './Sheet'

// ⌘K palette — three modes:
//   • root      → list of capture actions + nav shortcuts (default)
//   • capture   → an inline form for a specific capture type
// Capture order is locked: habit → expense → journal → meal → weight.

type CaptureKind =
  | 'habit'
  | 'expense'
  | 'journal'
  | 'meal'
  | 'weight'
  | null

interface NavCommand {
  kind: 'nav'
  id: string
  label: string
  Icon: LucideIcon
  to: string
}

interface CaptureCommand {
  kind: 'capture'
  id: CaptureKind & string
  label: string
  Icon: LucideIcon
}

interface ActionCommand {
  kind: 'action'
  id: string
  label: string
  Icon: LucideIcon
  action: () => void
}

type Command = NavCommand | CaptureCommand | ActionCommand

const NAV_TABS: { id: string; label: string; Icon: LucideIcon; to: string }[] = [
  { id: 'today', label: 'Go to Today', Icon: Sun, to: '/today' },
  { id: 'review', label: 'Go to Weekly review', Icon: CalendarCheck, to: '/review' },
  { id: 'journal', label: 'Go to Journal', Icon: BookText, to: '/journal' },
  { id: 'habits', label: 'Go to Habits', Icon: CheckSquare, to: '/habits' },
  { id: 'trackers', label: 'Go to Trackers', Icon: BarChart3, to: '/trackers' },
  { id: 'analytics', label: 'Go to Analytics', Icon: TrendingUp, to: '/analytics' },
  { id: 'finance', label: 'Go to Finance', Icon: Wallet, to: '/finance' },
  { id: 'diet', label: 'Go to Diet', Icon: Utensils, to: '/diet' },
  { id: 'health', label: 'Go to Health', Icon: Heart, to: '/health' },
  { id: 'schedule', label: 'Go to Schedule', Icon: Calendar, to: '/schedule' },
  { id: 'accountability', label: 'Go to Accountability', Icon: Users, to: '/accountability' },
  { id: 'settings', label: 'Open Settings', Icon: SettingsIcon, to: '/settings' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const {
    habits,
    logHabit,
    addTransaction,
    addJournalPost,
    addFitnessLog,
    diet,
    updateDiet,
  } = useData()
  const { canInstall, promptInstall } = useInstallPrompt()
  const [mode, setMode] = useState<CaptureKind>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const captureActions: CaptureCommand[] = useMemo(
    () => [
      { kind: 'capture', id: 'habit', label: 'Log a habit', Icon: Check },
      { kind: 'capture', id: 'expense', label: 'Add an expense', Icon: Wallet },
      { kind: 'capture', id: 'journal', label: 'Quick journal note', Icon: Pencil },
      { kind: 'capture', id: 'meal', label: 'Log a meal', Icon: Utensils },
      { kind: 'capture', id: 'weight', label: 'Log weight', Icon: Activity },
    ],
    []
  )

  const commands: Command[] = useMemo(() => {
    const list: Command[] = [...captureActions]
    NAV_TABS.forEach((t) =>
      list.push({ kind: 'nav', id: `nav:${t.id}`, label: t.label, Icon: t.Icon, to: t.to })
    )
    list.push({
      kind: 'action',
      id: 'sign-out',
      label: 'Sign out',
      Icon: LogOut,
      action: () => {
        void signOut()
        navigate('/auth')
      },
    })
    if (canInstall) {
      list.push({
        kind: 'action',
        id: 'install',
        label: 'Install app',
        Icon: Download,
        action: () => void promptInstall(),
      })
    }
    return list
  }, [captureActions, navigate, signOut, canInstall, promptInstall])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => c.label.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    if (open) {
      setMode(null)
      setQuery('')
      setSelected(0)
      const id = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  const closeAll = () => {
    setMode(null)
    setQuery('')
    onClose()
  }

  const run = (cmd: Command) => {
    if (cmd.kind === 'nav') {
      closeAll()
      navigate(cmd.to)
    } else if (cmd.kind === 'capture') {
      setMode(cmd.id as CaptureKind)
      setQuery('')
    } else {
      closeAll()
      cmd.action()
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (mode) return // capture mode handles its own keys
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => (filtered.length ? (s + 1) % filtered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => (filtered.length ? (s - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[selected]
      if (cmd) run(cmd)
    }
  }

  return (
    <Sheet open={open} onClose={closeAll} title={mode ? captureTitle(mode) : 'Quick capture'}>
      <div onKeyDown={onKeyDown}>
        {!mode && (
          <>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search · Enter to run · Esc to close"
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-2 border border-border text-[14px] text-text placeholder:text-muted focus:outline-none focus:border-brand"
            />
            <ul className="mt-3 max-h-96 overflow-y-auto flex flex-col gap-0.5">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-[14px] text-muted">No matches</li>
              )}
              {filtered.map((cmd, i) => {
                const { Icon } = cmd
                const isCapture = cmd.kind === 'capture'
                return (
                  <li
                    key={cmd.id}
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => run(cmd)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] cursor-pointer ${
                      i === selected ? 'bg-surface-2 text-text' : 'text-muted'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isCapture ? 'text-brand' : ''}
                      aria-hidden
                    />
                    <span className="flex-1">{cmd.label}</span>
                    {isCapture && (
                      <span className="text-[11px] text-muted">capture</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {mode === 'habit' && (
          <CaptureHabit
            habits={habits}
            onSubmit={async (habit, status) => {
              await logHabit(habit, status)
              closeAll()
            }}
            onCancel={() => setMode(null)}
          />
        )}
        {mode === 'expense' && (
          <CaptureExpense
            onSubmit={async (entry) => {
              await addTransaction(entry)
              closeAll()
            }}
            onCancel={() => setMode(null)}
          />
        )}
        {mode === 'journal' && (
          <CaptureJournal
            onSubmit={async (text) => {
              await addJournalPost({
                type: 'daily',
                date: todayStr(),
                title: 'Quick note',
                content: text,
              })
              closeAll()
            }}
            onCancel={() => setMode(null)}
          />
        )}
        {mode === 'meal' && (
          <CaptureMeal
            onSubmit={async (text) => {
              await updateDiet({ notes: [...diet.notes, text] })
              closeAll()
            }}
            onCancel={() => setMode(null)}
          />
        )}
        {mode === 'weight' && (
          <CaptureWeight
            onSubmit={async (weight, note) => {
              await addFitnessLog({
                weight,
                note,
                date: todayStr(),
                calories_eaten: 0,
                calories_burned: 0,
              })
              closeAll()
            }}
            onCancel={() => setMode(null)}
          />
        )}
      </div>
    </Sheet>
  )
}

function captureTitle(kind: Exclude<CaptureKind, null>): string {
  return {
    habit: 'Log a habit',
    expense: 'Add an expense',
    journal: 'Quick journal note',
    meal: 'Log a meal',
    weight: 'Log weight',
  }[kind]
}

const fieldCls =
  'w-full bg-bg border border-border rounded-lg px-3 py-2 text-[14px] text-text outline-none focus:border-brand'
const primaryBtn =
  'inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-brand text-black text-[14px] font-semibold hover:bg-brand-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
const ghostBtn =
  'inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-surface-2 border border-border text-[14px] text-muted hover:text-text transition-colors'

// ─── Capture forms ───────────────────────────────────────────────────────────

function CaptureHabit({
  habits,
  onSubmit,
  onCancel,
}: {
  habits: string[]
  onSubmit: (habit: string, status: 'success' | 'fail' | 'skip') => Promise<void>
  onCancel: () => void
}) {
  const [picked, setPicked] = useState<string>(habits[0] || '')
  const [status, setStatus] = useState<'success' | 'fail' | 'skip'>('success')
  const [busy, setBusy] = useState(false)
  if (!habits.length) {
    return (
      <div className="text-[14px] text-muted py-2">
        No habits yet. Add one from the Habits tab first.
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
        Habit
      </label>
      <select value={picked} onChange={(e) => setPicked(e.target.value)} className={fieldCls}>
        {habits.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        {(['success', 'skip', 'fail'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-semibold border transition-colors ${
              status === s
                ? s === 'success'
                  ? 'border-success bg-success/15 text-success'
                  : s === 'fail'
                    ? 'border-danger bg-danger/15 text-danger'
                    : 'border-warn bg-warn/15 text-warn'
                : 'border-border text-muted'
            }`}
          >
            {s === 'success' ? 'Done' : s === 'fail' ? 'Missed' : 'Skip'}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" onClick={onCancel} className={ghostBtn}>
          Back
        </button>
        <button
          type="button"
          disabled={!picked || busy}
          onClick={async () => {
            setBusy(true)
            try {
              await onSubmit(picked, status)
            } finally {
              setBusy(false)
            }
          }}
          className={primaryBtn}
        >
          {busy ? 'Saving…' : 'Log'}
        </button>
      </div>
    </div>
  )
}

function CaptureExpense({
  onSubmit,
  onCancel,
}: {
  onSubmit: (entry: {
    type: 'expense' | 'income'
    date: string
    amount: number
    category: string
    note: string
  }) => Promise<void>
  onCancel: () => void
}) {
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATS[0].id)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const opts = type === 'expense' ? EXPENSE_CATS : INCOME_CATS
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t)
              setCategory(t === 'expense' ? EXPENSE_CATS[0].id : INCOME_CATS[0].id)
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-semibold border transition-colors ${
              type === t
                ? t === 'expense'
                  ? 'border-danger bg-danger/15 text-danger'
                  : 'border-success bg-success/15 text-success'
                : 'border-border text-muted'
            }`}
          >
            {t === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
          className={fieldCls}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={fieldCls}
        >
          {opts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <input
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={fieldCls}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" onClick={onCancel} className={ghostBtn}>
          Back
        </button>
        <button
          type="button"
          disabled={!amount || busy}
          onClick={async () => {
            setBusy(true)
            try {
              await onSubmit({
                type,
                amount: Math.abs(Number(amount)),
                category,
                note,
                date: todayStr(),
              })
            } finally {
              setBusy(false)
            }
          }}
          className={primaryBtn}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function CaptureJournal({
  onSubmit,
  onCancel,
}: {
  onSubmit: (text: string) => Promise<void>
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <textarea
        rows={5}
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        className={fieldCls + ' resize-y leading-relaxed'}
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={ghostBtn}>
          Back
        </button>
        <button
          type="button"
          disabled={!text.trim() || busy}
          onClick={async () => {
            setBusy(true)
            try {
              await onSubmit(text.trim())
            } finally {
              setBusy(false)
            }
          }}
          className={primaryBtn}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function CaptureMeal({
  onSubmit,
  onCancel,
}: {
  onSubmit: (text: string) => Promise<void>
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-muted">
        Adds a one-line note to your Diet tab. Macros + meal-by-meal logging
        comes in P4.
      </p>
      <input
        placeholder="What did you eat?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        className={fieldCls}
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={ghostBtn}>
          Back
        </button>
        <button
          type="button"
          disabled={!text.trim() || busy}
          onClick={async () => {
            setBusy(true)
            try {
              await onSubmit(text.trim())
            } finally {
              setBusy(false)
            }
          }}
          className={primaryBtn}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function CaptureWeight({
  onSubmit,
  onCancel,
}: {
  onSubmit: (weight: number, note: string) => Promise<void>
  onCancel: () => void
}) {
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <input
        type="number"
        inputMode="decimal"
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        autoFocus
        className={fieldCls}
      />
      <input
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={fieldCls}
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={ghostBtn}>
          Back
        </button>
        <button
          type="button"
          disabled={!weight || busy}
          onClick={async () => {
            setBusy(true)
            try {
              await onSubmit(Number(weight), note)
            } finally {
              setBusy(false)
            }
          }}
          className={primaryBtn}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

