import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.message.deleteMany()
  await prisma.task.deleteMany()
  await prisma.budgetEntry.deleteMany()
  await prisma.project.deleteMany()

  const p1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Full overhaul of the company marketing site with new brand identity',
      status: 'at-risk',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      budget: 25000,
      spent: 21000,
      riskScore: 78,
      riskReason: 'Budget 84% consumed with 3 major tasks still open. Deadline in 7 days.',
      tasks: {
        create: [
          { title: 'Design system audit', status: 'done', priority: 'high', assignee: 'Sara K.', dueDate: new Date(Date.now() - 5 * 86400000) },
          { title: 'New landing page mockups', status: 'done', priority: 'high', assignee: 'Marcus L.', dueDate: new Date(Date.now() - 3 * 86400000) },
          { title: 'Component library build', status: 'in-progress', priority: 'high', assignee: 'Sara K.', dueDate: new Date(Date.now() + 2 * 86400000) },
          { title: 'CMS integration', status: 'in-progress', priority: 'medium', assignee: 'Jay P.', dueDate: new Date(Date.now() + 4 * 86400000) },
          { title: 'Mobile responsiveness QA', status: 'todo', priority: 'high', assignee: 'Marcus L.', dueDate: new Date(Date.now() + 6 * 86400000) },
          { title: 'SEO meta tags', status: 'todo', priority: 'low', assignee: 'Jay P.', dueDate: new Date(Date.now() + 6 * 86400000) },
          { title: 'Performance audit', status: 'blocked', priority: 'medium', assignee: 'Sara K.', dueDate: new Date(Date.now() + 7 * 86400000) },
        ]
      },
      messages: {
        create: [
          { content: 'Design review went well! Client approved the new brand direction.', author: 'Sara K.', avatar: 'SK', createdAt: new Date(Date.now() - 2 * 3600000) },
          { content: 'CMS integration is taking longer than expected. Need an extra day.', author: 'Jay P.', avatar: 'JP', createdAt: new Date(Date.now() - 1 * 3600000) },
          { content: 'Let\'s sync tomorrow morning to review blockers before the deadline crunch.', author: 'Marcus L.', avatar: 'ML', createdAt: new Date(Date.now() - 30 * 60000) },
        ]
      }
    }
  })

  const p2 = await prisma.project.create({
    data: {
      name: 'Mobile App v2',
      description: 'Second major release with real-time features and new onboarding flow',
      status: 'active',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      budget: 80000,
      spent: 32000,
      riskScore: 22,
      riskReason: 'On track. Budget and timeline healthy.',
      tasks: {
        create: [
          { title: 'User research synthesis', status: 'done', priority: 'high', assignee: 'Priya M.', dueDate: new Date(Date.now() - 10 * 86400000) },
          { title: 'Auth flow redesign', status: 'done', priority: 'high', assignee: 'Dev T.', dueDate: new Date(Date.now() - 7 * 86400000) },
          { title: 'Push notifications setup', status: 'in-progress', priority: 'high', assignee: 'Dev T.', dueDate: new Date(Date.now() + 5 * 86400000) },
          { title: 'Offline mode support', status: 'in-progress', priority: 'medium', assignee: 'Priya M.', dueDate: new Date(Date.now() + 10 * 86400000) },
          { title: 'Analytics integration', status: 'todo', priority: 'medium', assignee: 'Dev T.', dueDate: new Date(Date.now() + 20 * 86400000) },
          { title: 'Beta testing', status: 'todo', priority: 'high', assignee: 'Priya M.', dueDate: new Date(Date.now() + 35 * 86400000) },
        ]
      },
      messages: {
        create: [
          { content: 'Push notification POC is working on both iOS and Android 🎉', author: 'Dev T.', avatar: 'DT', createdAt: new Date(Date.now() - 5 * 3600000) },
          { content: 'Should we include offline mode in the beta or push to v2.1?', author: 'Priya M.', avatar: 'PM', createdAt: new Date(Date.now() - 2 * 3600000) },
        ]
      }
    }
  })

  const p3 = await prisma.project.create({
    data: {
      name: 'Data Pipeline Infra',
      description: 'Build ETL pipeline for real-time analytics ingestion from 12 data sources',
      status: 'active',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: 40000,
      spent: 18500,
      riskScore: 45,
      riskReason: 'Two team members on leave next week. Timeline may slip.',
      tasks: {
        create: [
          { title: 'Architecture design doc', status: 'done', priority: 'high', assignee: 'Alex R.', dueDate: new Date(Date.now() - 14 * 86400000) },
          { title: 'Kafka cluster setup', status: 'done', priority: 'high', assignee: 'Alex R.', dueDate: new Date(Date.now() - 7 * 86400000) },
          { title: 'Source connectors (6/12)', status: 'in-progress', priority: 'high', assignee: 'Nina W.', dueDate: new Date(Date.now() + 7 * 86400000) },
          { title: 'Data transformation layer', status: 'todo', priority: 'high', assignee: 'Alex R.', dueDate: new Date(Date.now() + 14 * 86400000) },
          { title: 'Monitoring dashboards', status: 'todo', priority: 'medium', assignee: 'Nina W.', dueDate: new Date(Date.now() + 25 * 86400000) },
        ]
      },
      messages: {
        create: [
          { content: 'Kafka is running smooth in staging. Moving to prod setup tomorrow.', author: 'Alex R.', avatar: 'AR', createdAt: new Date(Date.now() - 8 * 3600000) },
          { content: 'Heads up: I\'ll be out next week. Nina can cover the connector work.', author: 'Alex R.', avatar: 'AR', createdAt: new Date(Date.now() - 1 * 3600000) },
        ]
      }
    }
  })

  // Budget entries
  await prisma.budgetEntry.createMany({
    data: [
      { projectId: p1.id, description: 'Design agency retainer', amount: 8000, type: 'expense', category: 'Design', date: new Date(Date.now() - 20 * 86400000) },
      { projectId: p1.id, description: 'Frontend development', amount: 9000, type: 'expense', category: 'Engineering', date: new Date(Date.now() - 10 * 86400000) },
      { projectId: p1.id, description: 'Content writing', amount: 2000, type: 'expense', category: 'Content', date: new Date(Date.now() - 5 * 86400000) },
      { projectId: p1.id, description: 'Hosting & tooling', amount: 2000, type: 'expense', category: 'Infrastructure', date: new Date(Date.now() - 2 * 86400000) },
      { projectId: p2.id, description: 'iOS/Android dev', amount: 20000, type: 'expense', category: 'Engineering', date: new Date(Date.now() - 15 * 86400000) },
      { projectId: p2.id, description: 'UX research sessions', amount: 5000, type: 'expense', category: 'Research', date: new Date(Date.now() - 12 * 86400000) },
      { projectId: p2.id, description: 'Push notification service', amount: 7000, type: 'expense', category: 'Infrastructure', date: new Date(Date.now() - 3 * 86400000) },
      { projectId: p3.id, description: 'Cloud infra (AWS)', amount: 10000, type: 'expense', category: 'Infrastructure', date: new Date(Date.now() - 20 * 86400000) },
      { projectId: p3.id, description: 'Engineering hours', amount: 8500, type: 'expense', category: 'Engineering', date: new Date(Date.now() - 7 * 86400000) },
    ]
  })

  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
