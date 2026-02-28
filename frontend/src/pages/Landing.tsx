import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import GridScan from '../components/GridScan';
import BlurText from '../components/BlurText';

/* ─── Fade-in wrapper ────────────────────────────────────────── */
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className = ''
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Icons ─────────────────────────────────────────────────── */
const ShieldIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" strokeWidth="2.2" />
  </svg>
);
const BoltIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const ArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ZapFill = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ChevronDown = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 12 15 18 9" /></svg>
);

/* ─── Data ─────────────────────────────────────────────────── */
const features = [
  {
    icon: <ShieldIcon />,
    label: 'Threat Detection',
    title: 'We read every signal',
    desc: 'Recipient history, amount anomalies, time-of-day patterns, and message semantics — all scored in under 80ms before you tap confirm.',
    accent: '#00FF87',
    glow: 'rgba(0,255,135,0.28)',
  },
  {
    icon: <BoltIcon />,
    label: 'Smart Friction',
    title: 'The pause that saves you',
    desc: 'High-risk payments get mandatory countdowns and cooldowns. That single-second delay stops 90% of scam losses in their tracks.',
    accent: '#00C96A',
    glow: 'rgba(0,201,106,0.28)',
  },
  {
    icon: <EyeIcon />,
    label: 'Full Transparency',
    title: 'No black boxes, ever',
    desc: 'Every flag gets a plain-English reason. You always know exactly why SecureFlow intervened — no mystery, no second-guessing.',
    accent: '#00FFB0',
    glow: 'rgba(0,255,176,0.28)',
  },
];

const stats = [
  { value: '₹10,000Cr', label: 'Lost to UPI fraud in 2023', sub: 'per RBI annual report' },
  { value: '55Cr+',     label: 'Active UPI users at risk',   sub: 'across India, every day' },
  { value: '<80ms',     label: 'Per-payment risk score',      sub: 'real-time engine' },
];

const steps = [
  { n: '01', title: 'Initiate Payment',  body: 'Enter recipient, amount and remarks — exactly as you do today in any UPI app.',       color: '#00FF87' },
  { n: '02', title: 'Engine Scores It',  body: 'Dozens of signals weighed simultaneously: trust score, amount, time, language cues.', color: '#00C96A' },
  { n: '03', title: 'Intelligent Gate',  body: 'LOW flows freely. MEDIUM warns. HIGH delays or blocks — every time with a reason.',    color: '#00FFB0' },
];

const riskLevels = [
  { level: 'LOW',    action: 'Allow',        desc: 'Trusted recipient · Regular amount · Clear memo',                   color: '#00FF87', bg: 'rgba(0,255,135,0.06)',  border: 'rgba(0,255,135,0.18)', dot: '#00FF87' },
  { level: 'MEDIUM', action: 'Warn & Delay', desc: 'First-time recipient · Unusual amount · Vague remarks',             color: '#F59E0B', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)', dot: '#F59E0B' },
  { level: 'HIGH',   action: 'Block',        desc: 'Flagged UPI ID · Late-night · "OTP" in remarks · Large sum',        color: '#F43F5E', bg: 'rgba(244,63,94,0.07)',  border: 'rgba(244,63,94,0.2)',  dot: '#F43F5E' },
];

/* ─── Mock transaction card (hero visual) ────────────────────── */
/* ─── Component ─────────────────────────────────────────────── */
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () =>
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="bg-[#040D0A] text-[#F0FFF4] overflow-x-hidden">

      {/* ════════════ HERO ════════════ */}
      <section className="relative w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <GridScan
            sensitivity={0.55}
            lineThickness={4}
            linesColor="#11ff00"
            scanColor="#a5ff9e"
            scanOpacity={0.4}
            gridScale={0.02}
            lineStyle="solid"
            lineJitter={0.04}
            scanDirection="pingpong"
            noiseIntensity={0.01}
            scanGlow={0.1}
            scanSoftness={1.2}
            scanDuration={2}
            scanDelay={2}
            scanOnClick={false}
          />
        </div>
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(4,13,10,0.12) 0%, rgba(4,13,10,0.05) 45%, rgba(4,13,10,0.55) 80%, #040D0A 100%)' }}
        />

        <div className="relative z-20 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center py-20">
          <div className="flex flex-col items-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-7 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
              style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.35)', color: '#ffffff' }}
            >
              <ZapFill />
              <span>Intent-Aware UPI Fraud Prevention</span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF87', boxShadow: '0 0 6px #00FF87' }} />
              <span style={{ color: '#ffffff' }}>Live</span>
            </motion.div>

            <BlurText
              text="Stop Scams Before They Happen"
              delay={120}
              animateBy="words"
              direction="top"
              stepDuration={0.4}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tighter text-white justify-center"
            />

            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="mt-5 max-w-xs h-1 rounded-full mx-auto"
              style={{ background: 'linear-gradient(90deg, #00FF87, #00C96A, #00FFB0)' }}
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-lg sm:text-xl leading-relaxed max-w-xl"
              style={{ color: 'rgba(249,250,251,0.65)' }}
            >
              SecureFlow intercepts risky UPI payments in real time — analyzing intent,
              adding intelligent friction, and telling you <em className="not-italic font-semibold text-white">exactly</em> why.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.6 }}
              className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={() => navigate('/send')}
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-100"
                style={{
                  background: 'linear-gradient(135deg, #00A855 0%, #00FF87 55%, #00FFB0 100%)',
                  boxShadow: '0 0 48px rgba(0,255,135,0.45), 0 2px 0 rgba(255,255,255,0.12) inset',
                  color: '#040D0A',
                }}
              >
                <LockIcon />
                Try Live Demo
                <ArrowRight />
              </button>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-105"
                style={{ background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.18)', color: 'rgba(0,255,135,0.85)', backdropFilter: 'blur(10px)' }}
              >
                How it works
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.15, duration: 0.5 }}
              className="mt-7 flex flex-wrap justify-center gap-2"
            >
              {['No login required', '3 risk levels', 'Real-time · <80ms', 'Open source'].map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium"
                  style={{ background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.12)', color: 'rgba(0,255,135,0.65)' }}
                >
                  <CheckIcon />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        <button
          onClick={scrollToFeatures}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: 'rgba(0,255,135,0.5)' }}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium">scroll</span>
          <span className="animate-bounce mt-0.5"><ChevronDown /></span>
        </button>
      </section>

      {/* ════════════ STATS BAR ════════════ */}
      <section style={{ borderTop: '1px solid rgba(0,255,135,0.07)', borderBottom: '1px solid rgba(0,255,135,0.07)', background: 'rgba(4,10,7,0.8)' }}>
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {stats.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="flex flex-col items-center sm:items-start gap-1.5 text-center sm:text-left sm:border-r last:border-r-0" style={{ borderColor: 'rgba(0,255,135,0.07)' }}>
                <span className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #00FF87 0%, #00C96A 40%, #00FFB0 100%)' }}>
                  {s.value}
                </span>
                <span className="text-sm font-semibold text-white">{s.label}</span>
                <span className="text-xs font-medium" style={{ color: 'rgba(82,140,100,0.9)' }}>{s.sub}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section ref={featuresRef} id="features" className="px-6 py-32 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,255,135,0.04) 0%, transparent 70%)' }} />
        <div className="max-w-6xl mx-auto relative">
          <FadeIn>
            <div className="text-center mb-20">
              <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#00FF87' }}>How SecureFlow works</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                Three layers of{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #00FF87, #00C96A, #00FFB0)' }}>
                  invisible armour
                </span>
              </h2>
              <p className="mt-5 text-lg text-[#5A8A70] max-w-xl mx-auto leading-relaxed">
                Running silently before every UPI confirmation — so you never lose money to a scam again.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.25 } }}
                  className="relative flex flex-col gap-6 p-8 rounded-3xl h-full cursor-default"
                  style={{ background: 'rgba(6,12,9,0.9)', border: '1px solid rgba(0,255,135,0.06)' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.border = `1px solid ${f.accent}50`;
                    el.style.boxShadow = `0 0 60px ${f.glow}, 0 1px 0 rgba(255,255,255,0.05) inset`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.border = '1px solid rgba(0,255,135,0.06)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div className="absolute top-0 left-8 right-8 h-px rounded-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${f.accent}60, transparent)` }} />
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${f.accent}14`, color: f.accent, border: `1px solid ${f.accent}30`, boxShadow: `0 0 20px ${f.accent}20` }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: f.accent }}>{f.label}</span>
                    <h3 className="mt-2 text-xl font-bold text-white leading-snug">{f.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(156,163,175,0.85)' }}>{f.desc}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section className="px-6 py-28" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(10,15,30,0.7) 50%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#00C96A' }}>The flow</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Every transaction in 3 acts</h2>
              <p className="mt-4 text-[#5A8A70] max-w-md mx-auto text-lg">Under 100ms total — imperceptible to you, impenetrable to fraudsters.</p>
            </div>
          </FadeIn>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="hidden md:block absolute top-[2.6rem] left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, #00FF8740 20%, #00C96A40 50%, #00FFB040 80%, transparent 100%)' }} />
            {steps.map((s, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.15}>
                <div className="relative flex flex-col gap-4 p-7 rounded-3xl h-full"
                  style={{ background: 'rgba(6,12,9,0.95)', border: '1px solid rgba(0,255,135,0.07)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black shrink-0 z-10"
                    style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}40` }}>
                    {s.n}
                  </div>
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(156,163,175,0.8)' }}>{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ RISK LEVELS ════════════ */}
      <section className="px-6 py-28">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#00FFB0' }}>Risk classification</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">What each risk level does</h2>
              <p className="mt-4 text-[#5A8A70] text-lg">Three responses, calibrated to the threat.</p>
            </div>
          </FadeIn>
          <div className="flex flex-col gap-3">
            {riskLevels.map((r, i) => (
              <FadeIn key={r.level} delay={i * 0.1}>
                <motion.div
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  className="flex items-center justify-between gap-6 px-6 py-5 rounded-2xl cursor-default"
                  style={{ background: r.bg, border: `1px solid ${r.border}` }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-2 h-2 rounded-full" style={{ background: r.dot, boxShadow: `0 0 8px ${r.dot}` }} />
                      <span className="w-[4.5rem] text-center text-xs font-black py-1.5 rounded-full"
                        style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}40` }}>
                        {r.level}
                      </span>
                    </div>
                    <span className="text-sm truncate" style={{ color: 'rgba(156,163,175,0.85)' }}>{r.desc}</span>
                  </div>
                  <span className="shrink-0 text-xs font-black px-3 py-1.5 rounded-xl"
                    style={{ background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}35` }}>
                    {r.action}
                  </span>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="px-6 pb-36 pt-4">
        <FadeIn>
          <div
            className="relative max-w-5xl mx-auto overflow-hidden rounded-[2rem] px-8 py-24 text-center flex flex-col items-center gap-8"
            style={{
              background: 'linear-gradient(135deg, rgba(0,201,106,0.08) 0%, rgba(0,255,135,0.06) 50%, rgba(0,229,204,0.09) 100%)',
              border: '1px solid rgba(0,255,135,0.2)',
            }}
          >
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(0,255,135,0.12) 0%, transparent 65%)' }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: '0 0 120px rgba(0,255,135,0.07) inset' }} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <div className="relative flex flex-col items-center gap-5">
              <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest"
                style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.25)', color: '#00FF87' }}>
                <ZapFill /> No account needed
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">Ready to try it?</h2>
              <p className="text-lg max-w-lg leading-relaxed" style={{ color: 'rgba(249,250,251,0.6)' }}>
                Send a test payment and watch SecureFlow intercept it in real time. Takes 30 seconds.
              </p>
            </div>
            <button
              onClick={() => navigate('/send')}
              className="relative inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-bold text-lg text-white transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-100"
              style={{
                background: 'linear-gradient(135deg, #00A855, #00FF87, #00FFB0)',
                boxShadow: '0 0 80px rgba(0,255,135,0.4), 0 2px 0 rgba(255,255,255,0.12) inset',
                color: '#040D0A',
              }}
            >
              <LockIcon />
              Open Live Demo
              <ArrowRight />
            </button>
          </div>
        </FadeIn>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer
        className="border-t px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
        style={{ borderColor: 'rgba(0,255,135,0.08)' }}
      >
        <span className="font-black tracking-tight" style={{ color: '#00FF87' }}>SecureFlow</span>
        <span style={{ color: 'rgba(75,85,99,0.9)' }}>Built for hackathon · Real-time UPI fraud prevention</span>
        <span style={{ color: 'rgba(75,85,99,0.9)' }}>© 2026</span>
      </footer>

    </div>
  );
};

export default Landing;
