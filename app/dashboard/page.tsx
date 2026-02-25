import { prisma } from '@/lib/prisma'
import Link from 'next/link'

function RiskBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'text-rose bg-rose/10 border-rose/20' : score >= 40 ? 'text-amber bg-amber/10 border-amber/20' : 'text-jade bg-jade/10 border-jade/20'
  const label = score >= 70 ? 'High Risk' : score >= 40 ? 'Medium' : 'Healthy'
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>{label}</span>
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'at-risk' ? 'bg-rose' : status === 'completed' ? 'bg-jade' : status === 'paused' ? 'bg-white/30' : 'bg-sky'
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />
}

export default async function Dashboard() {
  const projects = await prisma.project.findMany({
    include: { tasks: true },
    orderBy: { riskScore: 'desc' },
  })

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0)
  const totalTasks = projects.reduce((s, p) => s + p.tasks.length, 0)
  const doneTasks = projects.reduce((s, p) => s + p.tasks.filter(t => t.status === 'done').length, 0)
  const atRisk = projects.filter(p => p.riskScore >= 70).length

  const stats = [
    { label: 'Active Projects', value: projects.length, sub: `${atRisk} at risk`, color: 'text-accent-light' },
    { label: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(0)}k`, sub: `$${(totalSpent / 1000).toFixed(0)}k spent`, color: 'text-sky' },
    { label: 'Tasks Complete', value: `${doneTasks}/${totalTasks}`, sub: `${Math.round(doneTasks / totalTasks * 100)}% done`, color: 'text-jade' },
    { label: 'Budget Health', value: `${Math.round(totalSpent / totalBudget * 100)}%`, sub: 'utilization', color: totalSpent / totalBudget > 0.8 ? 'text-rose' : 'text-amber' },
  ]

  return (
    <div className="p-8 animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Overview</h1>
        <p className="text-white/40 text-sm">Here's what's happening across your projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-5">
            <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* At Risk Alert */}
      {atRisk > 0 && (
        <div className="mb-6 bg-rose/10 border border-rose/20 rounded-xl px-5 py-4 flex items-start gap-3">
          <span className="text-rose text-lg mt-0.5">⚠</span>
          <div>
            <p className="text-rose font-medium text-sm font-display">
              {atRisk} project{atRisk > 1 ? 's' : ''} need{atRisk === 1 ? 's' : ''} attention
            </p>
            <p className="text-white/50 text-xs mt-0.5">
              {projects.filter(p => p.riskScore >= 70).map(p => p.name).join(', ')} — review risk details below
            </p>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display font-semibold text-white">Projects</h2>
          <Link href="/projects" className="text-xs text-accent-light hover:text-white transition-colors">View all →</Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Project', 'Status', 'Progress', 'Budget', 'Deadline', 'Risk'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.map((p) => {
              const done = p.tasks.filter(t => t.status === 'done').length
              const pct = p.tasks.length ? Math.round(done / p.tasks.length * 100) : 0
              const budgetPct = Math.round(p.spent / p.budget * 100)
              const deadline = new Date(p.deadline)
              const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000)
              return (
                <tr key={p.id} className="hover:bg-white/3 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/projects/${p.id}`} className="font-medium text-white/90 group-hover:text-white text-sm transition-colors">
                      {p.name}
                    </Link>
                    <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{p.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={p.status} />
                      <span className="text-xs text-white/50 capitalize">{p.status.replace('-', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-white/40">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-white/80">${p.spent.toLocaleString()}</p>
                      <p className="text-xs text-white/30">of ${p.budget.toLocaleString()} ({budgetPct}%)</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm ${daysLeft <= 7 ? 'text-rose' : daysLeft <= 14 ? 'text-amber' : 'text-white/60'}`}>
                      {daysLeft > 0 ? `${daysLeft}d left` : `${Math.abs(daysLeft)}d over`}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <RiskBadge score={p.riskScore} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
