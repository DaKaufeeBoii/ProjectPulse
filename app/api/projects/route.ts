import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const projects = await prisma.project.findMany({ include: { tasks: true } })
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  // Only admins and managers can create projects
  const raw = cookies().get(SESSION_COOKIE)?.value
  const session = raw ? decodeSession(raw) : null
  if (!session || session.role === 'employee') {
    return NextResponse.json({ error: 'Only admins and managers can create projects.' }, { status: 403 })
  }

  const body = await req.json()
  const project = await prisma.project.create({ data: body })
  return NextResponse.json(project)
}

