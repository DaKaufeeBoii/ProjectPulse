import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { publish } from '@/lib/broadcaster';

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
  const body = await req.json();
  const message = await prisma.message.create({ data: body });

  // Fan out to all SSE subscribers for this project
  publish(message.projectId, { type: 'message', message });

  return NextResponse.json(message);
}
