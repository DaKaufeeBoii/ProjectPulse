'use client'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Team = { id: string; name: string; description: string | null; members: { user: { name: string } }[] }

export default function NewProjectPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [teams, setTeams] = useState<Team[]>([])
    const [form, setForm] = useState({
        name: '',
        description: '',
        deadline: '',
        budget: '',
        status: 'on-track',
        teamId: '',
    })

    useEffect(() => {
        fetch('/api/teams').then(r => r.json()).then(data => {
            if (Array.isArray(data)) setTeams(data)
        }).catch(() => { })
    }, [])

    function set(field: string, value: string) {
        setForm(f => ({ ...f, [field]: value }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description.trim() || null,
                    deadline: new Date(form.deadline).toISOString(),
                    budget: parseFloat(form.budget) || 0,
                    spent: 0,
                    status: form.status,
                    riskScore: 0,
                    ...(form.teamId ? { teamId: form.teamId } : {}),
                }),
            })
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                throw new Error(d.error || 'Failed to create project')
            }
            const project = await res.json()
            router.push(`/projects/${project.id}`)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setLoading(false)
        }
    }

    return (
        <div className="p-8 animate-slide-up max-w-2xl">
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5 mb-6"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Back to Projects
                </button>
                <h1 className="font-display text-3xl font-bold text-white mb-1">New Project</h1>
                <p className="text-white/40 text-sm">Fill in the details to create a new project.</p>
            </div>

            <div className="glass rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">
                            Project Name <span className="text-rose">*</span>
                        </label>
                        <input
                            type="text" required placeholder="e.g. Mobile App Redesign"
                            value={form.name} onChange={e => set('name', e.target.value)}
                            className="w-full bg-surface-3 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">Description</label>
                        <textarea
                            rows={3} placeholder="Brief overview of what this project covers…"
                            value={form.description} onChange={e => set('description', e.target.value)}
                            className="w-full bg-surface-3 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
                        />
                    </div>

                    {/* Assigned Team */}
                    <div>
                        <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">
                            Assign to Team <span className="text-white/25">(optional)</span>
                        </label>
                        {teams.length === 0 ? (
                            <div className="w-full bg-surface-3 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white/25 italic">
                                No teams created yet — go to the Team page to create one.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    type="button"
                                    onClick={() => set('teamId', '')}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all text-left ${form.teamId === '' ? 'border-white/20 bg-white/5 text-white' : 'border-white/5 text-white/30 hover:border-white/15'
                                        }`}
                                >
                                    <span className="text-white/30 text-xs">○</span>
                                    <span>Unassigned</span>
                                </button>
                                {teams.map(t => (
                                    <button
                                        key={t.id} type="button"
                                        onClick={() => set('teamId', t.id)}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all text-left ${form.teamId === t.id
                                                ? 'border-accent/40 bg-accent/10 text-white'
                                                : 'border-white/5 text-white/50 hover:border-white/20 hover:text-white/70'
                                            }`}
                                    >
                                        <span className={`text-xs ${form.teamId === t.id ? 'text-accent-light' : 'text-white/20'}`}>
                                            {form.teamId === t.id ? '●' : '○'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium">{t.name}</span>
                                            {t.description && <span className="text-white/30 ml-2 text-xs">{t.description}</span>}
                                        </div>
                                        <span className="text-xs text-white/25 shrink-0">
                                            {t.members.length} member{t.members.length !== 1 ? 's' : ''}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Deadline + Budget side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">
                                Deadline <span className="text-rose">*</span>
                            </label>
                            <input
                                type="date" required
                                value={form.deadline} onChange={e => set('deadline', e.target.value)}
                                className="w-full bg-surface-3 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">Budget ($)</label>
                            <input
                                type="number" min="0" step="100" placeholder="50000"
                                value={form.budget} onChange={e => set('budget', e.target.value)}
                                className="w-full bg-surface-3 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">Initial Status</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'on-track', label: '✅ On Track', active: 'border-jade bg-jade/10 text-jade' },
                                { value: 'at-risk', label: '⚠️ At Risk', active: 'border-amber bg-amber/10 text-amber' },
                                { value: 'delayed', label: '🔴 Delayed', active: 'border-rose bg-rose/10 text-rose' },
                            ].map(s => (
                                <button key={s.value} type="button" onClick={() => set('status', s.value)}
                                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${form.status === s.value ? s.active : 'border-white/8 text-white/40 hover:border-white/20'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-rose text-sm bg-rose/10 border border-rose/20 rounded-lg px-4 py-2.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={loading}
                            className="flex-1 bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
                            {loading ? 'Creating…' : '✦ Create Project'}
                        </button>
                        <button type="button" onClick={() => router.back()}
                            className="px-5 py-2.5 text-sm text-white/40 hover:text-white border border-white/8 hover:border-white/20 rounded-lg transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
