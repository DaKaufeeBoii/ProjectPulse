import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'
import TeamManager from './TeamManager'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const raw = cookies().get(SESSION_COOKIE)?.value
  const session = raw ? decodeSession(raw) : null
  const canManage = session?.role === 'admin' || session?.role === 'manager'

  // Fetch data server-side and pass as props — avoids client-side Prisma issues
  const [teams, allUsers] = await Promise.all([
    (prisma as any).team.findMany({
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as Promise<any[]>,
    canManage
      ? (prisma as any).user.findMany({
        where: { verified: true },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: 'asc' },
      }) as Promise<any[]>
      : Promise.resolve([]),
  ])

  return (
    <div className="p-8 animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Teams</h1>
          <p className="text-white/40 text-sm">
            {teams.length} team{teams.length !== 1 ? 's' : ''} · {allUsers.length || teams.flatMap(t => t.members).length} users
          </p>
        </div>
        {session && (
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${session.role === 'admin' ? 'bg-accent/15 text-accent-light border-accent/25' :
            session.role === 'manager' ? 'bg-amber/15 text-amber border-amber/25' :
              'bg-jade/15 text-jade border-jade/25'
            }`}>
            {session.role}
          </span>
        )}
      </div>

      {!canManage && (
        <div className="mb-6 bg-white/3 border border-white/8 text-white/40 text-xs rounded-xl px-4 py-3 flex items-center gap-2">
          <span>👁</span>
          You can view teams but only admins and managers can add or remove members.
        </div>
      )}

      <TeamManager
        initialTeams={teams as any}
        allUsers={allUsers as any}
        canManage={canManage}
      />
    </div>
  )
}
