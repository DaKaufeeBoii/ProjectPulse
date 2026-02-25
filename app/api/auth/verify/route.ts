import { NextResponse } from 'next/server';
import { verifyUser, resendCode } from '@/lib/db-auth';
import { encodeSession, SESSION_COOKIE } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { email, code, action } = await req.json();

        if (!email?.trim()) {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }

        if (action === 'resend') {
            const newCode = await resendCode(email);
            await sendVerificationEmail(email, newCode, email.split('@')[0]);
            return NextResponse.json({ success: true, message: 'A new code has been sent.' });
        }

        // ── TEMP: skip verification ──────────────────────────
        if (action === 'skip') {
            const user = await prisma.user.update({
                where: { email },
                data: { verified: true },
            });
            const sessionValue = encodeSession({ userId: user.id, email: user.email, name: user.name, role: user.role as any });
            const res = NextResponse.json({ success: true });
            res.cookies.set(SESSION_COOKIE, sessionValue, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' });
            return res;
        }

        if (!code?.trim()) {
            return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });
        }

        const user = await verifyUser(email, code);

        const sessionValue = encodeSession({ userId: user.id, email: user.email, name: user.name, role: user.role });
        const res = NextResponse.json({ success: true });
        res.cookies.set(SESSION_COOKIE, sessionValue, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });
        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message === 'INVALID_CODE') {
            return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 });
        }
        if (message === 'ALREADY_VERIFIED') {
            return NextResponse.json({ error: 'This account is already verified.' }, { status: 409 });
        }
        console.error('[verify]', err);
        return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
    }
}
