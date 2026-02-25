import { cookies } from 'next/headers'
import { SESSION_COOKIE, decodeSession } from '@/lib/auth'
import SidebarClient from './SidebarClient'

// Server component — reads the session cookie directly, then delegates to client.
export default async function Sidebar() {
  const cookieStore = cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  const session = raw ? decodeSession(raw) : null
  const role = session?.role ?? 'employee'
  const name = session?.name ?? 'You'

  return <SidebarClient role={role} name={name} />
}

