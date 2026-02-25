'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/dashboard';

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 'NOT_VERIFIED') {
                    router.push(`/verify?email=${encodeURIComponent(form.email)}`);
                    return;
                }
                setError(data.error);
                return;
            }
            router.push(next);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="glass rounded-2xl p-8 w-full max-w-md glow">
            <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-sm text-white/50 mb-8">Sign in to your ProjectPulse workspace.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">Email</label>
                    <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full bg-surface-3 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">Password</label>
                    <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className="w-full bg-surface-3 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-rose text-sm bg-rose/10 border border-rose/20 rounded-lg px-4 py-2.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-2"
                >
                    {loading ? 'Signing in…' : 'Sign In'}
                </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
                Don&apos;t have an account?{' '}
                <a href="/register" className="text-accent-light hover:underline">Create one free</a>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="glass rounded-2xl p-8 w-full max-w-md animate-pulse h-80" />}>
            <LoginForm />
        </Suspense>
    );
}
