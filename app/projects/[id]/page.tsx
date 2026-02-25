import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import KanbanBoard from './KanbanBoard'
import ChatPanel from './ChatPanel'
import AIRiskPanel from './AIRiskPanel'

export const dynamic = 'force-dynamic'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { tasks: { orderBy: { createdAt: 'asc' } }, messages: { orderBy: { createdAt: 'asc' } } },
  })
  if (!project) notFound()

  // Get session for role-based UI
  const session = getSession()
  const role = session?.role ?? 'employee'
  const userName = session?.name ?? ''

  const done = project.tasks.filter(t => t.status === 'done').length
  const pct = project.tasks.length ? Math.round(done / project.tasks.length * 100) : 0
  const daysLeft = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)

  return (
    <div className="p-8 animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-3xl font-bold text-white">{project.name}</h1>
              {project.riskScore >= 70 && (
                <span className="text-xs bg-rose/20 text-rose px-2.5 py-1 rounded-full border border-rose/20 font-medium">⚠ High Risk</span>
              )}
              {/* Role badge on project page */}
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${role === 'admin' ? 'bg-accent/15 text-accent-light border-accent/25' :
                role === 'manager' ? 'bg-amber/15 text-amber border-amber/25' :
                  'bg-jade/15 text-jade border-jade/25'
                }`}>
                {role}
              </span>
            </div>
            <p className="text-white/40 text-sm">{project.description}</p>
          </div>
          <div className="text-right glass rounded-xl px-5 py-3">
            <p className={`text-lg font-display font-bold ${daysLeft <= 7 ? 'text-rose' : daysLeft <= 14 ? 'text-amber' : 'text-white'}`}>
              {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
            </p>
            <p className="text-xs text-white/30">{new Date(project.deadline).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm text-white/40 w-10 text-right">{pct}%</span>
        </div>

        {/* Mini stats */}
        <div className="flex gap-6 mt-4 text-sm">
          <span className="text-white/40">Budget: <span className="text-white">${project.spent.toLocaleString()}</span> / ${project.budget.toLocaleString()}</span>
          <span className="text-white/40">Tasks: <span className="text-white">{done}/{project.tasks.length}</span> done</span>
          <span className="text-white/40">Risk Score: <span className={project.riskScore >= 70 ? 'text-rose' : project.riskScore >= 40 ? 'text-amber' : 'text-jade'}>{project.riskScore}/100</span></span>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <KanbanBoard
            tasks={project.tasks as any}
            projectId={project.id}
            role={role}
            userName={userName}
          />
          <AIRiskPanel project={project as any} />
        </div>
        <div>
          <ChatPanel initialMessages={project.messages as any} projectId={project.id} userName={userName} />
        </div>
      </div>
    </div>
  )
}
