import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons (inline SVG so no extra deps needed)
const ShieldIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BoltIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

const features = [
  {
    icon: <ShieldIcon />,
    title: 'Intent Detection',
    desc: 'Every transaction is analyzed in real-time — recipient history, timing, amount patterns, and message context are all evaluated before you confirm.',
  },
  {
    icon: <BoltIcon />,
    title: 'Smart Friction',
    desc: 'Suspicious payments are slowed down with countdowns, warnings, and modal confirmations — giving you the split-second pause that prevents losses.',
  },
  {
    icon: <EyeIcon />,
    title: 'Transparent Alerts',
    desc: 'You always know exactly why a transaction was flagged. No black-box decisions — every risk reason is shown clearly so you stay in control.',
  },
];

const stats = [
  { value: '₹10,000 Cr', label: 'Lost to UPI scams in 2023' },
  { value: '55 Crore', label: 'Active UPI users at risk' },
  { value: '3 Risk Levels', label: 'LOW · MEDIUM · HIGH detection' },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0A0F1E] text-[#F9FAFB]">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)' }}
          />
        </div>

        {/* Badge */}
        <div className="relative mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1E2D45] bg-[#111827] text-sm text-[#9CA3AF]">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
          Intent-Aware Transaction Protection
        </div>

        {/* Heading */}
        <h1 className="relative max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
          Stop Scams{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
          >
            Before
          </span>{' '}
          They Happen
        </h1>

        {/* Sub-heading */}
        <p className="relative mt-6 max-w-2xl text-lg sm:text-xl text-[#9CA3AF] leading-relaxed">
          SecureFlow adds intelligent protection to every UPI transaction —
          analyzing intent, adding smart friction, and keeping you informed
          before money leaves your account.
        </p>

        {/* CTA buttons */}
        <div className="relative mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-base transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-100 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', boxShadow: '0 0 24px rgba(59,130,246,0.35)' }}
          >
            Try Demo
            <ArrowRightIcon />
          </button>
          <button
            onClick={scrollToFeatures}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[#9CA3AF] text-base border border-[#1E2D45] bg-transparent transition-all duration-200 hover:border-[#3B82F6] hover:text-[#F9FAFB]"
          >
            Learn How
          </button>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-xs text-[#4B5563]">scroll</span>
          <svg className="w-4 h-4 text-[#4B5563] animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section ref={featuresRef} id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">How SecureFlow Protects You</h2>
            <p className="mt-4 text-[#9CA3AF] text-lg max-w-xl mx-auto">
              Three layers of intelligent protection working together every time you send money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative flex flex-col gap-4 p-7 rounded-2xl border border-[#1E2D45] bg-[#111827] transition-all duration-300 hover:border-[#3B82F6]/60 hover:shadow-lg hover:-translate-y-1"
                style={{ '--hover-shadow': '0 8px 40px rgba(59,130,246,0.12)' } as React.CSSProperties}
              >
                {/* Top gradient line */}
                <div
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)' }}
                />
                <div className="text-[#3B82F6]">{f.icon}</div>
                <h3 className="text-xl font-bold text-[#F9FAFB]">{f.title}</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section
        className="border-y border-[#1E2D45] py-14"
        style={{ background: 'linear-gradient(180deg, #111827 0%, #0A0F1E 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span
                className="text-4xl font-extrabold bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
              >
                {s.value}
              </span>
              <span className="text-sm text-[#9CA3AF] uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Every Transaction, Analyzed</h2>
            <p className="mt-4 text-[#9CA3AF] text-lg max-w-xl mx-auto">
              SecureFlow runs silently in the background, scoring every payment before it goes through.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1E2D45] rounded-2xl overflow-hidden border border-[#1E2D45]">
            {[
              { step: '01', title: 'You Initiate a Payment', desc: 'Enter recipient, amount, and a note like always.' },
              { step: '02', title: 'Risk Engine Scores It', desc: 'Factors like recipient trust, amount size, time of day, and message tone are evaluated instantly.' },
              { step: '03', title: 'Intelligent Response', desc: 'LOW risk goes through. MEDIUM gets a warning. HIGH is delayed or blocked — with clear reasons.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-4 p-8 bg-[#111827]">
                <span className="text-4xl font-black text-[#1E2D45]">{item.step}</span>
                <h3 className="text-lg font-semibold text-[#F9FAFB]">{item.title}</h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div
          className="max-w-4xl mx-auto rounded-2xl border border-[#1E2D45] p-12 text-center flex flex-col items-center gap-6"
          style={{ background: 'linear-gradient(135deg, #0F1A2E 0%, #111827 100%)' }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Experience It?</h2>
          <p className="text-[#9CA3AF] max-w-lg">
            Try the live demo — no login needed. See exactly how SecureFlow intercepts a high-risk
            transaction in real time.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-white text-base transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-100"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', boxShadow: '0 0 32px rgba(59,130,246,0.4)' }}
          >
            Try Demo Now
            <ArrowRightIcon />
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-[#1E2D45] py-8 px-6 text-center text-sm text-[#4B5563]">
        SecureFlow · Built for the hackathon · Protecting every UPI transaction
      </footer>
    </div>
  );
};

export default Landing;
