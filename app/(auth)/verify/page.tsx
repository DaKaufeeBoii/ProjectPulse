'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputs = useRef<Array<HTMLInputElement | null>>([]);

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    function handleDigitChange(index: number, value: string) {
        const char = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = char;
        setDigits(next);
        if (char && index < 5) inputs.current[index + 1]?.focus();
    }

    function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    }

    function handlePaste(e: React.ClipboardEvent) {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (text.length === 6) {
            setDigits(text.split(''));
            inputs.current[5]?.focus();
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const code = digits.join('');
        if (code.length < 6) { setError('Please enter the full 6-digit code.'); return; }
        setError(''); setLoading(true);
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            router.push('/dashboard');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setError(''); setMessage('');
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, action: 'resend' }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setMessage('A new code has been sent.');
            setResendCooldown(30);
        } catch {
            setError('Failed to resend code.');
        }
    }

    async function handleSkip() {
        setError(''); setLoading(true);
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, action: 'skip' }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            router.push('/dashboard');
        } catch {
            setError('Something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="glass rounded-2xl p-8 w-full max-w-md glow">
            <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-6">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent-light">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
            </div>

            <h1 className="font-display text-2xl font-bold text-white mb-1">Check your email</h1>
            <p className="text-sm text-white/50 mb-1">
                We sent a 6-digit code to{' '}
                <span className="text-white/80">{email || 'your email'}</span>.
            </p>
            <p className="text-xs text-amber/80 bg-amber/10 border border-amber/20 rounded-lg px-3 py-2 mb-8">
                ⚡ Dev mode — check your terminal / server console for the code.
            </p>

            <form onSubmit={handleSubmit}>
                {/* 6-box digit input */}
                <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={el => { inputs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={e => handleDigitChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            className="w-11 h-14 text-center text-xl font-bold bg-surface-3 border-2 border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                        />
                    ))}
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-rose text-sm bg-rose/10 border border-rose/20 rounded-lg px-4 py-2.5 mb-4">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}
                {message && (
                    <div className="text-jade text-sm bg-jade/10 border border-jade/20 rounded-lg px-4 py-2.5 mb-4">
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                    {loading ? 'Verifying…' : 'Verify Email'}
                </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
                Didn&apos;t receive a code?{' '}
                {resendCooldown > 0
                    ? <span className="text-white/30">Resend in {resendCooldown}s</span>
                    : <button onClick={handleResend} className="text-accent-light hover:underline">Resend</button>
                }
            </p>

            {/* TEMP: skip button — remove before prod */}
            <button
                onClick={handleSkip}
                disabled={loading}
                className="w-full mt-3 border border-amber/30 text-amber/70 hover:text-amber hover:border-amber/60 text-xs py-2 rounded-lg transition-colors disabled:opacity-40"
            >
                ⚡ Skip Verification (Dev Only)
            </button>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="glass rounded-2xl p-8 w-full max-w-md animate-pulse h-80" />}>
            <VerifyForm />
        </Suspense>
    );
}
