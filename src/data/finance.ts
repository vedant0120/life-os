// Finance taxonomy — category shapes for expenses, income, and investment
// buckets. Default budgets are sensible starting values that the user can
// override per-category; overrides live in users/{uid}/settings/finance.

export interface ExpenseCat {
  id: string
  label: string
  icon: string
  color: string
  defaultBudget: number
}

export interface IncomeCat {
  id: string
  label: string
  icon: string
  color: string
}

export interface InvestBucket {
  id: string
  label: string
  icon: string
  color: string
  targetPct: number
}

export interface FinGoal {
  id: string
  label: string
  target: number
  bucket: string
}

export const EXPENSE_CATS: ExpenseCat[] = [
  { id: 'rent', label: 'Rent / Housing', icon: '⌂', color: '#f97316', defaultBudget: 2000 },
  { id: 'food', label: 'Food & Groceries', icon: '◉', color: '#22c55e', defaultBudget: 400 },
  { id: 'transport', label: 'Transport', icon: '▸', color: '#3b82f6', defaultBudget: 200 },
  { id: 'subscriptions', label: 'Subscriptions', icon: '◈', color: '#a855f7', defaultBudget: 100 },
  { id: 'health_exp', label: 'Health & Medical', icon: '♥', color: '#ef4444', defaultBudget: 150 },
  { id: 'personal', label: 'Personal / Fun', icon: '✦', color: '#ec4899', defaultBudget: 200 },
  { id: 'utilities', label: 'Utilities & Bills', icon: '⚡', color: '#facc15', defaultBudget: 150 },
  { id: 'other_exp', label: 'Other', icon: '…', color: '#64748b', defaultBudget: 300 },
]

export const INCOME_CATS: IncomeCat[] = [
  { id: 'salary', label: 'Salary', icon: '◆', color: '#22c55e' },
  { id: 'freelance', label: 'Freelance / Side', icon: '◇', color: '#3b82f6' },
  { id: 'other_income', label: 'Other Income', icon: '○', color: '#94a3b8' },
]

export const INVEST_BUCKETS: InvestBucket[] = [
  { id: 'index', label: 'Index Funds', icon: '📈', color: '#3b82f6', targetPct: 0.5 },
  { id: 'emergency', label: 'Emergency Fund', icon: '🛡', color: '#22c55e', targetPct: 0.3 },
  { id: 'startup', label: 'Startup Budget', icon: '🚀', color: '#a855f7', targetPct: 0.2 },
]

export const FIN_GOALS: FinGoal[] = [
  { id: 'ef', label: 'Emergency Fund (6 months)', target: 21000, bucket: 'emergency' },
  { id: 'sf', label: 'Startup Capital', target: 10000, bucket: 'startup' },
  { id: 'ip', label: 'Investment Portfolio', target: 100000, bucket: 'index' },
]

export function fmtMoney(n: number): string {
  const abs = Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return n < 0 ? `-$${abs}` : `$${abs}`
}

export function getCatInfo(tx: {
  type: 'income' | 'expense' | 'invest'
  category: string
}): { icon: string; color: string; label: string } {
  if (tx.type === 'income') {
    const c = INCOME_CATS.find((x) => x.id === tx.category)
    return c
      ? { icon: c.icon, color: c.color, label: c.label }
      : { icon: '○', color: '#22c55e', label: tx.category }
  }
  if (tx.type === 'invest') {
    const b = INVEST_BUCKETS.find((x) => x.id === tx.category)
    return b
      ? { icon: b.icon, color: b.color, label: b.label }
      : { icon: '◆', color: '#3b82f6', label: tx.category }
  }
  const e = EXPENSE_CATS.find((x) => x.id === tx.category)
  return e
    ? { icon: e.icon, color: e.color, label: e.label }
    : { icon: '…', color: '#64748b', label: tx.category }
}
