import type { ReactNode, CSSProperties } from 'react'

// ─── Card ────────────────────────────────────────────────────────────────────
// Unified surface container. Matches the P4 visual language: soft border, 14px
// radius, subtle inner padding. Extra props let callers tint the left edge or
// override padding without leaking Tailwind class plumbing everywhere.
interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  accent?: string
}

export function Card({ children, className = '', style, accent }: CardProps) {
  const merged: CSSProperties = accent
    ? { borderLeft: `3px solid ${accent}`, ...style }
    : style || {}
  return (
    <div
      className={`bg-surface border border-border rounded-[14px] p-4 ${className}`}
      style={merged}
    >
      {children}
    </div>
  )
}

// ─── Section eyebrow ─────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-[12px] font-bold tracking-[0.15em] uppercase text-muted mb-3">
      {children}
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: color + '22', color }}
    >
      {text}
    </span>
  )
}

// ─── Pill (tab switcher button) ──────────────────────────────────────────────
interface PillProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}
export function Pill({ active, onClick, children }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
        active ? 'bg-brand/15 text-brand' : 'text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Progress ring (SVG) ─────────────────────────────────────────────────────
interface RingProps {
  pct: number
  size?: number
  stroke?: number
  color?: string
  children?: ReactNode
}
export function Ring({ pct, size = 56, stroke = 5, color = '#22c55e', children }: RingProps) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(pct, 1))
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - clamped)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {children !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  )
}

// ─── Progress bar ────────────────────────────────────────────────────────────
interface ProgressBarProps {
  pct: number
  color?: string
  h?: number
}
export function ProgressBar({ pct, color = '#22c55e', h = 6 }: ProgressBarProps) {
  return (
    <div
      className="rounded-full overflow-hidden bg-white/[0.06]"
      style={{ height: h }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ background: color, width: `${Math.min(pct * 100, 100)}%` }}
      />
    </div>
  )
}

// ─── Mini heatmap — one row per habit-day ───────────────────────────────────
interface MiniHeatmapProps {
  logs: { d: string; s: 'success' | 'fail' | 'skip' | null }[]
  days?: number
}

export function MiniHeatmap({ logs, days = 90 }: MiniHeatmapProps) {
  const dates: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  const map: Record<string, 'success' | 'fail' | 'skip' | null> = {}
  logs.forEach((l) => {
    map[l.d] = l.s
  })
  return (
    <div className="flex flex-wrap gap-[2px]">
      {dates.map((d) => {
        const s = map[d]
        const bg =
          s === 'success'
            ? 'bg-success'
            : s === 'fail'
              ? 'bg-danger'
              : s === 'skip'
                ? 'bg-warn'
                : 'bg-white/[0.04]'
        return (
          <div
            key={d}
            title={`${d}: ${s || '—'}`}
            className={`w-2.5 h-2.5 rounded-[2px] ${bg}`}
          />
        )
      })}
    </div>
  )
}
