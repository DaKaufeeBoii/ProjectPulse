import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// List all employees (verified users) for the add-member dropdown
export async function GET() {
    const raw = cookies().get(SESSION_COOKIE)?.value
    const session = raw ? decodeSession(raw) : null
    if (!session || session.role === 'employee') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
        where: { verified: true },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: 'asc' },
    })
    return NextResponse.json(users)
}
