// Server-side session helper — reads the session cookie from next/headers.
// Use in Server Components and API route handlers.

import { cookies } from 'next/headers';
import { SESSION_COOKIE, decodeSession, type SessionPayload } from './auth';

const VALID_ROLES = ['admin', 'manager', 'employee'] as const;

export function getSession(): SessionPayload | null {
    const cookieStore = cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    const session = decodeSession(raw);
    if (!session) return null;
    // Validate role — old cookies may have a missing/unknown role
    if (!VALID_ROLES.includes(session.role as typeof VALID_ROLES[number])) {
        session.role = 'employee';
    }
    return session;
}

