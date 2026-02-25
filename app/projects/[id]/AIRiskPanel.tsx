'use client'
import { useState } from 'react'

type Project = {
  id: string
  name: string
  riskScore: number
  riskReason: string | null
  budget: number
  spent: number
  deadline: string
  tasks: { status: string; priority: string }[]
}

export default function AIRiskPanel({ project }: { project: Project }) {
  const [analysis, setAnalysis] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const riskColor = project.riskScore >= 70 ? 'text-rose' : project.riskScore >= 40 ? 'text-amber' : 'text-jade'
  const riskBg = project.riskScore >= 70 ? 'border-rose/20 bg-rose/5' : project.riskScore >= 40 ? 'border-amber/20 bg-amber/5' : 'border-jade/20 bg-jade/5'

  async function runAnalysis() {
    setLoading(true)
    setAnalysis('')
    setDone(false)
    const res = await fetch('/api/ai-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    })
    const data = await res.json()
    setAnalysis(data.analysis || data.error || 'Analysis complete.')
    setDone(true)
    setLoading(false)
  }

  const tasks = project.tasks
  const todo = tasks.filter(t => t.status === 'todo').length
  const inProg = tasks.filter(t => t.status === 'in-progress').length
  const blocked = tasks.filter(t => t.status === 'blocked').length
  const done2 = tasks.filter(t => t.status === 'done').length
  const budgetPct = Math.round(project.spent / project.budget * 100)
  const daysLeft = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)

  return (
    <div className={`glass rounded-xl border ${riskBg}`}>
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">◎</span>
          <h2 className="font-display font-semibold text-white">AI Risk Analysis</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-display text-xl font-bold ${riskColor}`}>{project.riskScore}<span className="text-xs text-white/30">/100</span></span>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="px-3 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent-light text-xs rounded-lg border border-accent/20 transition-all disabled:opacity-50"
          >
            {loading ? '⟳ Analyzing...' : done ? '↺ Re-analyze' : '▶ Run Analysis'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Risk factors grid */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Budget Used', value: `${budgetPct}%`, risk: budgetPct > 80 },
            { label: 'Days Left', value: `${daysLeft}d`, risk: daysLeft < 10 },
            { label: 'Blocked', value: blocked, risk: blocked > 0 },
            { label: 'To Do', value: todo, risk: todo > 3 && daysLeft < 14 },
          ].map(f => (
            <div key={f.label} className={`rounded-lg p-3 ${f.risk ? 'bg-rose/10 border border-rose/20' : 'bg-white/5'}`}>
              <p className="text-[10px] text-white/40 mb-1">{f.label}</p>
              <p className={`font-display font-bold text-lg ${f.risk ? 'text-rose' : 'text-white/70'}`}>{f.value}</p>
            </div>
          ))}
        </div>

        {/* Stored risk reason */}
        {project.riskReason && !analysis && (
          <div className="text-sm text-white/60 bg-white/3 rounded-lg p-4 leading-relaxed border border-white/5">
            <p className="text-xs font-medium text-white/30 mb-2 uppercase tracking-wider">Last Assessment</p>
            {project.riskReason}
          </div>
        )}

        {/* AI analysis */}
        {loading && (
          <div className="flex items-center gap-3 text-white/40 py-4">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="text-sm">Claude is analyzing your project...</span>
          </div>
        )}

        {analysis && (
          <div className="text-sm text-white/70 bg-white/3 rounded-lg p-4 leading-relaxed border border-accent/10 animate-slide-up">
            <p className="text-xs font-medium text-accent-light mb-2 uppercase tracking-wider">✦ AI Analysis</p>
            {analysis}
          </div>
        )}

        {!loading && !analysis && !project.riskReason && (
          <div className="text-center py-4 text-white/25 text-sm">
            Click "Run Analysis" for AI-powered risk insights
          </div>
        )}
      </div>
    </div>
  )
}
