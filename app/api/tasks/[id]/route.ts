import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, decodeSession } from '@/lib/auth';

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // ── Read session ────────────────────────────────────
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const session = raw ? decodeSession(raw) : null;

  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 });
  }

  const body = await req.json();

  // ── Role-based permission enforcement ───────────────
  if (session.role === 'employee') {
    // Employees can change the status of any task, but no other fields.
    const bodyKeys = Object.keys(body);
    if (bodyKeys.some(k => k !== 'status')) {
      return NextResponse.json(
        { error: 'Employees may only change task status.' },
        { status: 403 }
      );
    }
  }

  // ── Apply update ────────────────────────────────────
  const task = await prisma.task.update({ where: { id: params.id }, data: body });
  return NextResponse.json(task);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  // ── Read session ────────────────────────────────────
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const session = raw ? decodeSession(raw) : null;

  if (!session || session.role === 'employee') {
    return NextResponse.json({ error: 'Only admins and managers can delete tasks.' }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
