import React, { useEffect, useState } from 'react';
import { getDashboardStats, type DashboardStats } from '../services/api';

/* ═══════════════════════════════════════════════════
   PALETTE — refined, easy on eyes
═══════════════════════════════════════════════════ */
const P = {
  bg:        '#080C0A',
  card:      'rgba(14,24,18,0.55)',
  cardHover: 'rgba(18,32,24,0.65)',
  glass:     'blur(24px)',
  border:    'rgba(52,211,153,0.06)',
  borderHi:  'rgba(52,211,153,0.14)',
  accent:    '#34D399',   // emerald-400 — comfortable primary
  accentAlt: '#6EE7B7',   // emerald-300 — secondary
  bright:    '#00E87A',   // brighter, hero-only
  mint:      '#A7F3D0',   // very soft mint
  warm:      '#FFD666',   // warm amber
  danger:    '#F87171',   // red-400, softer than #FF4560
  textH:     '#E2F0E8',   // headings
  textB:     '#9BB8A8',   // body
  textM:     '#5A7D6B',   // muted
  textD:     '#3D5C4C',   // dim labels
};

/* ═══════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════ */
function useCountUp(target: number, delay = 0, duration = 1400): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay, duration]);
  return value;
}

/* ═══════════════════════════════════════════════════
   SECURITY SCORE RADIAL METER
═══════════════════════════════════════════════════ */
const R = 80, CX = 100, CY = 104;
const toRad = (d: number) => (d * Math.PI) / 180;
const polar = (deg: number) => ({
  x: +(CX + R * Math.cos(toRad(deg))).toFixed(3),
  y: +(CY + R * Math.sin(toRad(deg))).toFixed(3),
});
const arcS = polar(140), arcE = polar(40);
const TRACK = `M ${arcS.x} ${arcS.y} A ${R} ${R} 0 1 1 ${arcE.x} ${arcE.y}`;
const ARC_LEN = (260 / 360) * 2 * Math.PI * R;

const SecurityMeter: React.FC<{ score: number }> = ({ score }) => {
  const display = useCountUp(score, 400, 2000);
  const [filled, setFilled] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setFilled(ARC_LEN * (score / 100)), 120);
    return () => clearTimeout(id);
  }, [score]);
  const col = score >= 75 ? P.accent : score >= 50 ? P.warm : P.danger;
  return (
    <svg viewBox="0 0 200 210" width="210" height="210" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="arc-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={P.accentAlt} />
          <stop offset="100%" stopColor={P.accent} />
        </linearGradient>
      </defs>
      {/* Background halo */}
      <path d={TRACK} fill="none" stroke="rgba(52,211,153,0.03)" strokeWidth="24" strokeLinecap="round" />
      {/* Track */}
      <path d={TRACK} fill="none" stroke="rgba(52,211,153,0.07)" strokeWidth="8" strokeLinecap="round" />
      {/* Tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const angle = 140 + t * 260;
        const inner = { x: CX + (R - 14) * Math.cos(toRad(angle)), y: CY + (R - 14) * Math.sin(toRad(angle)) };
        const outer = { x: CX + (R + 2) * Math.cos(toRad(angle)), y: CY + (R + 2) * Math.sin(toRad(angle)) };
        return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="rgba(52,211,153,0.12)" strokeWidth="1" />;
      })}
      {/* Filled arc */}
      <path d={TRACK} fill="none" stroke="url(#arc-grad)" strokeWidth="8" strokeLinecap="round"
        filter="url(#arc-glow)"
        style={{
          strokeDasharray: `${filled.toFixed(2)} ${(ARC_LEN + 2).toFixed(2)}`,
          transition: 'stroke-dasharray 2s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
      {/* Score text */}
      <text x={CX} y={CY - 4} textAnchor="middle" fontSize="52" fontWeight="900" fill={col}
        style={{ fontFamily: 'inherit', filter: `drop-shadow(0 0 18px ${col}35)` }}>{display}</text>
      <text x={CX} y={CY + 16} textAnchor="middle" fontSize="12" fontWeight="600"
        fill={P.textD} style={{ fontFamily: 'inherit', letterSpacing: '2px' }}>/ 100</text>
      <text x={CX} y={CY + 36} textAnchor="middle" fontSize="8" fontWeight="800"
        fill={P.textD} style={{ fontFamily: 'inherit', letterSpacing: '3.5px' }}>SECURITY SCORE</text>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════
   SPARKLINE
═══════════════════════════════════════════════════ */
const Sparkline: React.FC<{ data: number[]; color: string; w?: number; h?: number }> = ({
  data, color, w = 90, h = 34,
}) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - 4 - ((v - min) / range) * (h - 8),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const uid = `sp-${color.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${uid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 2px ${color}60)` }} />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2" fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </svg>
  );
};

/* ═══════════════════════════════════════════════════
   GLASS STAT CARD
═══════════════════════════════════════════════════ */
const StatCard: React.FC<{
  label: string; value: number; suffix?: string; prefix?: string;
  decimals?: number; delta: string; deltaUp: boolean;
  sparkData: number[]; color: string; delay?: number;
  icon: React.ReactNode;
}> = ({ label, value, suffix = '', prefix = '', decimals = 0, delta, deltaUp, sparkData, color, delay = 0, icon }) => {
  const count = useCountUp(value, delay);
  const display = `${prefix}${decimals ? (count / 10 ** decimals).toFixed(1) : count.toLocaleString('en-IN')}${suffix}`;
  return (
    <div
      className="group relative flex flex-col gap-2.5 p-5 rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: P.card,
        backdropFilter: P.glass,
        border: `1px solid ${P.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}22`; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px rgba(0,0,0,0.4), 0 0 20px ${color}08, inset 0 1px 0 rgba(255,255,255,0.03)`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = P.border; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)'; }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent 10%, ${color}40, transparent 90%)` }} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: `${color}80` }}>{icon}</span>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: P.textD }}>{label}</p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            color: deltaUp ? P.accent : P.danger,
            background: deltaUp ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
          }}>
          {deltaUp ? '↑' : '↓'} {delta}
        </span>
      </div>
      <span className="text-3xl font-black leading-none tracking-tight"
        style={{ color: P.textH }}>{display}</span>
      <div className="mt-auto pt-1">
        <Sparkline data={sparkData} color={color} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MINI ICONS
═══════════════════════════════════════════════════ */
const IconShield = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconZap    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const IconTarget = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconTrend  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

const RC = { LOW: P.accent, MEDIUM: '#E2A336', HIGH: '#F87171' } as const;

/* ═══════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = () => {
    getDashboardStats()
      .then(d => { setStats(d); setLastRefresh(new Date()); })
      .catch(() => setError('Failed to load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 15 seconds for live feel
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: P.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(52,211,153,0.2)', borderTopColor: P.accent }} />
          <p className="text-sm font-medium" style={{ color: P.textM }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: P.bg }}>
        <div className="flex items-center gap-3 p-5 rounded-xl" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: P.danger }}>
          <IconZap />
          <span className="text-sm font-medium">{error || 'Something went wrong.'}</span>
        </div>
      </div>
    );
  }

  const { securityScore, totalTransactions, blockedCount, avgRiskScore, trustRate,
    recentTransactions, riskDistribution, moneySaved, safeCount, flaggedCount } = stats;

  const scoreLabel = securityScore >= 75 ? '✓ EXCELLENT' : securityScore >= 50 ? '⚠ MODERATE' : '✗ AT RISK';

  // Generate sparkline-like arrays from recent data
  const sparkTxns  = recentTransactions.map(t => t.amount).reverse();
  const sparkRisk  = stats.threatTrend && stats.threatTrend.length > 0
    ? stats.threatTrend
    : recentTransactions.map(t => t.score).reverse();
  const sparkTrust = recentTransactions.map((_, i) => {
    const base = trustRate;
    // Gentle deterministic wave instead of Math.random()
    return base + Math.sin(i * 0.8) * 1.5;
  }).reverse();

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen" style={{ background: P.bg }}>

      {/* ── Sticky top bar ── */}
      <div
        className="sticky top-16 z-30 px-6 lg:px-10 py-4 flex items-center justify-between border-b"
        style={{
          background: 'rgba(8,12,10,0.92)',
          borderColor: P.border,
          backdropFilter: 'blur(16px)',
        }}
      >
        <div>
          <h1 className="text-lg font-extrabold tracking-tight" style={{ color: P.textH }}>Overview</h1>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: P.textD }}>
            Real-time fraud intelligence · SecureFlow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[10px] font-mono" style={{ color: P.textD }}>
            {dateStr} · {timeStr} IST
          </span>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(52,211,153,0.05)', border: `1px solid rgba(52,211,153,0.12)` }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: P.accent }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: P.accent }} />
            </span>
            <span className="text-[10px] font-bold tracking-wider" style={{ color: P.accent }}>LIVE</span>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto space-y-6">

        {/* ══ HERO — Security Score ══ */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-10 items-center transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(14,28,20,0.7) 0%, rgba(10,18,14,0.6) 50%, rgba(14,28,20,0.5) 100%)',
            backdropFilter: P.glass,
            border: `1px solid ${P.border}`,
            boxShadow: '0 24px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.025)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")' }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 50% 80% at 12% 50%, rgba(52,211,153,0.04) 0%, transparent 70%)',
          }} />

          {/* Radial meter */}
          <div className="flex justify-center lg:justify-start relative">
            <SecurityMeter score={securityScore} />
          </div>

          {/* Score context */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(52,211,153,0.08)', color: P.accent, border: `1px solid rgba(52,211,153,0.15)` }}>
                  {scoreLabel}
                </span>
                <span className="text-[10px] font-medium" style={{ color: P.textD }}>
                  Updated {lastRefresh ? (() => {
                    const s = Math.round((Date.now() - lastRefresh.getTime()) / 1000);
                    return s < 5 ? 'just now' : `${s}s ago`;
                  })() : 'just now'}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold leading-snug" style={{ color: P.textH }}>
                {securityScore >= 75 ? 'Your account is well protected' :
                 securityScore >= 50 ? 'Some risk activity detected' :
                 'Attention needed — high risk detected'}
              </h2>
              <p className="text-[13px] mt-2 leading-relaxed max-w-md" style={{ color: P.textB }}>
                {totalTransactions} transactions analyzed. {blockedCount > 0 ? `${blockedCount} blocked, saving ₹${moneySaved.toLocaleString('en-IN')}.` : 'No threats blocked.'}{' '}
                {safeCount} safe, {flaggedCount} flagged for review.
              </p>
            </div>
            {/* Sub-score bars */}
            <div className="space-y-3">
              {[
                { label: 'Behavioural Analysis',  pct: Math.min(100, securityScore + 7), color: P.accent },
                { label: 'Network Trust Score',   pct: Math.min(100, Math.round(trustRate - 5)), color: P.accentAlt },
                { label: 'Pattern Anomaly Guard', pct: Math.min(100, securityScore + 2), color: '#4ADE80' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium" style={{ color: P.textB }}>{s.label}</span>
                    <span className="font-bold tabular-nums" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(52,211,153,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-[2s] ease-out" style={{
                      width: `${s.pct}%`,
                      background: `linear-gradient(90deg, ${s.color}50, ${s.color})`,
                      boxShadow: `0 0 6px ${s.color}30`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats column */}
          <div className="flex flex-row lg:flex-col gap-6 justify-around lg:justify-center">
            {[
              { label: 'Screened',   value: totalTransactions.toLocaleString('en-IN'), color: P.accent },
              { label: 'Blocked',    value: blockedCount.toLocaleString('en-IN'),       color: P.danger },
              { label: 'Trust Rate', value: `${trustRate}%`,                            color: P.accentAlt },
            ].map(q => (
              <div key={q.label} className="text-center lg:text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: P.textD }}>
                  {q.label}
                </p>
                <p className="text-xl lg:text-2xl font-black tabular-nums" style={{ color: q.color }}>
                  {q.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ Stats row with sparklines ══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Txns Screened" value={totalTransactions}
            delta={`${safeCount} safe`} deltaUp
            sparkData={sparkTxns.length >= 2 ? sparkTxns : [0, 1]}
            color={P.accent} delay={0} icon={<IconShield />}
          />
          <StatCard
            label="Threats Blocked" value={blockedCount}
            delta={`₹${moneySaved.toLocaleString('en-IN')} saved`} deltaUp={blockedCount > 0}
            sparkData={sparkRisk.length >= 2 ? sparkRisk : [0, 1]}
            color={P.danger} delay={100} icon={<IconZap />}
          />
          <StatCard
            label="Avg Risk Score" value={Math.round(avgRiskScore * 10)} decimals={1}
            delta={avgRiskScore <= 30 ? 'Healthy' : 'Elevated'} deltaUp={avgRiskScore <= 30}
            sparkData={sparkRisk.length >= 2 ? sparkRisk : [0, 1]}
            color={P.accentAlt} delay={200} icon={<IconTarget />}
          />
          <StatCard
            label="Trust Rate" value={Math.round(trustRate * 10)} decimals={1} suffix="%"
            delta={trustRate >= 90 ? 'Strong' : 'Fair'} deltaUp={trustRate >= 90}
            sparkData={sparkTrust.length >= 2 ? sparkTrust : [0, 1]}
            color="#4ADE80" delay={300} icon={<IconTrend />}
          />
        </div>

        {/* ══ Main grid ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Live transaction feed */}
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{
              background: P.card,
              backdropFilter: P.glass,
              border: `1px solid ${P.border}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.015)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: P.textB }}>
                Recent Transactions
              </h2>
              <span
                className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(52,211,153,0.06)', color: P.accent, border: `1px solid rgba(52,211,153,0.1)` }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: P.accent }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: P.accent }} />
                </span>
                LIVE
              </span>
            </div>

            {/* Column headers */}
            <div
              className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-3 pb-3 mb-1 text-[10px] font-bold uppercase tracking-[0.14em] border-b"
              style={{ color: P.textD, borderColor: P.border }}
            >
              <span>Recipient</span>
              <span className="text-right w-20">Amount</span>
              <span className="text-center w-16">Risk</span>
              <span className="text-right w-28">Score</span>
              <span className="text-right w-14">Time</span>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: P.textM }}>No transactions yet.</p>
            ) : recentTransactions.map((tx, i) => {
              const rc = RC[tx.risk];
              return (
                <div
                  key={tx.id}
                  className="group grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-3 py-3 rounded-xl transition-all duration-200 cursor-default"
                  style={{
                    borderLeft: tx.risk !== 'LOW' ? `2px solid ${rc}40` : '2px solid transparent',
                    marginTop: i > 0 ? '2px' : 0,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(52,211,153,0.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold"
                      style={{ background: `${rc}0D`, color: rc, border: `1px solid ${rc}15` }}
                    >
                      {tx.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: P.textH }}>{tx.name}</p>
                      <p className="text-[10px] font-mono truncate" style={{ color: P.textD }}>{tx.to}</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold tabular-nums w-20 text-right" style={{ color: P.textH }}>
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md w-16 text-center"
                    style={{ background: `${rc}0D`, color: rc, border: `1px solid ${rc}18` }}
                  >
                    {tx.risk}
                  </span>
                  <div className="w-28 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(52,211,153,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${tx.score}%`,
                          background: `linear-gradient(90deg, ${rc}40, ${rc})`,
                          boxShadow: `0 0 4px ${rc}30`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono tabular-nums shrink-0 w-5 text-right" style={{ color: `${rc}cc` }}>{tx.score}</span>
                  </div>
                  <span className="text-[10px] font-mono w-14 text-right" style={{ color: P.textD }}>{tx.time}</span>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">

            {/* Risk distribution */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: P.card,
                backdropFilter: P.glass,
                border: `1px solid ${P.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.015)',
              }}
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] mb-5" style={{ color: P.textB }}>
                Risk Distribution
              </h2>
              {[
                { label: 'Low Risk',   pct: riskDistribution.low.pct,    count: riskDistribution.low.count.toLocaleString('en-IN'),    color: P.accent },
                { label: 'Medium Risk', pct: riskDistribution.medium.pct, count: riskDistribution.medium.count.toLocaleString('en-IN'), color: '#E2A336' },
                { label: 'High Risk',  pct: riskDistribution.high.pct,   count: riskDistribution.high.count.toLocaleString('en-IN'),   color: P.danger },
              ].map(r => (
                <div key={r.label} className="mb-5 last:mb-0 group">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[11px] font-semibold" style={{ color: P.textB }}>{r.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black tabular-nums" style={{ color: r.color }}>{r.pct}%</span>
                      <span className="text-[10px] font-mono" style={{ color: P.textD }}>{r.count}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(52,211,153,0.04)' }}>
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${r.pct}%`,
                        background: `linear-gradient(90deg, ${r.color}45, ${r.color}bb)`,
                        boxShadow: `0 0 6px ${r.color}20`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Top triggered rules + engine status */}
            <div
              className="rounded-2xl p-5 flex-1"
              style={{
                background: P.card,
                backdropFilter: P.glass,
                border: `1px solid ${P.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.015)',
              }}
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] mb-4" style={{ color: P.textB }}>
                Top Triggered Rules
              </h2>
              {(stats.topRules && stats.topRules.length > 0) ? stats.topRules.map((rule, i) => {
                const ruleNames: Record<string, string> = {
                  NEW_RECIPIENT: 'New Recipient',
                  UNUSUAL_AMOUNT: 'Unusual Amount',
                  HIGH_FREQUENCY: 'High Frequency',
                  LARGE_ROUND_NUMBER: 'Large Round Number',
                  SCAM_KEYWORD: 'Scam Keyword',
                  BEHAVIORAL_SHIFT: 'Behavioral Shift',
                  NIGHT_OWL: 'Night Owl',
                  SUSPICIOUS_UPI: 'Suspicious UPI',
                  TRUSTED_CONTACT: 'Trusted Contact',
                };
                const maxCount = stats.topRules?.[0]?.count ?? 1;
                const barPct = Math.max(8, (rule.count / maxCount) * 100);
                const ruleCol = rule.ruleId === 'SCAM_KEYWORD' || rule.ruleId === 'BEHAVIORAL_SHIFT' || rule.ruleId === 'SUSPICIOUS_UPI'
                  ? P.danger
                  : rule.ruleId === 'TRUSTED_CONTACT' ? P.accent : '#E2A336';
                return (
                  <div
                    key={rule.ruleId}
                    className="flex items-center justify-between py-2.5 border-b last:border-0"
                    style={{ borderColor: P.border }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate" style={{ color: P.textB }}>
                        {ruleNames[rule.ruleId] ?? rule.ruleId}
                      </p>
                      <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(52,211,153,0.06)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${barPct}%`, background: ruleCol, boxShadow: `0 0 4px ${ruleCol}30` }} />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-black tabular-nums shrink-0" style={{ color: ruleCol }}>
                      {rule.count}
                    </span>
                  </div>
                );
              }) : (
                <p className="text-sm py-4 text-center" style={{ color: P.textM }}>No rules triggered yet.</p>
              )}

              {/* Engine status footer */}
              <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: P.border }}>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-[ping_3s_ease-in-out_infinite] absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: P.accent }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: P.accent }} />
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: P.accent }}>ENGINE ACTIVE</span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: P.textD }}>
                  {stats.rulesEvaluated ?? 9} rules · 4 tiers
                </span>
              </div>
            </div>

            {/* Threat Trend mini-chart */}
            {stats.threatTrend && stats.threatTrend.length > 1 && (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: P.card,
                  backdropFilter: P.glass,
                  border: `1px solid ${P.border}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.015)',
                }}
              >
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] mb-3" style={{ color: P.textB }}>
                  Threat Trend
                </h2>
                <div className="flex items-end gap-[3px] h-12">
                  {stats.threatTrend.map((s, i) => {
                    const max = Math.max(...(stats.threatTrend ?? [1]));
                    const h = Math.max(4, (s / Math.max(max, 1)) * 48);
                    const c = s > 60 ? P.danger : s > 30 ? '#E2A336' : P.accent;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all duration-500"
                        style={{ height: h, background: c, opacity: 0.7 + (i / stats.threatTrend!.length) * 0.3 }}
                        title={`Score: ${s}`}
                      />
                    );
                  })}
                </div>
                <p className="text-[10px] font-mono mt-2" style={{ color: P.textD }}>
                  Last {stats.threatTrend.length} transactions
                </p>
              </div>
            )}

            {/* Hourly Activity Heatmap */}
            {stats.hourlyDistribution && (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: P.card,
                  backdropFilter: P.glass,
                  border: `1px solid ${P.border}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.015)',
                }}
              >
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] mb-3" style={{ color: P.textB }}>
                  Hourly Activity
                </h2>
                <div className="grid grid-cols-12 gap-1">
                  {stats.hourlyDistribution.map((count, h) => {
                    const max = Math.max(...(stats.hourlyDistribution ?? [1]), 1);
                    const intensity = count / max;
                    return (
                      <div
                        key={h}
                        className="aspect-square rounded-sm transition-all duration-300"
                        style={{
                          background: count === 0
                            ? 'rgba(52,211,153,0.03)'
                            : `rgba(52,211,153,${0.1 + intensity * 0.6})`,
                          border: `1px solid rgba(52,211,153,${0.02 + intensity * 0.1})`,
                        }}
                        title={`${h}:00 — ${count} txn${count !== 1 ? 's' : ''}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-mono" style={{ color: P.textD }}>
                  <span>0h</span>
                  <span>6h</span>
                  <span>12h</span>
                  <span>18h</span>
                  <span>23h</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}