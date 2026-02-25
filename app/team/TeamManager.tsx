'use client'
import { useState } from 'react'

type Role = 'admin' | 'manager' | 'employee'
type DbUser = { id: string; name: string; email: string; role: Role }
type TeamMember = { id: string; userId: string; joinedAt: string; user: DbUser }
type Team = { id: string; name: string; description: string | null; members: TeamMember[] }

const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-accent/20 text-accent-light border-accent/25',
    manager: 'bg-amber/20 text-amber border-amber/25',
    employee: 'bg-jade/20 text-jade border-jade/25',
}

const AVATAR_COLORS = [
    'bg-sky/30 text-sky', 'bg-jade/30 text-jade', 'bg-amber/30 text-amber',
    'bg-accent/30 text-accent-light', 'bg-rose/30 text-rose',
]
function avatarColor(id: string) {
    const n = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

interface Props {
    initialTeams: Team[]
    allUsers: DbUser[]
    canManage: boolean
}

export default function TeamManager({ initialTeams, allUsers, canManage }: Props) {
    const [teams, setTeams] = useState<Team[]>(initialTeams)
    const [creating, setCreating] = useState(false)
    const [newTeamName, setNewTeamName] = useState('')
    const [newTeamDesc, setNewTeamDesc] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [addingToTeam, setAddingToTeam] = useState<string | null>(null)
    const [selectedUser, setSelectedUser] = useState('')

    async function createTeam() {
        if (!newTeamName.trim()) return
        setSaving(true); setError('')
        const res = await fetch('/api/teams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newTeamName, description: newTeamDesc }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); setSaving(false); return }
        setTeams(prev => [data, ...prev])
        setNewTeamName(''); setNewTeamDesc(''); setCreating(false); setSaving(false)
    }

    async function addMember(teamId: string) {
        if (!selectedUser) return
        const res = await fetch(`/api/teams/${teamId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: selectedUser }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: [...t.members, data] } : t))
        setAddingToTeam(null); setSelectedUser('')
    }

    async function removeMember(teamId: string, userId: string) {
        await fetch(`/api/teams/${teamId}/members?userId=${userId}`, { method: 'DELETE' })
        setTeams(prev => prev.map(t =>
            t.id === teamId ? { ...t, members: t.members.filter(m => m.userId !== userId) } : t
        ))
    }

    async function deleteTeam(teamId: string) {
        await fetch(`/api/teams/${teamId}`, { method: 'DELETE' })
        setTeams(prev => prev.filter(t => t.id !== teamId))
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="flex items-center gap-2 text-rose text-sm bg-rose/10 border border-rose/20 rounded-lg px-4 py-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                    <button className="ml-auto text-white/30 hover:text-white" onClick={() => setError('')}>✕</button>
                </div>
            )}

            {/* Create team */}
            {canManage && (
                <div className="glass rounded-xl border border-white/5">
                    {creating ? (
                        <div className="p-5 space-y-3">
                            <p className="text-sm font-medium text-white/70">New Team</p>
                            <input autoFocus value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                                placeholder="Team name (e.g. Frontend Squad)"
                                className="w-full bg-surface-3 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent transition-colors" />
                            <textarea value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)}
                                placeholder="Description (optional)" rows={2}
                                className="w-full bg-surface-3 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent transition-colors resize-none" />
                            <div className="flex gap-2">
                                <button onClick={createTeam} disabled={saving || !newTeamName.trim()}
                                    className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/80 disabled:opacity-50 transition-colors">
                                    {saving ? 'Creating…' : 'Create Team'}
                                </button>
                                <button onClick={() => setCreating(false)} className="px-4 py-2 text-white/40 text-sm hover:text-white transition-colors">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setCreating(true)}
                            className="w-full flex items-center gap-2 px-5 py-4 text-sm text-white/40 hover:text-white/70 transition-colors">
                            <span className="text-lg leading-none">+</span> Create a new team
                        </button>
                    )}
                </div>
            )}

            {teams.length === 0 && (
                <div className="glass rounded-xl p-12 text-center border border-white/5">
                    <p className="text-white/20 text-sm">No teams yet.</p>
                    {canManage && <p className="text-white/15 text-xs mt-1">Click "Create a new team" to get started.</p>}
                </div>
            )}

            {teams.map(team => {
                const alreadyIn = new Set(team.members.map(m => m.userId))
                const available = allUsers.filter(u => !alreadyIn.has(u.id))

                return (
                    <div key={team.id} className="glass rounded-xl border border-white/5 overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-display font-semibold text-white">{team.name}</h3>
                                    <span className="text-xs text-white/30 bg-white/5 rounded-full px-2 py-0.5">
                                        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                {team.description && <p className="text-xs text-white/35 mt-0.5">{team.description}</p>}
                            </div>
                            {canManage && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setAddingToTeam(addingToTeam === team.id ? null : team.id); setSelectedUser('') }}
                                        className="text-xs text-accent-light hover:text-white border border-accent/25 hover:border-accent/60 bg-accent/10 rounded-lg px-3 py-1.5 transition-all">
                                        + Add member
                                    </button>
                                    <button onClick={() => deleteTeam(team.id)}
                                        className="text-xs text-white/20 hover:text-rose transition-colors px-2 py-1.5" title="Delete team">✕</button>
                                </div>
                            )}
                        </div>

                        {canManage && addingToTeam === team.id && (
                            <div className="px-5 py-3 bg-white/3 border-b border-white/5 flex items-center gap-3">
                                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                                    className="flex-1 bg-surface-3 border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors">
                                    <option value="">Select a user…</option>
                                    {available.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role}) — {u.email}</option>
                                    ))}
                                </select>
                                <button onClick={() => addMember(team.id)} disabled={!selectedUser}
                                    className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/80 disabled:opacity-40 transition-colors">
                                    Add
                                </button>
                            </div>
                        )}

                        {team.members.length === 0 ? (
                            <div className="px-5 py-6 text-center text-white/20 text-xs">
                                No members yet.{canManage && ' Add someone from the button above.'}
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {team.members.map(({ id, user, userId }) => (
                                    <div key={id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors group">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(userId)}`}>
                                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white/80 font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-white/30 truncate">{user.email}</p>
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${ROLE_COLORS[user.role] ?? ''}`}>
                                            {user.role}
                                        </span>
                                        {canManage && (
                                            <button onClick={() => removeMember(team.id, userId)}
                                                className="text-white/15 hover:text-rose transition-colors opacity-0 group-hover:opacity-100 text-xs ml-1" title="Remove from team">✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
