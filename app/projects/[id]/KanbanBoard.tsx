'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Task = {
  id: string
  title: string
  status: string
  priority: string
  assignee: string | null
  dueDate: string | null
}

type Role = 'admin' | 'manager' | 'employee'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'text-white/60', headerBg: 'bg-white/5' },
  { id: 'in-progress', label: 'In Progress', color: 'text-sky', headerBg: 'bg-sky/10' },
  { id: 'pending-review', label: 'Pending Review', color: 'text-amber', headerBg: 'bg-amber/10' },
  { id: 'blocked', label: 'Blocked', color: 'text-rose', headerBg: 'bg-rose/10' },
  { id: 'done', label: 'Done', color: 'text-jade', headerBg: 'bg-jade/10' },
]

const PRIORITY_COLOR: Record<string, string> = {
  high: 'border-l-rose',
  medium: 'border-l-amber',
  low: 'border-l-white/20',
}

interface Props {
  tasks: Task[]
  projectId: string
  role: Role
  userName: string
}

export default function KanbanBoard({ tasks: initialTasks, projectId, role, userName }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const isAdmin = role === 'admin' || role === 'manager'

  async function moveTask(taskId: string, newStatus: string) {
    setError('')
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Action not permitted.')
      // Rollback
      setTasks(initialTasks)
    } else {
      router.refresh()
    }
  }

  async function addTask() {
    if (!newTitle.trim()) return
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, projectId, status: 'todo', priority: 'medium' }),
    })
    const task = await res.json()
    setTasks(prev => [...prev, task])
    setNewTitle('')
    setAdding(false)
  }

  async function deleteTask(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    router.refresh()
  }

  // What move actions are visible for a given task+column (for the current user)
  function getAvailableMoves(task: Task, currentColId: string): typeof COLUMNS {
    // Both admins/managers and employees can move any task to any column.
    // (Approve/Reject for pending-review is shown separately for admins only.)
    return COLUMNS.filter(c => c.id !== currentColId)
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-display font-semibold text-white">Tasks</h2>
        {isAdmin && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs text-accent-light hover:text-white transition-colors"
          >
            + Add task
          </button>
        )}
      </div>

      {error && (
        <div className="px-6 py-2 bg-rose/10 border-b border-rose/20 text-rose text-xs flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {error}
        </div>
      )}

      {adding && isAdmin && (
        <div className="px-6 py-3 border-b border-white/5 flex gap-2">
          <input
            autoFocus value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Task title..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
          />
          <button onClick={addTask} className="px-3 py-1.5 bg-accent text-white text-xs rounded-lg hover:bg-accent/80 transition-colors">Add</button>
          <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-white/40 text-xs hover:text-white transition-colors">Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-5 divide-x divide-white/5 overflow-x-auto">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id)
          return (
            <div key={col.id} className="p-3 min-w-[160px]">
              <div className={`flex items-center justify-between mb-3 px-2 py-1.5 rounded-lg ${col.headerBg}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${col.color}`}>{col.label}</span>
                <span className="text-[10px] text-white/30 bg-white/5 rounded-full px-1.5 py-0.5">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map(task => {
                  const moves = getAvailableMoves(task, col.id)
                  const isMyTask = task.assignee?.toLowerCase() === userName.toLowerCase()
                  const isPendingReview = col.id === 'pending-review'

                  return (
                    <div key={task.id} className={`bg-surface-3 rounded-lg p-3 border-l-2 ${PRIORITY_COLOR[task.priority]} group`}>
                      <p className="text-xs text-white/80 group-hover:text-white mb-2 leading-snug">{task.title}</p>
                      {task.assignee && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isMyTask ? 'bg-jade/30 text-jade' : 'bg-accent/30 text-accent-light'}`}>
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-[10px] text-white/30">{task.assignee}</span>
                        </div>
                      )}

                      {/* Move buttons */}
                      <div className="flex gap-1 flex-wrap">
                        {/* Admin: Approve/Reject for pending-review */}
                        {isAdmin && isPendingReview && (
                          <>
                            <button
                              onClick={() => moveTask(task.id, 'done')}
                              className="text-[9px] font-medium text-jade hover:text-white bg-jade/15 hover:bg-jade/30 border border-jade/20 rounded px-1.5 py-0.5 transition-colors"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => moveTask(task.id, 'in-progress')}
                              className="text-[9px] font-medium text-rose hover:text-white bg-rose/15 hover:bg-rose/30 border border-rose/20 rounded px-1.5 py-0.5 transition-colors"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}

                        {/* Other move buttons (admin: all; employee: submit for review) */}
                        {!(isAdmin && isPendingReview) && moves.map(c => (
                          <button
                            key={c.id}
                            onClick={() => moveTask(task.id, c.id)}
                            className={`text-[9px] transition-colors border rounded px-1 py-0.5 ${c.id === 'pending-review'
                              ? 'text-amber/70 hover:text-amber border-amber/20 hover:border-amber/40 bg-amber/5'
                              : 'text-white/25 hover:text-white/60 border-white/5 hover:border-white/20'
                              }`}
                          >
                            {c.id === 'pending-review' ? '⬆ Submit for Review' : `→ ${c.label}`}
                          </button>
                        ))}

                        {/* Admin: delete button */}
                        {isAdmin && (
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-[9px] text-white/15 hover:text-rose transition-colors ml-auto"
                            title="Delete task"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {colTasks.length === 0 && (
                  <div className="h-12 border border-dashed border-white/5 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] text-white/15">empty</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
