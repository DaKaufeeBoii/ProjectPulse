import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/db-auth';
import { encodeSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email?.trim() || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const user = await loginUser(email, password);

        const sessionValue = encodeSession({ userId: user.id, email: user.email, name: user.name, role: user.role });
        const res = NextResponse.json({ success: true, role: user.role });
        res.cookies.set(SESSION_COOKIE, sessionValue, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });
        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message === 'NOT_VERIFIED') {
            return NextResponse.json({ error: 'Please verify your email before logging in.', code: 'NOT_VERIFIED' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
}
