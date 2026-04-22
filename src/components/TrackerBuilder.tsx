import { useEffect, useState } from 'react'
import Sheet from './ui/Sheet'
import { db } from '../lib/db'
import { useAuth } from '../stores/AuthContext'
import type { Tracker, TrackerArchetype } from '../types'

// ─── Archetype picker metadata (design brief §5) ─────────────────────────────
interface ArchetypeCard {
  key: TrackerArchetype
  emoji: string
  name: string
  hint: string
  example: string
}

const ARCHETYPES: ArchetypeCard[] = [
  {
    key: 'streak_habit',
    emoji: '🔁',
    name: 'Streak habit',
    hint: 'Daily yes/no check',
    example: 'e.g. Meditate',
  },
  {
    key: 'ordered_roadmap',
    emoji: '🗺️',
    name: 'Ordered roadmap',
    hint: 'Phased multi-month plan',
    example: 'e.g. DSA Apr–Sep',
  },
  {
    key: 'numeric_log',
    emoji: '📊',
    name: 'Numeric log',
    hint: 'Daily number toward a goal',
    example: 'e.g. Weight → 78kg',
  },
  {
    key: 'checklist',
    emoji: '✅',
    name: 'Checklist',
    hint: 'One-time list of items',
    example: 'e.g. Q4 side-project',
  },
  {
    key: 'freeform_journal',
    emoji: '📓',
    name: 'Freeform journal',
    hint: 'Dated text entries',
    example: 'e.g. Morning pages',
  },
]

// Build a union-typed creation payload per archetype so the discriminated
// Tracker union stays intact (no `as any`). Archetype-specific fields seeded
// with minimal viable defaults; Phase 3 tab epics will extend the form.
function buildPayload(
  archetype: TrackerArchetype,
  common: { name: string; emoji: string; color: string }
): Omit<Tracker, 'id'> {
  switch (archetype) {
    case 'streak_habit': {
      const t: Omit<Extract<Tracker, { archetype: 'streak_habit' }>, 'id'> = {
        ...common,
        archetype,
        habitName: common.name,
      }
      return t
    }
    case 'ordered_roadmap': {
      const t: Omit<Extract<Tracker, { archetype: 'ordered_roadmap' }>, 'id'> = {
        ...common,
        archetype,
        months: [],
      }
      return t
    }
    case 'numeric_log': {
      const t: Omit<Extract<Tracker, { archetype: 'numeric_log' }>, 'id'> = {
        ...common,
        archetype,
        unit: '',
        dailyGoal: 0,
      }
      return t
    }
    case 'checklist': {
      const t: Omit<Extract<Tracker, { archetype: 'checklist' }>, 'id'> = {
        ...common,
        archetype,
        items: [],
      }
      return t
    }
    case 'freeform_journal': {
      const t: Omit<Extract<Tracker, { archetype: 'freeform_journal' }>, 'id'> = {
        ...common,
        archetype,
      }
      return t
    }
  }
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function TrackerBuilder({ open, onClose }: Props) {
  const { session } = useAuth()
  const [step, setStep] = useState<'pick' | 'configure'>('pick')
  const [archetype, setArchetype] = useState<TrackerArchetype | undefined>()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('pick')
      setArchetype(undefined)
      setName('')
      setEmoji('🎯')
      setSubmitting(false)
    }
  }, [open])

  async function submit() {
    if (!session || !archetype || !name.trim()) return
    setSubmitting(true)
    try {
      await db.createTracker(
        session.userId,
        buildPayload(archetype, { name: name.trim(), emoji, color: '#6366F1' })
      )
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const title = step === 'pick' ? 'Add tracker' : `Configure ${archetype}`

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {step === 'pick' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {ARCHETYPES.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => {
                setArchetype(a.key)
                setStep('configure')
              }}
              className="flex flex-col items-start gap-1 rounded-xl border border-border bg-surface p-3 text-left hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <div className="text-2xl" aria-hidden>
                {a.emoji}
              </div>
              <div className="text-sm font-semibold text-text">{a.name}</div>
              <div className="text-xs text-muted">{a.hint}</div>
              <div className="text-xs text-muted italic">{a.example}</div>
            </button>
          ))}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-brand focus:outline-none"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Emoji</span>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-20 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-brand focus:outline-none"
            />
          </label>
          <div className="text-muted text-xs">
            Archetype-specific fields coming in the next epic
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep('pick')}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      )}
    </Sheet>
  )
}
