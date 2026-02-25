// Auth layout — centered card, no sidebar
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
            </div>

            {/* Logo / brand */}
            <a href="/" className="mb-8 flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-light">
                        <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />
                    </svg>
                </div>
                <span className="font-display font-bold text-xl text-white">ProjectPulse</span>
            </a>

            {children}
        </div>
    );
}
