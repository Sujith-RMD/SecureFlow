import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Silk from '../components/Silk';

/* ─── Icons ─────────────────────────────────────────────────── */
const ShieldCheckIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" strokeWidth="2" />
  </svg>
);
const BoltIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ZapIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/* ─── Data ───────────────────────────────────────────────────── */
const features = [
  {
    icon: <ShieldCheckIcon />,
    label: 'Intent Detection',
    title: 'We read every transaction',
    desc: 'Recipient history, amount patterns, time of day, and message semantics are all scored in milliseconds — before you tap confirm.',
    accent: '#3B82F6',
  },
  {
    icon: <BoltIcon />,
    label: 'Smart Friction',
    title: 'Strategic speed bumps',
    desc: 'High-risk payments get countdowns, warnings, and mandatory cooldowns — the split-second pause that stops 90% of scam losses.',
    accent: '#8B5CF6',
  },
  {
    icon: <EyeIcon />,
    label: 'Transparent Alerts',
    title: 'No black boxes — ever',
    desc: 'Every flag comes with a plain-English reason. You always know exactly why SecureFlow slowed you down.',
    accent: '#06B6D4',
  },
];

const stats = [
  { value: '₹10,000 Cr', label: 'Lost to UPI scams in 2023', sub: 'per RBI annual report' },
  { value: '55 Cr',      label: 'Active UPI users at risk',  sub: 'across India daily' },
  { value: '< 80ms',     label: 'Risk scored per payment',   sub: 'real-time engine' },
];

const steps = [
  { n: '01', title: 'Initiate Payment', body: 'Enter recipient, amount and remarks — exactly as you do today.' },
  { n: '02', title: 'Engine Scores It', body: 'Dozens of signals are weighed simultaneously: trust, amount, time, language.' },
  { n: '03', title: 'Intelligent Gate',  body: 'LOW flows through. MEDIUM warns you. HIGH delays or blocks — with full explanation.' },
];

/* ─── Component ─────────────────────────────────────────────── */
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () =>
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="bg-[#0A0F1E] text-[#F9FAFB] overflow-x-hidden">

      {/* ════════ HERO ════════ */}
      <section className="relative w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Silk speed={4} scale={1.1} color="#3B1FA8" noiseIntensity={1.6} rotation={0} />
        </div>
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,15,30,0.55) 0%, rgba(10,15,30,0.28) 45%, rgba(10,15,30,0.82) 85%, #0A0F1E 100%)',
          }}
        />
        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
          <div
            className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.35)', color: '#93C5FD' }}
          >
            <ZapIcon />
            Intent-Aware UPI Protection · Live Demo
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tighter">
            Stop Scams
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #38bdf8 100%)' }}
            >
              Before They Happen
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg sm:text-xl leading-relaxed" style={{ color: 'rgba(249,250,251,0.75)' }}>
            SecureFlow intercepts risky UPI payments in real time — analyzing intent,
            adding intelligent friction, and telling you exactly why.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-200 hover:scale-105 active:scale-100"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', boxShadow: '0 0 40px rgba(79,70,229,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset' }}
            >
              <LockIcon />
              Try Live Demo
              <ArrowRightIcon />
            </button>
            <button
              onClick={scrollToFeatures}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(249,250,251,0.85)', backdropFilter: 'blur(8px)' }}
            >
              See How It Works
            </button>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs" style={{ color: 'rgba(156,163,175,0.9)' }}>
            {['No login required', '3 risk levels', 'Real-time scoring', 'Open source'].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-50 hover:opacity-80 transition-opacity"
          style={{ color: '#9CA3AF' }}
        >
          <span className="text-xs tracking-widest uppercase">scroll</span>
          <span className="animate-bounce"><ChevronDownIcon /></span>
        </button>
      </section>

      {/* ════════ STATS ════════ */}
      <section
        className="border-y py-12"
        style={{ borderColor: 'rgba(30,45,69,0.8)', background: 'linear-gradient(90deg, rgba(59,130,246,0.04) 0%, rgba(139,92,246,0.06) 50%, rgba(6,182,212,0.04) 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
              <span className="text-4xl font-black bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #818CF8, #38BDF8)' }}>
                {s.value}
              </span>
              <span className="text-sm font-semibold text-[#F9FAFB]">{s.label}</span>
              <span className="text-xs text-[#4B5563]">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section ref={featuresRef} id="features" className="px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#6366F1' }}>How it works</p>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
              Three layers of{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #818CF8, #38BDF8)' }}>
                invisible armour
              </span>
            </h2>
            <p className="mt-5 text-lg text-[#9CA3AF] leading-relaxed">
              Working silently before every UPI confirmation — so you never lose money to a scam again.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative flex flex-col gap-5 p-7 rounded-3xl transition-all duration-300 hover:-translate-y-2"
                style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(30,45,69,0.9)', boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = `${f.accent}55`;
                  el.style.boxShadow = `0 0 40px ${f.accent}18, 0 1px 0 rgba(255,255,255,0.04) inset`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = 'rgba(30,45,69,0.9)';
                  el.style.boxShadow = '0 1px 0 rgba(255,255,255,0.04) inset';
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${f.accent}18`, color: f.accent, border: `1px solid ${f.accent}30` }}
                >
                  {f.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: f.accent }}>{f.label}</span>
                <div>
                  <h3 className="text-xl font-bold text-[#F9FAFB] leading-snug">{f.title}</h3>
                  <p className="mt-3 text-sm text-[#9CA3AF] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="px-6 py-24" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(17,24,39,0.6) 50%, transparent 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Every transaction, in 3 acts</h2>
            <p className="mt-4 text-[#9CA3AF] max-w-lg mx-auto">The entire flow takes under 100 ms — imperceptible to you, impenetrable to fraudsters.</p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="hidden md:block absolute top-[2.75rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #3B82F640, #8B5CF640, #06B6D440, transparent)' }}
            />
            {steps.map((s, i) => (
              <div key={i} className="relative flex flex-col gap-4 p-7 rounded-3xl" style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(30,45,69,0.9)' }}>
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black z-10"
                  style={{
                    background: i === 0 ? 'rgba(59,130,246,0.18)' : i === 1 ? 'rgba(139,92,246,0.18)' : 'rgba(6,182,212,0.18)',
                    color: i === 0 ? '#60A5FA' : i === 1 ? '#A78BFA' : '#38BDF8',
                    border: `1px solid ${i === 0 ? '#3B82F640' : i === 1 ? '#8B5CF640' : '#06B6D440'}`,
                  }}
                >
                  {s.n}
                </div>
                <h3 className="text-lg font-bold text-[#F9FAFB]">{s.title}</h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ RISK LEVELS ════════ */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">What each risk level looks like</h2>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { level: 'LOW',    action: 'ALLOW',       desc: 'Trusted recipient · Regular amount · Clear memo',                     color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)' },
              { level: 'MEDIUM', action: 'WARN + DELAY', desc: 'First-time recipient · Unusual amount · Vague remarks',               color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
              { level: 'HIGH',   action: 'BLOCK',        desc: 'Flagged UPI ID · Late-night · "OTP" in remarks · Large sum',          color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)' },
            ].map(r => (
              <div key={r.level} className="flex items-center justify-between gap-4 px-6 py-5 rounded-2xl" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                <div className="flex items-center gap-4">
                  <span className="w-14 text-center text-xs font-black py-1.5 rounded-full" style={{ background: `${r.color}22`, color: r.color, border: `1px solid ${r.color}44` }}>
                    {r.level}
                  </span>
                  <span className="text-sm text-[#9CA3AF]">{r.desc}</span>
                </div>
                <span className="shrink-0 text-xs font-bold" style={{ color: r.color }}>{r.action}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="px-6 pb-32">
        <div
          className="relative max-w-4xl mx-auto overflow-hidden rounded-3xl px-8 py-20 text-center flex flex-col items-center gap-7"
          style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(59,130,246,0.12) 50%, rgba(6,182,212,0.10) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)' }} />
          <h2 className="relative text-4xl sm:text-5xl font-black tracking-tight">Ready to try it?</h2>
          <p className="relative text-lg text-[#9CA3AF] max-w-lg">No account needed. Send a test payment and watch SecureFlow intercept it in real time.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-200 hover:scale-105 active:scale-100"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #3B82F6, #06B6D4)', boxShadow: '0 0 60px rgba(79,70,229,0.45)' }}
          >
            <LockIcon />
            Open Live Demo
            <ArrowRightIcon />
          </button>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm" style={{ borderColor: '#1E2D45', color: '#4B5563' }}>
        <span className="font-semibold text-[#9CA3AF]">SecureFlow</span>
        <span>Built for the hackathon · Real-time UPI fraud prevention</span>
        <span>© 2026</span>
      </footer>

    </div>
  );
};

export default Landing;
