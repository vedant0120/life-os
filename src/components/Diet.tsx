import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, SectionTitle, Badge } from './ui/primitives'
import { useData } from '../stores/DataContext'
import type { DietMeal } from '../types'

const inputCls =
  'bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-brand w-full'

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function emptyForm(): DietMeal {
  return { id: '', name: '', time: '', items: '', kcal: 0, protein: 0 }
}

export default function Diet() {
  const { diet, updateDiet } = useData()
  const meals = diet.meals
  const notes = diet.notes

  const totalKcal = meals.reduce((a, m) => a + (m.kcal || 0), 0)
  const totalProtein = meals.reduce((a, m) => a + (m.protein || 0), 0)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<DietMeal>(emptyForm())

  const [noteEditingIdx, setNoteEditingIdx] = useState<number | null>(null)
  const [noteAdding, setNoteAdding] = useState(false)
  const [noteText, setNoteText] = useState('')

  const startEdit = (m: DietMeal) => {
    setEditingId(m.id)
    setForm({ ...m })
  }
  const cancelMealForm = () => {
    setEditingId(null)
    setAdding(false)
    setForm(emptyForm())
  }
  const saveMeal = async () => {
    if (!form.name.trim()) return
    const cleaned: DietMeal = {
      ...form,
      id: editingId || uid(),
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
    }
    const nextMeals = editingId
      ? meals.map((m) => (m.id === editingId ? cleaned : m))
      : [...meals, cleaned]
    await updateDiet({ meals: nextMeals })
    cancelMealForm()
  }
  const deleteMeal = async (id: string) => {
    await updateDiet({ meals: meals.filter((m) => m.id !== id) })
  }

  const saveNote = async () => {
    if (!noteText.trim()) return
    if (noteEditingIdx !== null) {
      const next = notes.map((n, i) => (i === noteEditingIdx ? noteText.trim() : n))
      await updateDiet({ notes: next })
    } else {
      await updateDiet({ notes: [...notes, noteText.trim()] })
    }
    setNoteEditingIdx(null)
    setNoteAdding(false)
    setNoteText('')
  }
  const deleteNote = async (i: number) => {
    await updateDiet({ notes: notes.filter((_, j) => j !== i) })
  }

  const renderMealForm = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <input
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        placeholder="Meal name"
        autoFocus
        className={inputCls}
      />
      <input
        value={form.time}
        onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
        placeholder="Time (e.g. 6:30 AM)"
        className={inputCls}
      />
      <input
        value={form.items}
        onChange={(e) => setForm((f) => ({ ...f, items: e.target.value }))}
        placeholder="Items"
        className={`${inputCls} sm:col-span-2`}
      />
      <input
        type="number"
        value={form.kcal || ''}
        onChange={(e) => setForm((f) => ({ ...f, kcal: Number(e.target.value) }))}
        placeholder="kcal"
        className={inputCls}
      />
      <input
        type="number"
        value={form.protein || ''}
        onChange={(e) => setForm((f) => ({ ...f, protein: Number(e.target.value) }))}
        placeholder="Protein (g)"
        className={inputCls}
      />
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <header>
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand">
          Diet
        </div>
        <h1 className="text-[22px] font-bold text-text mt-1">Meal plan & notes</h1>
      </header>

      {/* Daily totals */}
      <Card className="grid grid-cols-2 divide-x divide-border text-center">
        <div className="px-2">
          <div className="text-2xl font-bold font-mono text-success">{totalKcal}</div>
          <div className="text-[11px] text-muted">kcal / day</div>
        </div>
        <div className="px-2">
          <div className="text-2xl font-bold font-mono text-info">{totalProtein}g</div>
          <div className="text-[11px] text-muted">protein</div>
        </div>
      </Card>

      {/* Meals */}
      <Card>
        <SectionTitle>Meals</SectionTitle>
        {meals.map((m, i) =>
          editingId === m.id ? (
            <div
              key={m.id}
              className={`py-3 ${i < meals.length - 1 ? 'border-b border-border' : ''}`}
            >
              {renderMealForm()}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={saveMeal}
                  className="px-3 py-1.5 rounded-md bg-brand text-black text-xs font-bold hover:bg-brand-strong transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelMealForm}
                  className="px-3 py-1.5 rounded-md bg-surface-2 border border-border text-xs text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              key={m.id}
              className={`py-3 ${i < meals.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-bold text-text">{m.name}</span>
                  {m.time && (
                    <span className="text-[11px] text-muted ml-2">{m.time}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold font-mono text-success">{m.kcal}</span>
                  <span className="text-[10px] text-muted">kcal</span>
                  <button
                    type="button"
                    onClick={() => startEdit(m)}
                    className="text-muted hover:text-text p-1"
                    aria-label="Edit meal"
                  >
                    <Pencil size={12} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteMeal(m.id)}
                    className="text-muted hover:text-danger p-1"
                    aria-label="Delete meal"
                  >
                    <Trash2 size={12} aria-hidden />
                  </button>
                </div>
              </div>
              <div className="text-xs text-muted mt-1">{m.items}</div>
              {m.protein > 0 && (
                <div className="mt-2">
                  <Badge text={`${m.protein}g protein`} color="var(--color-info)" />
                </div>
              )}
            </div>
          )
        )}
        {adding && (
          <div className="py-3 mt-2 border-t border-border">
            {renderMealForm()}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={saveMeal}
                className="px-3 py-1.5 rounded-md bg-brand text-black text-xs font-bold hover:bg-brand-strong transition-colors"
              >
                Add meal
              </button>
              <button
                type="button"
                onClick={cancelMealForm}
                className="px-3 py-1.5 rounded-md bg-surface-2 border border-border text-xs text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {!adding && (
          <button
            type="button"
            onClick={() => {
              setAdding(true)
              setEditingId(null)
              setForm(emptyForm())
            }}
            className="mt-3 w-full py-2.5 rounded-lg border border-dashed border-border bg-surface/50 hover:bg-surface text-sm font-semibold text-muted hover:text-text transition-colors"
          >
            <Plus size={14} className="inline -mt-0.5 mr-1" aria-hidden />
            Add meal
          </button>
        )}
        {!meals.length && !adding && (
          <div className="text-xs text-muted text-center py-4">
            No meals yet — start your meal plan above.
          </div>
        )}
      </Card>

      {/* Notes */}
      <Card>
        <SectionTitle>Key swaps & notes</SectionTitle>
        {notes.map((note, i) =>
          noteEditingIdx === i ? (
            <div key={i} className="flex gap-2 py-1">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                autoFocus
                className={inputCls}
              />
              <button
                type="button"
                onClick={saveNote}
                className="px-3 rounded-md bg-brand text-black text-xs font-bold hover:bg-brand-strong"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => {
                  setNoteEditingIdx(null)
                  setNoteText('')
                }}
                className="px-3 rounded-md bg-surface-2 border border-border text-xs text-muted hover:text-text"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              key={i}
              className="flex items-start gap-2 py-1.5 text-sm text-text"
            >
              <span className="text-success shrink-0">•</span>
              <span className="flex-1">{note}</span>
              <button
                type="button"
                onClick={() => {
                  setNoteEditingIdx(i)
                  setNoteText(note)
                }}
                className="text-muted hover:text-text p-1"
                aria-label="Edit note"
              >
                <Pencil size={11} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => void deleteNote(i)}
                className="text-muted hover:text-danger p-1"
                aria-label="Delete note"
              >
                <Trash2 size={11} aria-hidden />
              </button>
            </div>
          )
        )}
        {noteAdding && (
          <div className="flex gap-2 py-2">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveNote()}
              placeholder="New note…"
              autoFocus
              className={inputCls}
            />
            <button
              type="button"
              onClick={saveNote}
              className="px-3 rounded-md bg-brand text-black text-xs font-bold"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setNoteAdding(false)
                setNoteText('')
              }}
              className="px-3 rounded-md bg-surface-2 border border-border text-xs text-muted"
            >
              ✕
            </button>
          </div>
        )}
        {!noteAdding && (
          <button
            type="button"
            onClick={() => {
              setNoteAdding(true)
              setNoteText('')
            }}
            className="mt-2 text-xs font-semibold text-muted hover:text-text inline-flex items-center gap-1"
          >
            <Plus size={12} aria-hidden /> Add note
          </button>
        )}
      </Card>
    </div>
  )
}
