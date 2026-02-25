import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

// Guard: only admins and managers can access /projects/new
export default function NewProjectGuard({ children }: { children: React.ReactNode }) {
    const raw = cookies().get(SESSION_COOKIE)?.value
    const session = raw ? decodeSession(raw) : null

    if (!session || session.role === 'employee') {
        redirect('/projects')
    }

    return <>{children}</>
}
