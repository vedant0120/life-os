import { useState } from 'react'
import { Ring } from './shared'
import { BUDGET, MONTHLY_INCOME, SAVINGS_DEPLOYMENT, YEARLY_FINANCE_TARGETS } from '../data/constants'

export default function Finance() {
  const [expenses] = useState(BUDGET.filter(b => b.type === 'expense').reduce((a, b) => a + b.amount, 0))
  const investable = MONTHLY_INCOME - expenses

  const [monthlyLog, setMonthlyLog] = useState([
    { month: 'Apr 2025', income: 7500, spent: 3600, invested: 2000, saved: 1900, note: 'Baseline month' },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [newEntry, setNewEntry] = useState({ month: '', income: '', spent: '', invested: '', note: '' })

  function addEntry() {
    if (!newEntry.month) return
    const saved = (parseFloat(newEntry.income) || 0) - (parseFloat(newEntry.spent) || 0) - (parseFloat(newEntry.invested) || 0)
    setMonthlyLog(l => [...l, { ...newEntry, income: parseFloat(newEntry.income), spent: parseFloat(newEntry.spent), invested: parseFloat(newEntry.invested), saved }])
    setNewEntry({ month: '', income: '', spent: '', invested: '', note: '' })
    setShowAdd(false)
  }

  const totalInvested = monthlyLog.reduce((a, m) => a + (m.invested || 0), 0)
  const projectedNetWorth = 100000 + totalInvested
  const savingsRate = Math.round((investable / MONTHLY_INCOME) * 100)

  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Finance Tracker</div>
        <div className="pt">$7,500/month · $100k+ saved</div>
      </div>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9, marginBottom: 14 }}>
        {[
          { l: 'Monthly Income', v: '$7,500', c: '#22c55e' },
          { l: 'Monthly Expenses', v: '$' + expenses.toLocaleString(), c: '#ef4444' },
          { l: 'Investable / mo', v: '$' + investable.toLocaleString(), c: '#f59e0b' },
          { l: 'Savings Rate', v: savingsRate + '%', c: '#818cf8' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <div className="st">{s.l}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: s.c, marginTop: 5 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Progress rings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 14 }}>
        {[
          { label: 'Projected NW', pct: Math.min(Math.round(projectedNetWorth / 148000 * 100), 100), color: '#22c55e', sub: '$' + Math.round(projectedNetWorth / 1000) + 'k / $148k' },
          { label: 'Invested Total', pct: Math.min(Math.round(totalInvested / 24000 * 100), 100), color: '#f59e0b', sub: '$' + totalInvested.toLocaleString() + ' / $24k yr' },
          { label: 'Savings Rate', pct: savingsRate, color: '#818cf8', sub: savingsRate + '% of income' },
        ].map((c, i) => (
          <div key={i} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ring pct={c.pct} color={c.color} size={46} />
            <div><div style={{ fontSize: 11, fontWeight: 600, color: '#e8e6e1' }}>{c.label}</div><div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{c.sub}</div></div>
          </div>
        ))}
      </div>

      {/* Monthly budget breakdown */}
      <div className="card" style={{ padding: 13, marginBottom: 12 }}>
        <div className="st" style={{ marginBottom: 11 }}>Monthly Budget Breakdown</div>
        {BUDGET.map((b, i) => {
          const pct = Math.round(b.amount / MONTHLY_INCOME * 100)
          return (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: '#c4c0d8' }}>
                  {b.type === 'invest' ? '📈 ' : b.type === 'flex' ? '💳 ' : '🏠 '}{b.cat}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: b.color }}>${b.amount.toLocaleString()}</span>
                  <span style={{ fontSize: 9, color: '#444' }}>{pct}%</span>
                </div>
              </div>
              <div className="bar"><div className="fill" style={{ width: pct + '%', background: b.color }}></div></div>
            </div>
          )
        })}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '1px solid #1a1a2a', marginTop: 4 }}>
          <div style={{ fontSize: 11, color: '#e8e6e1', fontWeight: 600 }}>Total Expenses</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>${expenses.toLocaleString()}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0' }}>
          <div style={{ fontSize: 11, color: '#e8e6e1', fontWeight: 600 }}>Monthly investable surplus</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>${investable.toLocaleString()}</div>
        </div>
      </div>

      {/* $100k deployment */}
      <div className="card" style={{ padding: 13, marginBottom: 12 }}>
        <div className="st" style={{ marginBottom: 11 }}>$100k Savings — Deployment Plan</div>
        {SAVINGS_DEPLOYMENT.map((r, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <div style={{ fontSize: 11, color: '#e8e6e1', fontWeight: 600 }}>{r.cat}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.amount}</div>
            </div>
            <div style={{ fontSize: 9, color: '#555', marginBottom: 5 }}>{r.note}</div>
            <div className="bar"><div className="fill" style={{ width: r.pct + '%', background: r.color }}></div></div>
          </div>
        ))}
      </div>

      {/* Monthly tracking log */}
      <div className="card" style={{ padding: 13, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
          <div className="st">Monthly Tracking Log</div>
          <button className="btn" onClick={() => setShowAdd(true)} style={{ background: '#22c55e', color: '#fff', padding: '4px 11px', fontFamily: 'inherit' }}>+ Log Month</button>
        </div>
        {monthlyLog.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, padding: '10px 12px', borderRadius: 8, background: '#0f0f18', border: '1px solid #1a1a2a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e8e6e1' }}>{m.month}</div>
              {m.note && <div style={{ fontSize: 9, color: '#555' }}>{m.note}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[{ l: 'Income', v: '$' + (m.income || 0).toLocaleString(), c: '#22c55e' }, { l: 'Spent', v: '$' + (m.spent || 0).toLocaleString(), c: '#ef4444' }, { l: 'Invested', v: '$' + (m.invested || 0).toLocaleString(), c: '#f59e0b' }, { l: 'Saved', v: '$' + (m.saved || 0).toLocaleString(), c: '#818cf8' }].map((s, j) => (
                <div key={j}><div style={{ fontSize: 8, color: '#444', letterSpacing: 1 }}>{s.l}</div><div style={{ fontSize: 12, fontWeight: 700, color: s.c, marginTop: 2 }}>{s.v}</div></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 12-month targets */}
      <div className="card" style={{ padding: 13 }}>
        <div className="st" style={{ marginBottom: 11 }}>12-Month Targets</div>
        {YEARLY_FINANCE_TARGETS.map((t, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #111' }}>
            <div style={{ fontSize: 11, color: '#c4c0d8' }}>{t.l}</div>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ fontSize: 9, color: '#444' }}>{t.from}</span>
              <span style={{ fontSize: 9, color: '#555' }}>→</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.c }}>{t.to}</span>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Log Monthly Finances</div>
            {[{ k: 'month', p: 'Month (e.g. May 2025)' }, { k: 'income', p: 'Income ($)' }, { k: 'spent', p: 'Total spent ($)' }, { k: 'invested', p: 'Invested ($)' }, { k: 'note', p: 'Note (optional)' }].map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <div className="st" style={{ marginBottom: 4 }}>{f.p}</div>
                <input value={newEntry[f.k]} onChange={e => setNewEntry(x => ({ ...x, [f.k]: e.target.value }))} placeholder={f.p} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button className="btn" onClick={() => setShowAdd(false)} style={{ flex: 1, background: '#1a1a2a', color: '#888', padding: 9, fontFamily: 'inherit' }}>Cancel</button>
              <button className="btn" onClick={addEntry} style={{ flex: 1, background: '#22c55e', color: '#fff', padding: 9, fontFamily: 'inherit' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
