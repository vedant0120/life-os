// ─── Progress Ring ────────────────────────────────────────────────────────────
import { Check, X, ArrowRight, Flame, TrendingUp, Eye } from 'lucide-react'
import type { HabitLog, HabitStats, Reaction, Status } from '../types'

interface RingProps {
  pct: number
  color: string
  size?: number
}

export function Ring({ pct, color, size = 50 }: RingProps) {
  const r = 18,
    c = 2 * Math.PI * r
  const off = c - (Math.min(pct, 100) / 100) * c
  return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#1e1e2e" strokeWidth="4" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="26" textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>
        {Math.min(pct, 100)}%
      </text>
    </svg>
  )
}

// ─── Habit Log Row ────────────────────────────────────────────────────────────
import { getMeta } from '../data/constants'

interface LogRowProps {
  habit: string
  todayStatus: Status
  stats?: HabitStats
  logHabit?: (habit: string, status: Exclude<Status, null>) => void
  showStats?: boolean
  isAnchor?: boolean
  onReact?: (type: Reaction['type'], habitName: string | null, message: string) => void
  isPartner?: boolean
}

export function LogRow({
  habit,
  todayStatus,
  stats,
  logHabit,
  showStats,
  isAnchor,
  onReact,
  isPartner,
}: LogRowProps) {
  const meta = getMeta(habit)
  const LC = ['#22c55e', '#ef4444', '#f59e0b']
  const LK: Array<Exclude<Status, null>> = ['success', 'fail', 'skip']
  const statusIcon = (s: Status, size = 11) =>
    s === 'success' ? (
      <Check size={size} aria-hidden />
    ) : s === 'fail' ? (
      <X size={size} aria-hidden />
    ) : (
      <ArrowRight size={size} aria-hidden />
    )

  return (
    <div className={'row' + (isAnchor ? ' arow' : '')}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{meta.icon}</span>
      {isAnchor && (
        <span
          style={{
            background: meta.col + '33',
            color: meta.col,
            fontSize: 8,
            fontWeight: 800,
            padding: '1px 5px',
            borderRadius: 3,
            flexShrink: 0,
          }}
        >
          #{meta.pri}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: isAnchor ? '#e8e6e1' : '#c4c0d8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: isAnchor ? 600 : 400,
          }}
        >
          {habit}
        </div>
        {showStats && stats && (
          <div style={{ display: 'flex', gap: 8, marginTop: 1, alignItems: 'center' }}>
            <span
              style={{
                fontSize: 9,
                color: '#444',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Flame size={9} aria-hidden />
              {stats.current}d
            </span>
            <span
              style={{
                fontSize: 9,
                color: '#444',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <TrendingUp size={9} aria-hidden />
              {stats.rate}%
            </span>
          </div>
        )}
      </div>
      {todayStatus && (
        <span
          className="pill"
          style={{
            background:
              todayStatus === 'success'
                ? '#16301a'
                : todayStatus === 'fail'
                  ? '#2a1010'
                  : '#2a2008',
            color:
              todayStatus === 'success'
                ? '#22c55e'
                : todayStatus === 'fail'
                  ? '#ef4444'
                  : '#f59e0b',
            flexShrink: 0,
          }}
        >
          {statusIcon(todayStatus)}
        </span>
      )}
      {!isPartner && logHabit && (
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          {LK.map((s, i) => (
            <button
              key={s}
              className="lb"
              onClick={() => logHabit(habit, s)}
              style={{
                borderColor: todayStatus === s ? LC[i] : '#2a2a3a',
                background: todayStatus === s ? LC[i] + '22' : 'transparent',
                color: todayStatus === s ? LC[i] : '#444',
              }}
            >
              {statusIcon(s)}
            </button>
          ))}
        </div>
      )}
      {isPartner && onReact && todayStatus === 'success' && (
        <button
          className="btn"
          onClick={() => onReact('fire', habit, '')}
          style={{
            background: '#1a1a0a',
            border: '1px solid #3a3a1a',
            color: '#f59e0b',
            padding: '3px 8px',
            fontFamily: 'inherit',
            fontSize: 11,
            display: 'inline-flex',
            alignItems: 'center',
          }}
          aria-label="Send fire reaction"
        >
          <Flame size={12} aria-hidden />
        </button>
      )}
      {isPartner && onReact && !todayStatus && (
        <button
          className="btn"
          onClick={() => onReact('nudge', habit, '')}
          style={{
            background: '#1a0a0a',
            border: '1px solid #3a1a1a',
            color: '#ef4444',
            padding: '3px 8px',
            fontFamily: 'inherit',
            fontSize: 11,
            display: 'inline-flex',
            alignItems: 'center',
          }}
          aria-label="Nudge partner"
        >
          <Eye size={12} aria-hidden />
        </button>
      )}
    </div>
  )
}

// ─── Stats helper ─────────────────────────────────────────────────────────────
export function calcStats(records: HabitLog[]): HabitStats {
  const succ = records
    .filter((r) => r.s === 'success')
    .map((r) => r.d)
    .sort()
  let longest = 0,
    cur = 0
  for (let i = 0; i < succ.length; i++) {
    if (i === 0) {
      cur = 1
      longest = 1
      continue
    }
    const diff = (new Date(succ[i]).getTime() - new Date(succ[i - 1]).getTime()) / 86400000
    cur = diff === 1 ? cur + 1 : 1
    if (cur > longest) longest = cur
  }
  const last = succ[succ.length - 1]
  const ago = last
    ? (new Date(new Date().toISOString().split('T')[0]).getTime() - new Date(last).getTime()) /
      86400000
    : 999
  const current = ago <= 1 ? cur : 0
  const total = records.length
  const successes = records.filter((r) => r.s === 'success').length
  const countable = records.filter((r) => r.s !== 'skip').length
  const rate = countable > 0 ? Math.round((successes / countable) * 100) : 0
  return { rate, current, longest: longest || 0, total }
}

export function last14(): string[] {
  const d: string[] = []
  for (let i = 13; i >= 0; i--) {
    const x = new Date()
    x.setDate(x.getDate() - i)
    d.push(x.toISOString().split('T')[0])
  }
  return d
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}
