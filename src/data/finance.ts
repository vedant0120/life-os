// Finance taxonomy — category shapes for expenses, income, and investment
// buckets. Default budgets are sensible starting values that the user can
// override per-category; overrides live in users/{uid}/settings/finance.

export interface ExpenseCat {
  id: string
  label: string
  iconName: string
  color: string
  defaultBudget: number
}

export interface IncomeCat {
  id: string
  label: string
  iconName: string
  color: string
}

export interface InvestBucket {
  id: string
  label: string
  iconName: string
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
  { id: 'rent', label: 'Rent / Housing', iconName: 'home', color: '#f97316', defaultBudget: 2000 },
  { id: 'food', label: 'Food & Groceries', iconName: 'utensils', color: '#22c55e', defaultBudget: 400 },
  { id: 'transport', label: 'Transport', iconName: 'route', color: '#3b82f6', defaultBudget: 200 },
  { id: 'subscriptions', label: 'Subscriptions', iconName: 'refresh-cw', color: '#a855f7', defaultBudget: 100 },
  { id: 'health_exp', label: 'Health & Medical', iconName: 'heart', color: '#ef4444', defaultBudget: 150 },
  { id: 'personal', label: 'Personal / Fun', iconName: 'sparkles', color: '#ec4899', defaultBudget: 200 },
  { id: 'utilities', label: 'Utilities & Bills', iconName: 'zap', color: '#facc15', defaultBudget: 150 },
  { id: 'other_exp', label: 'Other', iconName: 'more-horizontal', color: '#64748b', defaultBudget: 300 },
]

export const INCOME_CATS: IncomeCat[] = [
  { id: 'salary', label: 'Salary', iconName: 'dollar-sign', color: '#22c55e' },
  { id: 'freelance', label: 'Freelance / Side', iconName: 'briefcase', color: '#3b82f6' },
  { id: 'other_income', label: 'Other Income', iconName: 'circle-dashed', color: '#94a3b8' },
]

export const INVEST_BUCKETS: InvestBucket[] = [
  { id: 'index', label: 'Index Funds', iconName: 'trending-up', color: '#3b82f6', targetPct: 0.5 },
  { id: 'emergency', label: 'Emergency Fund', iconName: 'shield', color: '#22c55e', targetPct: 0.3 },
  { id: 'startup', label: 'Startup Budget', iconName: 'rocket', color: '#a855f7', targetPct: 0.2 },
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
}): { iconName: string; color: string; label: string } {
  if (tx.type === 'income') {
    const c = INCOME_CATS.find((x) => x.id === tx.category)
    return c
      ? { iconName: c.iconName, color: c.color, label: c.label }
      : { iconName: 'circle-dashed', color: '#22c55e', label: tx.category }
  }
  if (tx.type === 'invest') {
    const b = INVEST_BUCKETS.find((x) => x.id === tx.category)
    return b
      ? { iconName: b.iconName, color: b.color, label: b.label }
      : { iconName: 'dollar-sign', color: '#3b82f6', label: tx.category }
  }
  const e = EXPENSE_CATS.find((x) => x.id === tx.category)
  return e
    ? { iconName: e.iconName, color: e.color, label: e.label }
    : { iconName: 'more-horizontal', color: '#64748b', label: tx.category }
}
