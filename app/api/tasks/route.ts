import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const raw = cookies().get(SESSION_COOKIE)?.value
  const session = raw ? decodeSession(raw) : null

  // Only admins and managers can create tasks
  if (!session || session.role === 'employee') {
    return NextResponse.json({ error: 'Only managers and admins can create tasks.' }, { status: 403 })
  }

  const body = await req.json()
  const { title, projectId, status, priority, assigneeId, dueDate } = body

  if (!title?.trim() || !projectId) {
    return NextResponse.json({ error: 'title and projectId are required.' }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      projectId,
      status: status ?? 'todo',
      priority: priority ?? 'medium',
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(task, { status: 201 })
}
