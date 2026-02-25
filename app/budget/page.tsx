import { prisma } from '@/lib/prisma'

const CATEGORY_COLORS: Record<string, string> = {
  Engineering: 'bg-accent/20 text-accent-light',
  Design: 'bg-sky/20 text-sky',
  Infrastructure: 'bg-jade/20 text-jade',
  Research: 'bg-amber/20 text-amber',
  Content: 'bg-rose/20 text-rose',
}

export default async function BudgetPage() {
  const projects = await prisma.project.findMany()
  const entries = await prisma.budgetEntry.findMany({ orderBy: { date: 'desc' } })

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0)
  const remaining = totalBudget - totalSpent

  // By category
  const byCategory: Record<string, number> = {}
  entries.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount })

  // By project
  const byProject = projects.map(p => ({
    ...p,
    pct: Math.round(p.spent / p.budget * 100),
    entries: entries.filter(e => e.projectId === p.id),
  }))

  return (
    <div className="p-8 animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Budget Tracker</h1>
        <p className="text-white/40 text-sm">Financial overview across all projects</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Total Budget</p>
          <p className="font-display text-3xl font-bold text-white">${(totalBudget / 1000).toFixed(0)}k</p>
          <p className="text-xs text-white/30 mt-1">across {projects.length} projects</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Total Spent</p>
          <p className="font-display text-3xl font-bold text-amber">${(totalSpent / 1000).toFixed(0)}k</p>
          <p className="text-xs text-white/30 mt-1">{Math.round(totalSpent / totalBudget * 100)}% utilized</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Remaining</p>
          <p className={`font-display text-3xl font-bold ${remaining < 10000 ? 'text-rose' : 'text-jade'}`}>
            ${(remaining / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-white/30 mt-1">{Math.round(remaining / totalBudget * 100)}% left</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* By project */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-display font-semibold text-white">By Project</h2>
          </div>
          <div className="p-6 space-y-4">
            {byProject.map(p => (
              <div key={p.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/70">{p.name}</span>
                  <span className={p.pct > 80 ? 'text-rose' : 'text-white/50'}>
                    ${p.spent.toLocaleString()} / ${p.budget.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${p.pct > 85 ? 'bg-rose' : p.pct > 65 ? 'bg-amber' : 'bg-jade'}`}
                    style={{ width: `${Math.min(p.pct, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${p.pct > 80 ? 'text-rose' : 'text-white/30'}`}>{p.pct}% used</p>
              </div>
            ))}
          </div>
        </div>

        {/* By category */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-display font-semibold text-white">By Category</h2>
          </div>
          <div className="p-6 space-y-3">
            {Object.entries(byCategory).sort(([,a],[,b]) => b - a).map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[cat] || 'bg-white/10 text-white/60'}`}>
                  {cat}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${Math.round(amount / totalSpent * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-white/60 w-20 text-right">${amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="font-display font-semibold text-white">Recent Transactions</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Date', 'Project', 'Description', 'Category', 'Amount'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {entries.map(entry => {
              const project = projects.find(p => p.id === entry.projectId)
              return (
                <tr key={entry.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-3 text-xs text-white/40">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-sm text-white/70">{project?.name}</td>
                  <td className="px-6 py-3 text-sm text-white/80">{entry.description}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[entry.category] || 'bg-white/10 text-white/50'}`}>{entry.category}</span>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-rose">-${entry.amount.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
