import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function getSession() {
    const raw = cookies().get(SESSION_COOKIE)?.value
    return raw ? decodeSession(raw) : null
}

// GET /api/teams — list all teams with member count
export async function GET() {
    const session = getSession()
    if (!session) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const teams = await prisma.team.findMany({
        include: {
            members: {
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(teams)
}

// POST /api/teams — create a new team (admin/manager only)
export async function POST(req: Request) {
    const session = getSession()
    if (!session || session.role === 'employee') {
        return NextResponse.json({ error: 'Only admins and managers can create teams.' }, { status: 403 })
    }

    const { name, description } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Team name is required.' }, { status: 400 })

    const team = await prisma.team.create({
        data: { name: name.trim(), description: description?.trim() || null, createdBy: session.userId },
        include: { members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } } },
    })
    return NextResponse.json(team, { status: 201 })
}
