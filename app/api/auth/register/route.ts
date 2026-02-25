import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/db-auth';
import type { Role } from '@/lib/db-auth';

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name?.trim() || !email?.trim() || !password) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
        }

        const validRoles: Role[] = ['admin', 'manager', 'employee'];
        const resolvedRole: Role = validRoles.includes(role) ? role : 'employee';

        const { email: userEmail, code } = await registerUser({ name, email, password, role: resolvedRole });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📬  ProjectPulse — Email Verification');
        console.log(`   To: ${userEmail}  [${resolvedRole.toUpperCase()}]`);
        console.log(`   Code: ${code}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return NextResponse.json({ success: true, email: userEmail });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message === 'EMAIL_TAKEN') {
            return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
        }
        console.error('[register]', err);
        return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
}
