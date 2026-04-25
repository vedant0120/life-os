import { useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import type { OnboardingPayload } from '../types'
import { CAT_COLORS, CATEGORIES } from '../data/constants'

// ─── Onboarding (P1) ─────────────────────────────────────────────────────────
// 3-step open-ended wizard. The user types every habit + project name in
// their own words. Categories are app primitives (color + icon) — picking one
// only colors the things the user writes; it does NOT pre-create content.
//
// Tone: neutral utility (locked spec 3B). No exclamation marks, no coach copy.

const STEPS = [
  { id: 'name', title: 'Your name' },
  { id: 'categories', title: 'Areas you care about' },
  { id: 'anchors', title: 'Anchor habits' },
  { id: 'goal', title: 'Big goal (optional)' },
]

const inputCls =
  'w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-[15px] text-text outline-none focus:border-brand placeholder:text-muted'

const primaryBtnCls =
  'inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-brand text-black text-[14px] font-semibold hover:bg-brand-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors'

const ghostBtnCls =
  'inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-[14px] text-muted hover:text-text transition-colors'

interface AnchorDraft {
  name: string
  category: string
}

export default function Onboarding({
  onComplete,
}: {
  onComplete: (data: OnboardingPayload) => Promise<void>
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [anchors, setAnchors] = useState<AnchorDraft[]>([
    { name: '', category: '' },
    { name: '', category: '' },
    { name: '', category: '' },
  ])
  const [roadmapName, setRoadmapName] = useState('')
  const [roadmapTarget, setRoadmapTarget] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const usableCategories = useMemo(
    () => (selectedCategories.length > 0 ? selectedCategories : CATEGORIES),
    [selectedCategories]
  )

  const filledAnchors = anchors.filter((a) => a.name.trim().length > 0)
  const canSubmit = name.trim().length > 0

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const addAnchor = () => {
    if (anchors.length >= 5) return
    setAnchors((prev) => [...prev, { name: '', category: '' }])
  }
  const removeAnchor = (i: number) => {
    setAnchors((prev) => prev.filter((_, j) => j !== i))
  }
  const updateAnchor = (i: number, patch: Partial<AnchorDraft>) => {
    setAnchors((prev) => prev.map((a, j) => (j === i ? { ...a, ...patch } : a)))
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onComplete({
        name: name.trim() || 'You',
        selectedCategories,
        anchorHabits: filledAnchors.map((a) => ({
          name: a.name.trim(),
          category: a.category || 'Life',
        })),
        roadmap: roadmapName.trim()
          ? { name: roadmapName.trim(), targetLabel: roadmapTarget.trim() || undefined }
          : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const skipAll = () => {
    void handleSubmit()
  }

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div className="min-h-screen bg-bg text-text font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-[12px] text-muted font-medium">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <button
              type="button"
              onClick={skipAll}
              className="text-muted hover:text-text underline-offset-2 hover:underline"
            >
              Skip and finish
            </button>
          </div>
          <div className="h-1 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full bg-brand transition-[width] duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 0 — Name */}
        {step === 0 && (
          <section>
            <h1 className="text-[28px] font-semibold text-text leading-tight">
              Set up Life OS
            </h1>
            <p className="text-[15px] text-muted mt-2 leading-relaxed">
              Habits, goals, and weekly reviews in one place. Three short steps —
              all skippable.
            </p>
            <div className="mt-8">
              <label className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
                What should we call you?
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                autoFocus
                className={inputCls + ' mt-2'}
              />
            </div>
            <div className="flex justify-end mt-8">
              <button type="button" onClick={next} className={primaryBtnCls}>
                Continue
              </button>
            </div>
          </section>
        )}

        {/* Step 1 — Categories */}
        {step === 1 && (
          <section>
            <h1 className="text-[28px] font-semibold text-text leading-tight">
              Which areas matter to you right now?
            </h1>
            <p className="text-[15px] text-muted mt-2 leading-relaxed">
              Pick the ones you want to track. Categories color your habits.
              They don't create anything by themselves — you fill in the
              specifics next.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-8">
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat)
                const color = CAT_COLORS[cat]
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="text-left rounded-xl border px-4 py-3 transition-colors"
                    style={{
                      background: active ? color + '14' : 'var(--color-surface)',
                      borderColor: active ? color + '66' : 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[14px] font-medium"
                        style={{ color: active ? color : 'var(--color-text)' }}
                      >
                        {cat}
                      </span>
                      <span
                        className="w-4 h-4 rounded border flex items-center justify-center text-[10px]"
                        style={{
                          borderColor: active ? color : 'var(--color-border)',
                          background: active ? color : 'transparent',
                          color: active ? '#000' : 'transparent',
                        }}
                      >
                        ✓
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-8">
              <button type="button" onClick={back} className={ghostBtnCls}>
                Back
              </button>
              <button type="button" onClick={next} className={primaryBtnCls}>
                Continue
              </button>
            </div>
          </section>
        )}

        {/* Step 2 — Anchors */}
        {step === 2 && (
          <section>
            <h1 className="text-[28px] font-semibold text-text leading-tight">
              Add 3–5 anchor habits
            </h1>
            <p className="text-[15px] text-muted mt-2 leading-relaxed">
              Anchors define a good day. Type them in your own words. You can
              edit, add, or remove them later.
            </p>
            <div className="flex flex-col gap-2 mt-8">
              {anchors.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-surface border border-border rounded-xl pl-3 pr-2 py-2"
                >
                  <input
                    value={a.name}
                    onChange={(e) => updateAnchor(i, { name: e.target.value })}
                    placeholder={`Habit ${i + 1}`}
                    className="flex-1 bg-transparent border-0 px-1 py-1.5 text-[15px] text-text outline-none placeholder:text-muted"
                  />
                  <select
                    value={a.category}
                    onChange={(e) => updateAnchor(i, { category: e.target.value })}
                    className="bg-bg border border-border rounded-md px-2 py-1.5 text-[13px] text-muted focus:text-text outline-none"
                  >
                    <option value="">Category</option>
                    {usableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {anchors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAnchor(i)}
                      className="text-muted hover:text-danger p-1"
                      aria-label="Remove anchor"
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  )}
                </div>
              ))}
              {anchors.length < 5 && (
                <button
                  type="button"
                  onClick={addAnchor}
                  className="self-start inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-text mt-1"
                >
                  <Plus size={14} aria-hidden /> Add another
                </button>
              )}
              {filledAnchors.length > 3 && filledAnchors.length <= 5 && (
                <p className="text-[12px] text-warn mt-2">
                  Anchors lose power past 3. Consider keeping it tight.
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-8">
              <button type="button" onClick={back} className={ghostBtnCls}>
                Back
              </button>
              <button type="button" onClick={next} className={primaryBtnCls}>
                Continue
              </button>
            </div>
          </section>
        )}

        {/* Step 3 — Big goal */}
        {step === 3 && (
          <section>
            <h1 className="text-[28px] font-semibold text-text leading-tight">
              One big goal? (optional)
            </h1>
            <p className="text-[15px] text-muted mt-2 leading-relaxed">
              Got a multi-month goal you want to break into phases? We'll
              create an empty roadmap. You can fill in the months and topics
              later. Skip if you don't have one yet.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <div>
                <label className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
                  Goal name
                </label>
                <input
                  value={roadmapName}
                  onChange={(e) => setRoadmapName(e.target.value)}
                  placeholder="What's the goal?"
                  className={inputCls + ' mt-2'}
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
                  Target (optional)
                </label>
                <input
                  value={roadmapTarget}
                  onChange={(e) => setRoadmapTarget(e.target.value)}
                  placeholder="e.g. Oct 2026"
                  className={inputCls + ' mt-2'}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-8 gap-2">
              <button type="button" onClick={back} className={ghostBtnCls}>
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRoadmapName('')
                    setRoadmapTarget('')
                    void handleSubmit()
                  }}
                  className={ghostBtnCls}
                  disabled={submitting}
                >
                  <X size={14} aria-hidden className="mr-1" />
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className={primaryBtnCls}
                >
                  {submitting ? 'Saving…' : 'Finish'}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
