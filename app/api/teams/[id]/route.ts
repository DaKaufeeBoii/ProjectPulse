import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/teams/[id] — delete a team entirely
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    const raw = cookies().get(SESSION_COOKIE)?.value
    const session = raw ? decodeSession(raw) : null
    if (!session || session.role === 'employee') {
        return NextResponse.json({ error: 'Only admins and managers can delete teams.' }, { status: 403 })
    }
    await prisma.team.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
}
