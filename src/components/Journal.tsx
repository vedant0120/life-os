import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, PageHeader, SectionTitle, Badge, Pill } from './ui/primitives'
import { todayStr } from './shared'
import { useData } from '../stores/DataContext'
import type { JournalPost, JournalPostType } from '../types'

type Filter = 'daily' | 'weekly' | 'monthly' | 'all'

const TYPE_COLORS: Record<JournalPostType, string> = {
  daily: 'var(--color-success)',
  weekly: 'var(--color-info)',
  monthly: 'var(--color-plum)',
}
const TYPE_LABELS: Record<JournalPostType, string> = {
  daily: 'DAILY',
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
}

const PROMPTS: Record<Exclude<Filter, 'all'>, string[]> = {
  daily: [
    'What did I accomplish today?',
    'What challenged me?',
    'What am I grateful for?',
    "Tomorrow's #1 priority",
  ],
  weekly: [
    'Wins this week',
    'Habits that slipped',
    'Progress on big projects',
    'Key learnings',
    "Next week's focus",
  ],
  monthly: [
    'Month highlights',
    'Goals hit / missed',
    'Health & fitness update',
    'Career progress',
    'What to change next month',
  ],
}

function typeForNew(filter: Filter): JournalPostType {
  return filter === 'all' ? 'daily' : filter
}

function titlePlaceholder(filter: Filter): string {
  if (filter === 'weekly') return 'Week of…'
  if (filter === 'monthly') return 'Month review…'
  return 'Title (optional)'
}

export default function Journal() {
  const { journal, addJournalPost, updateJournalPost, deleteJournalPost } = useData()
  const [filter, setFilter] = useState<Filter>('daily')
  const [composing, setComposing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'all') return journal
    return journal.filter((p) => p.type === filter)
  }, [journal, filter])

  const resetDraft = () => {
    setDraftTitle('')
    setDraftContent('')
    setEditingId(null)
    setComposing(false)
  }

  const insertPrompt = (prompt: string) => {
    setDraftContent((prev) => prev + (prev ? '\n\n' : '') + prompt + '\n')
  }

  const startCompose = () => {
    setComposing(true)
    setEditingId(null)
    setDraftTitle('')
    setDraftContent('')
  }

  const startEdit = (post: JournalPost) => {
    setEditingId(post.id)
    setComposing(false)
    setDraftTitle(post.title)
    setDraftContent(post.content)
  }

  const handleSaveNew = async () => {
    if (!draftContent.trim()) return
    setSaving(true)
    try {
      const postType = typeForNew(filter)
      await addJournalPost({
        type: postType,
        date: todayStr(),
        title:
          draftTitle.trim() ||
          (postType === 'daily'
            ? 'Daily note'
            : postType === 'weekly'
              ? 'Weekly review'
              : 'Monthly review'),
        content: draftContent.trim(),
      })
      resetDraft()
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingId || !draftContent.trim()) return
    setSaving(true)
    try {
      await updateJournalPost(editingId, {
        title: draftTitle.trim() || 'Untitled',
        content: draftContent.trim(),
      })
      resetDraft()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    await deleteJournalPost(id)
    if (editingId === id) resetDraft()
  }

  const promptList = filter === 'all' ? PROMPTS.daily : PROMPTS[filter]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Journal"
        subtitle={`Daily, weekly and monthly notes — ${journal.length} ${journal.length === 1 ? 'entry' : 'entries'} in total`}
      />

      {/* Filter pills */}
      <div className="flex gap-1 bg-surface-2 rounded-lg p-1 self-start">
        {(['daily', 'weekly', 'monthly', 'all'] as const).map((f) => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
          </Pill>
        ))}
      </div>

      {/* Composer */}
      {composing ? (
        <Card style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder={titlePlaceholder(filter)}
            autoFocus
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-brand mb-2"
          />
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            rows={7}
            placeholder="Write your thoughts…"
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-brand resize-y leading-relaxed"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {promptList.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => insertPrompt(p)}
                className="px-2.5 py-1 rounded-md border border-border text-[10px] font-semibold text-muted hover:text-text hover:border-border-strong transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleSaveNew}
              disabled={!draftContent.trim() || saving}
              className="flex-1 px-3 py-2 rounded-lg bg-brand text-black text-sm font-bold hover:bg-brand-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save entry'}
            </button>
            <button
              type="button"
              onClick={resetDraft}
              className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </Card>
      ) : (
        <button
          type="button"
          onClick={startCompose}
          className="w-full py-3.5 rounded-lg border border-dashed border-border bg-surface/50 hover:bg-surface hover:border-border-strong text-sm font-semibold text-muted hover:text-text transition-colors"
        >
          + New{' '}
          {filter === 'weekly'
            ? 'weekly review'
            : filter === 'monthly'
              ? 'monthly review'
              : 'journal entry'}
        </button>
      )}

      {/* Empty */}
      {!filtered.length && !composing && (
        <Card className="flex flex-col items-center text-center gap-2 py-10">
          <div className="text-sm font-bold text-text">
            {filter === 'all' ? 'No entries yet' : `No ${filter} entries yet`}
          </div>
          <div className="text-xs text-muted max-w-xs">
            Journaling builds the feedback loop that makes habits stick. Start with one line.
          </div>
        </Card>
      )}

      {/* Entry list */}
      {filtered.map((post) => {
        const color = TYPE_COLORS[post.type]
        const isEditing = editingId === post.id
        return (
          <Card key={post.id} accent={color}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Badge text={TYPE_LABELS[post.type]} color={color} />
                {isEditing ? (
                  <input
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="flex-1 bg-bg border border-border rounded px-2 py-1 text-sm text-text font-semibold outline-none focus:border-brand"
                  />
                ) : (
                  <span className="text-sm font-bold text-text truncate">{post.title}</span>
                )}
              </div>
              <span className="text-[11px] text-muted font-mono shrink-0">{post.date}</span>
            </div>
            {isEditing ? (
              <>
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={6}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-brand resize-y leading-relaxed"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!draftContent.trim() || saving}
                    className="px-3 py-1.5 rounded-md bg-brand text-black text-xs font-bold hover:bg-brand-strong disabled:opacity-40 transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={resetDraft}
                    className="px-3 py-1.5 rounded-md bg-surface-2 border border-border text-xs text-muted hover:text-text transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => startEdit(post)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border text-[11px] text-muted hover:text-text hover:border-border-strong transition-colors"
                  >
                    <Pencil size={11} aria-hidden /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(post.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border text-[11px] text-muted hover:text-danger hover:border-danger/40 transition-colors"
                  >
                    <Trash2 size={11} aria-hidden /> Delete
                  </button>
                </div>
              </>
            )}
          </Card>
        )
      })}

      {/* Floating compose hint */}
      {filtered.length > 3 && !composing && !editingId && (
        <div className="text-center text-[11px] text-muted pt-2">
          <button
            type="button"
            onClick={startCompose}
            className="inline-flex items-center gap-1 hover:text-text"
          >
            <Plus size={12} aria-hidden /> New entry
          </button>
        </div>
      )}

      {/* Section hint explaining types */}
      <Card className="mt-2">
        <SectionTitle>How this works</SectionTitle>
        <div className="text-xs text-muted leading-relaxed">
          Daily notes are the quick end-of-day check-in. Weekly reviews zoom out on habits and
          projects. Monthly reviews close the loop on bigger goals. All entries sync across
          devices through your account.
        </div>
      </Card>
    </div>
  )
}
