// ─────────────────────────────────────────────────────────────
// Prisma-backed auth — replaces the in-memory lib/auth.ts store.
// Passwords are hashed with bcryptjs.
// ─────────────────────────────────────────────────────────────
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export type Role = 'admin' | 'manager' | 'employee';

// ── Helpers ────────────────────────────────────────────────────

function generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function validateRole(role: unknown): Role {
    if (role === 'admin' || role === 'manager' || role === 'employee') return role;
    return 'employee';
}

// ── Register ───────────────────────────────────────────────────

export async function registerUser(input: {
    name: string;
    email: string;
    password: string;
    role?: Role;
}): Promise<{ email: string; code: string }> {
    const existing = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase().trim() },
    });
    if (existing) throw new Error('EMAIL_TAKEN');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const code = generateCode();

    await prisma.user.create({
        data: {
            name: input.name.trim(),
            email: input.email.toLowerCase().trim(),
            passwordHash,
            role: validateRole(input.role),
            verified: false,
            verificationCode: code,
        },
    });

    return { email: input.email.toLowerCase().trim(), code };
}

// ── Verify ─────────────────────────────────────────────────────

export async function verifyUser(
    email: string,
    code: string
): Promise<{ id: string; name: string; email: string; role: Role }> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.verified) throw new Error('ALREADY_VERIFIED');
    if (user.verificationCode !== code) throw new Error('INVALID_CODE');

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { verified: true, verificationCode: null },
    });

    return { id: updated.id, name: updated.name, email: updated.email, role: updated.role as Role };
}

// ── Resend Code ────────────────────────────────────────────────

export async function resendCode(email: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.verified) throw new Error('ALREADY_VERIFIED');

    const code = generateCode();
    await prisma.user.update({ where: { id: user.id }, data: { verificationCode: code } });
    return code;
}

// ── Login ──────────────────────────────────────────────────────

export async function loginUser(
    email: string,
    password: string
): Promise<{ id: string; name: string; email: string; role: Role }> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw new Error('INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('INVALID_CREDENTIALS');
    if (!user.verified) throw new Error('NOT_VERIFIED');

    return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
}
