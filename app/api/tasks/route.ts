import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.json()
  const task = await prisma.task.create({ data: body })
  return NextResponse.json(task)
}
