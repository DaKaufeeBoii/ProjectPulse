// ─────────────────────────────────────────────────────────────────
// lib/auth.ts — session helpers only.
// The user store has moved to lib/db-auth.ts (Prisma + bcrypt).
// ─────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'manager' | 'employee';

export interface SessionPayload {
    userId: string;
    email: string;
    name: string;
    role: Role;
}

export const SESSION_COOKIE = 'pp_session';

export function encodeSession(payload: SessionPayload): string {
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeSession(cookie: string): SessionPayload | null {
    try {
        return JSON.parse(Buffer.from(cookie, 'base64').toString('utf-8'));
    } catch {
        return null;
    }
}
