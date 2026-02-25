'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type Role = 'admin' | 'manager' | 'employee'

const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: '▦' },
    { href: '/projects', label: 'Projects', icon: '◈' },
    { href: '/budget', label: 'Budget', icon: '◎' },
    { href: '/team', label: 'Team', icon: '◉' },
]

export default function SidebarClient({ role, name }: { role: Role; name: string }) {
    const path = usePathname()
    const router = useRouter()
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    async function handleSignOut() {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-56 bg-surface-1 border-r border-white/5 flex flex-col z-40">
            <div className="px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-bold font-display">P</div>
                    <span className="font-display font-700 text-white text-lg tracking-tight">ProjectPulse</span>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {nav.map(({ href, label, icon }) => {
                    const active = path.startsWith(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active
                                ? 'bg-accent/20 text-accent-light font-medium'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                }`}
                        >
                            <span className="text-base">{icon}</span>
                            {label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-3 px-2 mb-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${role === 'admin' ? 'bg-accent/30 text-accent-light' : role === 'manager' ? 'bg-amber/30 text-amber' : 'bg-jade/30 text-jade'}`}>
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/80 truncate">{name}</p>
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-widest mt-0.5 px-1.5 py-0.5 rounded border ${role === 'admin' ? 'text-accent-light bg-accent/15 border-accent/25' : role === 'manager' ? 'text-amber bg-amber/15 border-amber/25' : 'text-jade bg-jade/15 border-jade/25'}`}>
                            {role}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-rose hover:bg-rose/10 transition-all"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
