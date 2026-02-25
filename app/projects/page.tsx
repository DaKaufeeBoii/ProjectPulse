import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const raw = cookies().get(SESSION_COOKIE)?.value
  const session = raw ? decodeSession(raw) : null
  const canCreate = session?.role === 'admin' || session?.role === 'manager'

  const projects = await (prisma.project.findMany as any)({
    include: { tasks: true, team: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  }) as Array<any>

  return (
    <div className="p-8 animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Projects</h1>
          <p className="text-white/40 text-sm">{projects.length} active projects</p>
        </div>
        {canCreate && (
          <Link
            href="/projects/new"
            className="px-4 py-2 bg-accent hover:bg-accent/80 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Project
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((p) => {
          const done = p.tasks.filter((t: any) => t.status === 'done').length
          const inProgress = p.tasks.filter((t: any) => t.status === 'in-progress').length
          const blocked = p.tasks.filter((t: any) => t.status === 'blocked').length
          const pct = p.tasks.length ? Math.round(done / p.tasks.length * 100) : 0
          const daysLeft = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / 86400000)
          const budgetPct = Math.round(p.spent / p.budget * 100)

          const riskColor = p.riskScore >= 70 ? 'border-rose/30' : p.riskScore >= 40 ? 'border-amber/30' : 'border-white/5'
          const riskBg = p.riskScore >= 70 ? 'bg-rose/5' : ''

          return (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <div className={`glass rounded-xl p-6 border hover:border-accent/30 transition-all cursor-pointer ${riskColor} ${riskBg}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {p.team && (
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border bg-accent/10 text-accent-light border-accent/20">
                          {p.team.name}
                        </span>
                      )}
                      <h3 className="font-display font-semibold text-white text-lg">{p.name}</h3>
                      {p.riskScore >= 70 && <span className="text-xs bg-rose/20 text-rose px-2 py-0.5 rounded-full border border-rose/20">⚠ High Risk</span>}
                    </div>
                    <p className="text-sm text-white/40">{p.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${daysLeft <= 7 ? 'text-rose' : daysLeft <= 14 ? 'text-amber' : 'text-white/60'}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">{new Date(p.deadline).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>Progress</span><span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-xs text-white/40">
                    <span className="text-jade">✓ {done} done</span>
                    <span className="text-sky">◈ {inProgress} in progress</span>
                    {blocked > 0 && <span className="text-rose">✕ {blocked} blocked</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-white/40">${p.spent.toLocaleString()} / ${p.budget.toLocaleString()} </span>
                    <span className={`text-xs ml-1 ${budgetPct > 80 ? 'text-rose' : 'text-white/30'}`}>({budgetPct}%)</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
