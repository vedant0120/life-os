import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Card, PageHeader, SectionTitle, Pill, ProgressBar } from './ui/primitives'
import { todayStr } from './shared'
import {
  EXPENSE_CATS,
  FIN_GOALS,
  INCOME_CATS,
  INVEST_BUCKETS,
  fmtMoney,
  getCatInfo,
} from '../data/finance'
import { useData } from '../stores/DataContext'
import type { FinanceTransaction, FinanceTxType } from '../types'

type Sub = 'overview' | 'txns' | 'budget' | 'invest'

function monthOf(iso: string): string {
  return iso.slice(0, 7)
}
function monthLabel(ym: string): string {
  const d = new Date(ym + '-15')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return d.toISOString().slice(0, 7)
}

const inputCls =
  'bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-brand w-full'

export default function Finance() {
  const { transactions, financeSettings, addTransaction, deleteTransaction, updateBudget } =
    useData()
  const [sub, setSub] = useState<Sub>('overview')
  const [month, setMonth] = useState<string>(todayStr().slice(0, 7))

  const monthTxns = useMemo(
    () => transactions.filter((t) => monthOf(t.date) === month),
    [transactions, month]
  )

  const income = monthTxns.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expenses = monthTxns
    .filter((t) => t.type === 'expense')
    .reduce((a, t) => a + t.amount, 0)
  const invested = monthTxns
    .filter((t) => t.type === 'invest')
    .reduce((a, t) => a + t.amount, 0)
  const saved = income - expenses - invested
  const saveRate = income > 0 ? (income - expenses) / income : 0

  // Total invested = sum of all invest transactions ever, grouped by bucket.
  const investByBucket = useMemo(() => {
    const m: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'invest')
      .forEach((t) => {
        m[t.category] = (m[t.category] || 0) + t.amount
      })
    return m
  }, [transactions])
  const totalInv = Object.values(investByBucket).reduce((a, v) => a + v, 0)

  const catSpend = useMemo(() => {
    const m: Record<string, number> = {}
    monthTxns
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        m[t.category] = (m[t.category] || 0) + t.amount
      })
    return m
  }, [monthTxns])

  const [adding, setAdding] = useState(false)
  const [txType, setTxType] = useState<FinanceTxType>('expense')
  const [date, setDate] = useState<string>(todayStr())
  const [amount, setAmount] = useState('')
  const [expCat, setExpCat] = useState<string>(EXPENSE_CATS[0].id)
  const [incCat, setIncCat] = useState<string>(INCOME_CATS[0].id)
  const [bucket, setBucket] = useState<string>(INVEST_BUCKETS[0].id)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setAmount('')
    setNote('')
    setAdding(false)
  }

  const handleSaveTx = async () => {
    const n = parseFloat(amount)
    if (!Number.isFinite(n) || n <= 0) return
    const category = txType === 'expense' ? expCat : txType === 'income' ? incCat : bucket
    setSaving(true)
    try {
      await addTransaction({ type: txType, date, amount: Math.abs(n), category, note })
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const overviewCards = [
    { l: 'Income', v: fmtMoney(income), c: 'var(--color-success)' },
    { l: 'Expenses', v: fmtMoney(expenses), c: 'var(--color-danger)' },
    { l: 'Invested', v: fmtMoney(invested), c: 'var(--color-info)' },
    {
      l: 'Net saved',
      v: fmtMoney(saved),
      c: saved >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Finance"
        subtitle={`${fmtMoney(totalInv)} invested across ${INVEST_BUCKETS.length} buckets`}
        right={
          <div className="inline-flex items-center gap-2 text-[14px] font-medium">
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(month, -1))}
              className="w-9 h-9 rounded-lg border border-border hover:border-border-strong text-muted hover:text-text flex items-center justify-center"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <span className="min-w-[110px] text-center text-text font-mono">
              {monthLabel(month)}
            </span>
            <button
              type="button"
              onClick={() => {
                const next = shiftMonth(month, 1)
                if (next <= todayStr().slice(0, 7)) setMonth(next)
              }}
              className="w-9 h-9 rounded-lg border border-border hover:border-border-strong text-muted hover:text-text flex items-center justify-center"
              aria-label="Next month"
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>
        }
      />

      <div className="flex gap-1 bg-surface-2 rounded-lg p-1 self-start">
        {(['overview', 'txns', 'budget', 'invest'] as const).map((s) => (
          <Pill key={s} active={sub === s} onClick={() => setSub(s)}>
            {s === 'txns'
              ? 'Transactions'
              : s === 'invest'
                ? 'Invest'
                : s[0].toUpperCase() + s.slice(1)}
          </Pill>
        ))}
      </div>

      {sub === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            {overviewCards.map((c) => (
              <Card key={c.l} accent={c.c}>
                <div className="text-[10px] font-bold tracking-wider uppercase text-muted">
                  {c.l}
                </div>
                <div
                  className="text-xl font-bold font-mono mt-2"
                  style={{ color: c.c }}
                >
                  {c.v}
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <div className="flex items-center justify-between mb-2">
              <SectionTitle>Save rate</SectionTitle>
              <span
                className="text-sm font-bold font-mono"
                style={{
                  color:
                    saveRate >= 0.2 ? 'var(--color-success)' : 'var(--color-warn)',
                }}
              >
                {(saveRate * 100).toFixed(1)}%
              </span>
            </div>
            <ProgressBar
              pct={Math.max(0, Math.min(1, saveRate))}
              color={saveRate >= 0.2 ? 'var(--color-success)' : 'var(--color-warn)'}
              h={8}
            />
          </Card>
          <Card>
            <SectionTitle>Portfolio — {fmtMoney(totalInv)}</SectionTitle>
            <div className="h-2 rounded-full overflow-hidden bg-white/[0.05] flex">
              {INVEST_BUCKETS.map((b) => {
                const val = investByBucket[b.id] || 0
                const pct = totalInv > 0 ? (val / totalInv) * 100 : 0
                return (
                  <div
                    key={b.id}
                    style={{ width: `${pct}%`, background: b.color }}
                    title={`${b.label}: ${fmtMoney(val)}`}
                  />
                )
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {INVEST_BUCKETS.map((b) => (
                <div key={b.id} className="text-center">
                  <div className="text-[10px] text-muted truncate">
                    {b.icon} {b.label}
                  </div>
                  <div
                    className="text-[13px] font-bold font-mono mt-1"
                    style={{ color: b.color }}
                  >
                    {fmtMoney(investByBucket[b.id] || 0)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {sub === 'txns' && (
        <>
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full py-3.5 rounded-lg border border-dashed border-brand/40 bg-brand/5 hover:bg-brand/10 text-sm font-bold text-brand transition-colors"
            >
              + Add transaction
            </button>
          ) : (
            <Card style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex gap-1 bg-surface-2 rounded-lg p-1 mb-3">
                {(['expense', 'income', 'invest'] as const).map((t) => {
                  const col =
                    t === 'expense'
                      ? 'var(--color-danger)'
                      : t === 'income'
                        ? 'var(--color-success)'
                        : 'var(--color-info)'
                  const active = txType === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTxType(t)}
                      className="flex-1 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
                      style={{
                        background: active ? col + '22' : 'transparent',
                        color: active ? col : 'var(--color-muted)',
                      }}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  className={inputCls}
                />
                {txType === 'expense' && (
                  <select
                    value={expCat}
                    onChange={(e) => setExpCat(e.target.value)}
                    className={inputCls}
                  >
                    {EXPENSE_CATS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                )}
                {txType === 'income' && (
                  <select
                    value={incCat}
                    onChange={(e) => setIncCat(e.target.value)}
                    className={inputCls}
                  >
                    {INCOME_CATS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
                {txType === 'invest' && (
                  <select
                    value={bucket}
                    onChange={(e) => setBucket(e.target.value)}
                    className={inputCls}
                  >
                    {INVEST_BUCKETS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.icon} {b.label}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  placeholder="Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleSaveTx}
                  disabled={!amount || saving}
                  className="flex-1 px-3 py-2 rounded-lg bg-brand text-black text-sm font-bold hover:bg-brand-strong disabled:opacity-40 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
              </div>
            </Card>
          )}

          {monthTxns.length === 0 && !adding && (
            <Card className="flex flex-col items-center text-center gap-2 py-10">
              <div className="text-sm font-bold text-text">
                No transactions in {monthLabel(month)}
              </div>
              <div className="text-xs text-muted">
                Add income, expenses, or investments above.
              </div>
            </Card>
          )}

          {monthTxns.map((tx: FinanceTransaction) => {
            const info = getCatInfo(tx)
            const sign = tx.type === 'income' ? '+' : '−'
            const valueColor =
              tx.type === 'income'
                ? 'var(--color-success)'
                : tx.type === 'invest'
                  ? 'var(--color-info)'
                  : 'var(--color-danger)'
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 bg-surface border border-border rounded-[14px] px-4 py-3"
              >
                <div
                  className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: info.color + '1f', color: info.color }}
                >
                  {info.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text truncate">
                    {info.label}
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    {tx.note || tx.date}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-sm font-bold font-mono"
                    style={{ color: valueColor }}
                  >
                    {sign}
                    {fmtMoney(tx.amount)}
                  </div>
                  <div className="text-[10px] text-muted font-mono">
                    {tx.date.slice(5)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteTransaction(tx.id)}
                  className="text-muted hover:text-danger p-1"
                  aria-label="Delete transaction"
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </div>
            )
          })}
        </>
      )}

      {sub === 'budget' && (
        <>
          {EXPENSE_CATS.map((cat) => {
            const spent = catSpend[cat.id] || 0
            const budget = financeSettings.budgets[cat.id] ?? cat.defaultBudget
            const pct = budget > 0 ? spent / budget : 0
            const over = spent > budget
            const col = over ? 'var(--color-danger)' : cat.color
            return (
              <Card key={cat.id} style={{ padding: '12px 14px' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold text-text">
                    {cat.icon} {cat.label}
                  </span>
                  <div className="text-[12px] font-mono tabular-nums">
                    <span style={{ color: over ? 'var(--color-danger)' : 'var(--color-text)' }}>
                      {fmtMoney(spent)}
                    </span>
                    <span className="text-muted"> / </span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        if (Number.isFinite(v) && v >= 0) void updateBudget(cat.id, v)
                      }}
                      className="w-20 bg-bg border border-border rounded px-1.5 py-0.5 text-[12px] font-mono text-muted text-right outline-none focus:border-brand"
                    />
                  </div>
                </div>
                <ProgressBar pct={pct} color={col} h={5} />
                {over && (
                  <div className="text-[10px] text-danger mt-1">
                    Over by {fmtMoney(spent - budget)}
                  </div>
                )}
              </Card>
            )
          })}
        </>
      )}

      {sub === 'invest' && (
        <>
          <Card>
            <SectionTitle>Total invested</SectionTitle>
            <div className="text-3xl font-bold font-mono text-text">
              {fmtMoney(totalInv)}
            </div>
          </Card>
          {INVEST_BUCKETS.map((b) => {
            const val = investByBucket[b.id] || 0
            const goal = FIN_GOALS.find((g) => g.bucket === b.id)
            const goalPct = goal ? val / goal.target : 0
            return (
              <Card key={b.id} accent={b.color}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[14px] font-bold text-text">
                      {b.icon} {b.label}
                    </div>
                    {goal && (
                      <div className="text-[11px] text-muted mt-1">{goal.label}</div>
                    )}
                  </div>
                  <div
                    className="text-lg font-bold font-mono"
                    style={{ color: b.color }}
                  >
                    {fmtMoney(val)}
                  </div>
                </div>
                {goal && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted">Goal</span>
                      <span
                        className="font-mono"
                        style={{
                          color:
                            goalPct >= 1 ? 'var(--color-success)' : 'var(--color-muted)',
                        }}
                      >
                        {Math.min(Math.round(goalPct * 100), 100)}%
                      </span>
                    </div>
                    <ProgressBar
                      pct={goalPct}
                      color={goalPct >= 1 ? 'var(--color-success)' : b.color}
                      h={6}
                    />
                    <div className="text-[10px] text-muted mt-1 font-mono">
                      {fmtMoney(val)} / {fmtMoney(goal.target)}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </>
      )}
    </div>
  )
}
