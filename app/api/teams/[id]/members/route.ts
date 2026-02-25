import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function getSession() {
    const raw = cookies().get(SESSION_COOKIE)?.value
    return raw ? decodeSession(raw) : null
}

// POST /api/teams/[id]/members — add a user to a team
export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = getSession()
    if (!session || session.role === 'employee') {
        return NextResponse.json({ error: 'Only admins and managers can add members.' }, { status: 403 })
    }

    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 })

    try {
        const member = await prisma.teamMember.create({
            data: { teamId: params.id, userId },
            include: { user: { select: { id: true, name: true, email: true, role: true } } },
        })
        return NextResponse.json(member, { status: 201 })
    } catch {
        // Unique constraint = already a member
        return NextResponse.json({ error: 'User is already in this team.' }, { status: 409 })
    }
}

// DELETE /api/teams/[id]/members?userId=xxx — remove a member
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = getSession()
    if (!session || session.role === 'employee') {
        return NextResponse.json({ error: 'Only admins and managers can remove members.' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 })

    await prisma.teamMember.deleteMany({ where: { teamId: params.id, userId } })
    return NextResponse.json({ ok: true })
}
