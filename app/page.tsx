import Link from 'next/link';

const features = [
  {
    icon: '▦',
    title: 'Smart Dashboard',
    desc: 'At-a-glance stats, risk alerts, and project health — all in one overview.',
    color: 'text-accent-light',
    bg: 'bg-accent/10 border-accent/20',
  },
  {
    icon: '◈',
    title: 'Kanban Board',
    desc: 'Drag-free task management across To Do, In Progress, Blocked, and Done.',
    color: 'text-jade',
    bg: 'bg-jade/10 border-jade/20',
  },
  {
    icon: '◎',
    title: 'AI Risk Analysis',
    desc: 'AI-powered risk scoring with clear recommendations to keep projects on track.',
    color: 'text-rose',
    bg: 'bg-rose/10 border-rose/20',
  },
  {
    icon: '💬',
    title: 'Team Chat',
    desc: 'Per-project messaging with a real-time feel for seamless collaboration.',
    color: 'text-sky',
    bg: 'bg-sky/10 border-sky/20',
  },
  {
    icon: '◎',
    title: 'Budget Tracker',
    desc: 'Spend tracking by project and category with visual burn-rate indicators.',
    color: 'text-amber',
    bg: 'bg-amber/10 border-amber/20',
  },
  {
    icon: '◉',
    title: 'Team Overview',
    desc: 'Workload distribution and overload detection — keep your team healthy.',
    color: 'text-accent-light',
    bg: 'bg-accent/10 border-accent/20',
  },
];

const steps = [
  { n: '01', title: 'Create an account', desc: 'Sign up in seconds, verify your email, and you\'re in.' },
  { n: '02', title: 'Set up your projects', desc: 'Add tasks, assign team members, and start tracking.' },
  { n: '03', title: 'Ship with confidence', desc: 'Let AI flag risks early so your team ships on time, every time.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-white">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-md bg-surface/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-light">
                <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-white">ProjectPulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="text-sm bg-accent hover:bg-accent-light transition-colors text-white font-medium px-4 py-2 rounded-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="pt-40 pb-32 px-6 relative overflow-hidden">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/8 blur-[120px] rounded-full" />
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-rose/5 blur-3xl rounded-full" />
          <div className="absolute top-10 right-1/4 w-64 h-64 bg-jade/5 blur-3xl rounded-full" />
        </div>

        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-accent-light bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse-slow" />
            Now with AI risk analysis
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 text-white">
            Projects that{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-sky">
                stay on track
              </span>
              <span className="absolute inset-x-0 bottom-1 h-0.5 bg-gradient-to-r from-accent-light to-sky opacity-50 blur-sm" />
            </span>
          </h1>

          <p className="text-lg text-white/55 max-w-2xl mx-auto mb-12 leading-relaxed">
            ProjectPulse combines Kanban boards, budget tracking, team workload insights, and AI-powered risk analysis — so your team spends less time firefighting and more time shipping.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25 text-sm"
            >
              Start for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 px-8 py-3.5 rounded-xl transition-all"
            >
              View Demo Dashboard
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-xs text-white/30 mt-8">No credit card required · Set up in 2 minutes</p>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative max-w-5xl mx-auto mt-24">
          <div className="glass rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/50">
            <div className="bg-surface-2 border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose/60" />
                <div className="w-3 h-3 rounded-full bg-amber/60" />
                <div className="w-3 h-3 rounded-full bg-jade/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-surface-3 rounded-md h-5 w-48 mx-auto flex items-center justify-center">
                  <span className="text-xs text-white/30">localhost:3000/dashboard</span>
                </div>
              </div>
            </div>
            <div className="flex h-72">
              {/* Sidebar preview */}
              <div className="w-40 bg-surface-1 border-r border-white/5 p-3 shrink-0">
                <div className="flex items-center gap-1.5 mb-4 px-1">
                  <div className="w-5 h-5 rounded bg-accent/30" />
                  <div className="h-2.5 w-20 bg-white/10 rounded" />
                </div>
                {['Dashboard', 'Projects', 'Budget', 'Team'].map((l, i) => (
                  <div key={l} className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-0.5 ${i === 0 ? 'bg-accent/20' : ''}`}>
                    <div className={`w-2.5 h-2.5 rounded-sm ${i === 0 ? 'bg-accent-light' : 'bg-white/15'}`} />
                    <div className={`h-2 rounded ${i === 0 ? 'w-16 bg-accent-light/60' : 'w-12 bg-white/15'}`} />
                  </div>
                ))}
              </div>
              {/* Content preview */}
              <div className="flex-1 p-5 overflow-hidden">
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { color: 'bg-accent/20', label: '12 Projects', sub: 'Active' },
                    { color: 'bg-jade/20', label: '84%', sub: 'On Track' },
                    { color: 'bg-amber/20', label: '3 Alerts', sub: 'At Risk' },
                    { color: 'bg-sky/20', label: '8 Members', sub: 'Team' },
                  ].map(s => (
                    <div key={s.label} className={`${s.color} border border-white/8 rounded-xl p-3`}>
                      <div className="h-3 w-12 bg-white/20 rounded mb-2" />
                      <div className="h-2 w-8 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
                <div className="bg-surface-2 rounded-xl border border-white/5 p-3">
                  <div className="h-2.5 w-24 bg-white/20 rounded mb-3" />
                  {[90, 65, 40, 55].map((w, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-20 bg-white/10 rounded shrink-0" />
                      <div className="flex-1 bg-surface-3 rounded-full h-1.5">
                        <div className="bg-accent-light h-1.5 rounded-full" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-accent/10 blur-3xl rounded-full" />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-accent-light uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="font-display text-4xl font-bold text-white mb-4">One platform, zero chaos</h2>
            <p className="text-white/50 max-w-xl mx-auto text-base">
              From sprint planning to budget reviews — ProjectPulse keeps every part of your project in sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:border-white/10 transition-all group">
                <div className={`w-11 h-11 rounded-xl border ${f.bg} flex items-center justify-center mb-5`}>
                  <span className={`text-xl ${f.color}`}>{f.icon}</span>
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface-1 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-medium text-accent-light uppercase tracking-widest mb-3">Simple process</p>
          <h2 className="font-display text-4xl font-bold text-white mb-16">Up and running in minutes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-7 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                  <span className="font-display font-bold text-accent-light text-lg">{s.n}</span>
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to bring order to your projects?
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            Join teams already using ProjectPulse to ship faster and with less stress.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white font-semibold px-10 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25 text-base"
          >
            Create your free account
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-light">
                <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />
              </svg>
            </div>
            <span className="font-display font-bold text-sm text-white">ProjectPulse</span>
          </div>
          <p className="text-xs text-white/30">© {new Date().getFullYear()} ProjectPulse. Built with Next.js &amp; ♥</p>
          <div className="flex gap-5">
            <Link href="/login" className="text-xs text-white/40 hover:text-white/70 transition-colors">Sign In</Link>
            <Link href="/register" className="text-xs text-white/40 hover:text-white/70 transition-colors">Register</Link>
            <Link href="/dashboard" className="text-xs text-white/40 hover:text-white/70 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
