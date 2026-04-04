import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { publish } from '@/lib/broadcaster';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, decodeSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  const session = raw ? decodeSession(raw) : null;

  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 });
  }

  const body = await req.json();
  const { projectId } = body;

  // Employees must be in the project's team to send messages
  if (session.role === 'employee') {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { teamId: true },
    });

    if (!project?.teamId) {
      return NextResponse.json({ error: 'This project has no team assigned.' }, { status: 403 });
    }

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: project.teamId, userId: session.userId } },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this team to send messages.' },
        { status: 403 }
      );
    }
  }

  const message = await prisma.message.create({ data: body });

  // Fan out to all SSE subscribers for this project
  publish(message.projectId, { type: 'message', message });

  return NextResponse.json(message);
}
