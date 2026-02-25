import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { projectId } = await req.json()

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: true, messages: { orderBy: { createdAt: 'desc' }, take: 5 } },
  })

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const tasks = project.tasks
  const done = tasks.filter(t => t.status === 'done').length
  const inProg = tasks.filter(t => t.status === 'in-progress').length
  const blocked = tasks.filter(t => t.status === 'blocked').length
  const todo = tasks.filter(t => t.status === 'todo').length
  const highPrioOpen = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length
  const budgetPct = Math.round(project.spent / project.budget * 100)
  const daysLeft = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)
  const completionPct = tasks.length ? Math.round(done / tasks.length * 100) : 0

  const prompt = `You are a project risk analyst. Analyze this project and provide a concise, actionable risk assessment in 3-4 sentences.

Project: ${project.name}
Description: ${project.description}
Days until deadline: ${daysLeft}
Budget used: ${budgetPct}% ($${project.spent.toLocaleString()} of $${project.budget.toLocaleString()})
Task completion: ${completionPct}% (${done} done, ${inProg} in-progress, ${blocked} blocked, ${todo} todo)
High-priority open tasks: ${highPrioOpen}
Recent chat context: ${project.messages.map(m => `${m.author}: ${m.content}`).join(' | ') || 'none'}

Provide a direct, practical risk assessment. Identify the top risks and suggest 1-2 concrete actions the PM should take now.`

  try {
    // Try Mistral API
    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) throw new Error('No API key')

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const analysis = data.choices?.[0]?.message?.content || 'Analysis unavailable.'

    // Update risk reason in DB
    await prisma.project.update({
      where: { id: projectId },
      data: { riskReason: analysis },
    })

    return NextResponse.json({ analysis })
  } catch {
    // Fallback: rule-based analysis if no API key
    const risks = []
    const actions = []

    if (budgetPct > 85) risks.push(`budget is ${budgetPct}% consumed`)
    if (daysLeft < 10 && completionPct < 70) risks.push(`only ${daysLeft} days remain with ${completionPct}% completion`)
    if (blocked > 0) { risks.push(`${blocked} task${blocked > 1 ? 's are' : ' is'} blocked`); actions.push('resolve blockers immediately') }
    if (highPrioOpen > 2) { risks.push(`${highPrioOpen} high-priority tasks are still open`); actions.push('prioritize high-priority tasks') }
    if (budgetPct > 80) actions.push('review remaining budget allocation')
    if (daysLeft < 14 && todo > 2) actions.push(`consider deferring ${todo} non-critical tasks`)

    const analysis = risks.length === 0
      ? `This project appears to be in good health. Budget utilization is ${budgetPct}%, ${completionPct}% of tasks are complete, and the deadline is ${daysLeft} days away. Continue monitoring as the deadline approaches.`
      : `Risk flags: ${risks.join(', ')}. ${actions.length > 0 ? `Recommended actions: ${actions.join('; ')}.` : ''} Monitor closely and escalate if blockers persist.`

    await prisma.project.update({ where: { id: projectId }, data: { riskReason: analysis } })
    return NextResponse.json({ analysis })
  }
}
