'use client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
    const router = useRouter()

    async function handleSignOut() {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
    }

    return (
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
    )
}
