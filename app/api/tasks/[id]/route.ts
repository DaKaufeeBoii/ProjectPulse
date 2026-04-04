import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, decodeSession } from '@/lib/auth';

export const dynamic = 'force-dynamic'

// Columns employees are FORBIDDEN from setting as the destination
const EMPLOYEE_FORBIDDEN_STATUSES = new Set(['done', 'blocked'])

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const session = raw ? decodeSession(raw) : null;

  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 });
  }

  const body = await req.json();

  if (session.role === 'employee') {
    // Employees may ONLY update the status field
    const bodyKeys = Object.keys(body);
    if (bodyKeys.some(k => k !== 'status')) {
      return NextResponse.json(
        { error: 'Employees may only change task status.' },
        { status: 403 }
      );
    }

    // Employees cannot move tasks to 'done' or 'blocked'
    if (body.status && EMPLOYEE_FORBIDDEN_STATUSES.has(body.status)) {
      return NextResponse.json(
        { error: `Employees cannot set a task to "${body.status}". Only a manager can do that.` },
        { status: 403 }
      );
    }

    // Employees can only touch tasks assigned to them
    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }
    if (task.assigneeId !== session.userId) {
      return NextResponse.json(
        { error: 'You can only update tasks assigned to you.' },
        { status: 403 }
      );
    }
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data: body,
    include: { assignee: { select: { id: true, name: true } } },
  });
  return NextResponse.json(task);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const session = raw ? decodeSession(raw) : null;

  if (!session || session.role === 'employee') {
    return NextResponse.json({ error: 'Only admins and managers can delete tasks.' }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
