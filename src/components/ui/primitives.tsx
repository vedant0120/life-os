import type { ReactNode, CSSProperties } from 'react'

// ─── Card ────────────────────────────────────────────────────────────────────
// Unified surface container. 14px radius, soft border, generous padding so
// content has breathing room on desktop. Callers can tint the left edge or
// opt out of padding with `className="!p-0"`.
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
      className={`bg-surface border border-border rounded-2xl p-6 ${className}`}
      style={merged}
    >
      {children}
    </div>
  )
}

// ─── PageHeader ──────────────────────────────────────────────────────────────
// Every tab uses this: big title + optional subtitle + optional right slot.
// Sizes tuned to match the MeshClaw-style reference (32px title on desktop).
interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
}

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 mb-2">
      <div className="min-w-0">
        <h1 className="text-[28px] md:text-[32px] font-semibold text-text leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[15px] text-muted mt-1.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  )
}

// ─── Section title ───────────────────────────────────────────────────────────
// A mid-level heading sitting INSIDE cards and page sections. Size matches
// the reference: 16-17px semibold with a little muted subtitle option.
export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-4">
      <h2 className="text-[16px] font-semibold text-text">{children}</h2>
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
    </div>
  )
}

// ─── Eyebrow (small uppercase label, e.g. stat-card label) ──────────────────
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
      {children}
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
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
      className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
        active
          ? 'bg-brand/15 text-brand'
          : 'text-muted hover:text-text hover:bg-surface-2'
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

// ─── Stat card ───────────────────────────────────────────────────────────────
// One of the most-used components: uppercase label + big value. Matches the
// MeshClaw reference — roomy padding, value sits ~40px and regular-weight.
interface StatCardProps {
  label: string
  value: ReactNode
  color?: string
  hint?: ReactNode
}

export function StatCard({ label, value, color, hint }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 min-h-[112px] flex flex-col gap-2">
      <Eyebrow>{label}</Eyebrow>
      <div
        className="text-4xl font-semibold font-mono tracking-tight mt-auto leading-none"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      {hint && <div className="text-[13px] text-muted mt-auto">{hint}</div>}
    </div>
  )
}

// ─── Sparkline ───────────────────────────────────────────────────────────────
// Tiny SVG line chart for inline trends (in stat cards, list rows, etc.).
// `values` is normalized 0–1 not required — we min/max-fit internally.
interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  color?: string
}

export function Sparkline({
  values,
  width = 80,
  height = 24,
  color = '#22c55e',
}: SparklineProps) {
  if (!values.length) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const stepX = width / Math.max(1, values.length - 1)
  const points = values
    .map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / span) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

// ─── Trend chip — "▲ +6%" / "▼ -3%" colored ─────────────────────────────────
interface TrendChipProps {
  delta: number // signed percentage in 0–1 scale (0.06 = +6%); display as %.
  format?: 'percent' | 'absolute'
  suffix?: string
}

export function TrendChip({ delta, format = 'percent', suffix }: TrendChipProps) {
  const positive = delta > 0
  const negative = delta < 0
  const arrow = positive ? '▲' : negative ? '▼' : '·'
  const color = positive
    ? 'var(--color-success)'
    : negative
      ? 'var(--color-danger)'
      : 'var(--color-muted)'
  const text =
    format === 'percent'
      ? `${positive ? '+' : ''}${Math.round(delta * 100)}%`
      : `${positive ? '+' : ''}${delta}${suffix ?? ''}`
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums"
      style={{ color }}
    >
      <span>{arrow}</span>
      <span>{text}</span>
    </span>
  )
}

// ─── Empty state — icon + headline + body + CTA ─────────────────────────────
interface EmptyStateProps {
  icon: ReactNode
  title: ReactNode
  body?: ReactNode
  cta?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, body, cta, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center text-center gap-3 py-12 px-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-brand/15 flex items-center justify-center text-brand">
        {icon}
      </div>
      <div>
        <div className="text-[16px] font-semibold text-text">{title}</div>
        {body && (
          <div className="text-[14px] text-muted mt-1 max-w-sm leading-relaxed">{body}</div>
        )}
      </div>
      {cta && <div className="mt-1">{cta}</div>}
    </div>
  )
}

// ─── Mini heatmap — one cell per habit-day ──────────────────────────────────
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
    <div className="flex flex-wrap gap-[3px]">
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
            className={`w-3 h-3 rounded-[3px] ${bg}`}
          />
        )
      })}
    </div>
  )
}
