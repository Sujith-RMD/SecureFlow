import React, { useEffect, useState } from 'react';

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
const R = 76, CX = 100, CY = 102;
const toRad = (d: number) => (d * Math.PI) / 180;
const polar = (deg: number) => ({
  x: +(CX + R * Math.cos(toRad(deg))).toFixed(3),
  y: +(CY + R * Math.sin(toRad(deg))).toFixed(3),
});
const arcS = polar(135), arcE = polar(45);
const TRACK_PATH = `M ${arcS.x} ${arcS.y} A ${R} ${R} 0 1 1 ${arcE.x} ${arcE.y}`;
const ARC_LEN = (270 / 360) * 2 * Math.PI * R;

const SecurityMeter: React.FC<{ score: number }> = ({ score }) => {
  const display = useCountUp(score, 300, 1800);
  const [filled, setFilled] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setFilled(ARC_LEN * (score / 100)), 80);
    return () => clearTimeout(id);
  }, [score]);
  const col = score >= 75 ? '#00FF87' : score >= 50 ? '#FFB300' : '#FF4560';
  return (
    <svg viewBox="0 0 200 205" width="200" height="205" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Outer halo */}
      <path d={TRACK_PATH} fill="none" stroke="rgba(0,255,135,0.04)" strokeWidth="20" strokeLinecap="round" />
      {/* Track */}
      <path d={TRACK_PATH} fill="none" stroke="rgba(0,255,135,0.09)" strokeWidth="10" strokeLinecap="round" />
      {/* Filled arc */}
      <path
        d={TRACK_PATH}
        fill="none"
        stroke={col}
        strokeWidth="10"
        strokeLinecap="round"
        filter="url(#arc-glow)"
        style={{
          strokeDasharray: `${filled.toFixed(2)} ${(ARC_LEN + 2).toFixed(2)}`,
          transition: 'stroke-dasharray 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      {/* End dot */}
      <circle cx={arcS.x} cy={arcS.y} r="4" fill="rgba(0,255,135,0.18)" />
      {/* Score */}
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize="48" fontWeight="900" fill={col}
        style={{ fontFamily: 'inherit', filter: `drop-shadow(0 0 12px ${col}60)` }}>
        {display}
      </text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize="11" fontWeight="500"
        fill="rgba(0,255,135,0.3)" style={{ fontFamily: 'inherit', letterSpacing: '1px' }}>
        / 100
      </text>
      <text x={CX} y={CY + 34} textAnchor="middle" fontSize="8" fontWeight="800"
        fill="rgba(0,255,135,0.35)" style={{ fontFamily: 'inherit', letterSpacing: '4px' }}>
        SECURITY SCORE
      </text>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════
   SPARKLINE
═══════════════════════════════════════════════════ */
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const W = 80, H = 32;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - 4 - ((v - min) / range) * (H - 8),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const fill = `${line} L ${W} ${H} L 0 ${H} Z`;
  const uid = color.replace('#', '');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${uid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}80)` }} />
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
}> = ({ label, value, suffix = '', prefix = '', decimals = 0, delta, deltaUp, sparkData, color, delay = 0 }) => {
  const count = useCountUp(value, delay);
  const display = `${prefix}${decimals ? (count / 10 ** decimals).toFixed(1) : count.toLocaleString('en-IN')}${suffix}`;
  return (
    <div
      className="relative flex flex-col gap-2 p-5 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(6,18,12,0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}18`,
        boxShadow: `0 0 30px ${color}08, 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 ${color}10`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: `${color}65` }}>{label}</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            color: deltaUp ? '#00FF87' : '#FF4560',
            background: deltaUp ? 'rgba(0,255,135,0.07)' : 'rgba(255,69,96,0.07)',
          }}>
          {deltaUp ? '▲' : '▼'} {delta}
        </span>
      </div>
      <span className="text-3xl font-black leading-none"
        style={{ color, textShadow: `0 0 20px ${color}40` }}>
        {display}
      </span>
      <div className="mt-1">
        <Sparkline data={sparkData} color={color} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════ */
const TRANSACTIONS = [
  { id: 'TXN-8821', to: 'rahul@okaxis',    amount: 2500,  risk: 'LOW',    score: 12, time: '2s ago'  },
  { id: 'TXN-8820', to: 'unknown@paytm',   amount: 45000, risk: 'HIGH',   score: 91, time: '18s ago' },
  { id: 'TXN-8819', to: 'priya@upi',       amount: 800,   risk: 'LOW',    score: 8,  time: '34s ago' },
  { id: 'TXN-8818', to: 'new_recvr@ybl',   amount: 12000, risk: 'MEDIUM', score: 54, time: '1m ago'  },
  { id: 'TXN-8817', to: 'a.verma@okicici', amount: 500,   risk: 'LOW',    score: 5,  time: '2m ago'  },
  { id: 'TXN-8816', to: 'merchant@hdfc',   amount: 3000,  risk: 'LOW',    score: 18, time: '3m ago'  },
];
const RC: Record<string, string> = { LOW: '#00FF87', MEDIUM: '#FFB300', HIGH: '#FF4560' };

/* ═══════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const heroScreened = useCountUp(12847, 0,   1800);
  const heroBlocked  = useCountUp(234,   200, 1600);

  return (
    <div className="min-h-screen" style={{ background: '#040D0A' }}>

      {/* ── Sticky top bar ── */}
      <div
        className="sticky top-16 z-30 px-6 lg:px-10 py-4 flex items-center justify-between border-b"
        style={{
          background: 'rgba(4,13,10,0.97)',
          borderColor: 'rgba(0,255,135,0.07)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div>
          <h1 className="text-xl font-black tracking-tight" style={{ color: '#E8FFF1' }}>Overview</h1>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'rgba(0,255,135,0.38)' }}>
            Real-time fraud intelligence · SecureFlow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[10px] font-mono" style={{ color: 'rgba(0,255,135,0.28)' }}>
            28 Feb 2026 · 14:32:07
          </span>
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
            style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.18)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#00FF87', boxShadow: '0 0 6px #00FF87' }} />
            <span className="text-[11px] font-black tracking-widest" style={{ color: '#00FF87' }}>ENGINE LIVE</span>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto space-y-6">

        {/* ══ HERO — Security Score ══ */}
        <div
          className="relative overflow-hidden rounded-3xl p-7 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 items-center"
          style={{
            background: 'rgba(6,18,12,0.6)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(0,255,135,0.1)',
            boxShadow: '0 0 80px rgba(0,255,135,0.04), 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,255,135,0.08)',
          }}
        >
          {/* Ambient radial glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 45% 70% at 15% 50%, rgba(0,255,135,0.05) 0%, transparent 70%)',
          }} />

          {/* Radial meter */}
          <div className="flex justify-center lg:justify-start">
            <SecurityMeter score={87} />
          </div>

          {/* Score context */}
          <div className="space-y-3.5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black px-3 py-1 rounded-full"
                  style={{ background: 'rgba(0,255,135,0.1)', color: '#00FF87', border: '1px solid rgba(0,255,135,0.2)' }}>
                  EXCELLENT
                </span>
                <span className="text-[11px]" style={{ color: 'rgba(0,255,135,0.3)' }}>Updated 2s ago</span>
              </div>
              <h2 className="text-2xl font-black leading-snug" style={{ color: '#E8FFF1' }}>
                Your account is well protected
              </h2>
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'rgba(0,255,135,0.42)' }}>
                All three defence layers are operational. Fraud intelligence is active and no anomalies detected in the last 24h.
              </p>
            </div>
            {/* Sub-score bars */}
            {[
              { label: 'Behavioural Analysis',  pct: 94, color: '#00FF87'  },
              { label: 'Network Trust Score',   pct: 81, color: '#00FFB0'  },
              { label: 'Pattern Anomaly Guard', pct: 89, color: '#00C96A'  },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span style={{ color: 'rgba(0,255,135,0.5)' }}>{s.label}</span>
                  <span style={{ color: s.color }}>{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(0,255,135,0.07)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${s.pct}%`,
                    background: `linear-gradient(90deg, ${s.color}70, ${s.color})`,
                    boxShadow: `0 0 8px ${s.color}50`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats column */}
          <div className="flex flex-row lg:flex-col gap-6 justify-around lg:justify-start">
            {[
              { label: 'Screened',   value: heroScreened.toLocaleString('en-IN'), color: '#00FF87' },
              { label: 'Blocked',    value: heroBlocked.toLocaleString('en-IN'),  color: '#FF4560' },
              { label: 'Trust Rate', value: '97.8%',                              color: '#00FFB0' },
            ].map(q => (
              <div key={q.label} className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                  style={{ color: 'rgba(0,255,135,0.32)' }}>
                  {q.label}
                </p>
                <p className="text-2xl font-black"
                  style={{ color: q.color, textShadow: `0 0 20px ${q.color}40` }}>
                  {q.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ Stats row with sparklines ══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Txns Screened" value={12847}
            delta="2.3%" deltaUp={true}
            sparkData={[60, 72, 65, 80, 78, 90, 95, 88, 100, 97, 108, 115]}
            color="#00FF87" delay={0}
          />
          <StatCard
            label="Threats Blocked" value={234}
            delta="3 less" deltaUp={false}
            sparkData={[30, 45, 20, 55, 35, 60, 40, 30, 25, 45, 20, 15]}
            color="#FF4560" delay={100}
          />
          <StatCard
            label="Avg Risk Score" value={184} decimals={1}
            delta="0.4pts" deltaUp={false}
            sparkData={[25, 22, 28, 20, 19, 22, 18, 20, 17, 18, 19, 18]}
            color="#00FFB0" delay={200}
          />
          <StatCard
            label="Trust Rate" value={978} decimals={1} suffix="%"
            delta="0.2%" deltaUp={true}
            sparkData={[95, 96, 95.5, 97, 96.8, 97.2, 97, 97.5, 97.8, 98, 97.9, 97.8]}
            color="#00C96A" delay={300}
          />
        </div>

        {/* ══ Main grid ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Live transaction feed */}
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{
              background: 'rgba(6,18,12,0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,255,135,0.07)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0,255,135,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: '#00FF87' }}>
                Live Transactions
              </h2>
              <span
                className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(0,255,135,0.07)',
                  color: 'rgba(0,255,135,0.7)',
                  border: '1px solid rgba(0,255,135,0.12)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF87' }} />
                LIVE
              </span>
            </div>

            {/* Column headers */}
            <div
              className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-3 pb-2 mb-1 text-[10px] font-black uppercase tracking-[0.18em] border-b"
              style={{ color: 'rgba(0,255,135,0.22)', borderColor: 'rgba(0,255,135,0.05)' }}
            >
              <span>Recipient</span>
              <span className="text-right">Amount</span>
              <span className="text-center">Risk</span>
              <span className="text-right w-24">Score</span>
              <span className="text-right">Time</span>
            </div>

            {TRANSACTIONS.map((tx, i) => {
              const rc = RC[tx.risk];
              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center px-3 py-3.5 transition-colors duration-150"
                  style={{
                    borderBottom: i < TRANSACTIONS.length - 1 ? '1px solid rgba(0,255,135,0.04)' : 'none',
                    borderLeft: tx.risk !== 'LOW' ? `2px solid ${rc}55` : '2px solid transparent',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,255,135,0.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                      style={{ background: `${rc}14`, color: rc }}
                    >
                      {tx.to[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#C8F5DC' }}>{tx.to}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'rgba(0,255,135,0.28)' }}>{tx.id}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black" style={{ color: '#E8FFF1' }}>
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: `${rc}14`, color: rc, border: `1px solid ${rc}25` }}
                  >
                    {tx.risk}
                  </span>
                  <div className="w-24 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,255,135,0.07)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${tx.score}%`,
                          background: `linear-gradient(90deg, ${rc}70, ${rc})`,
                          boxShadow: `0 0 6px ${rc}50`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono shrink-0 w-5 text-right" style={{ color: rc }}>{tx.score}</span>
                  </div>
                  <span className="text-[11px] font-mono text-right" style={{ color: 'rgba(0,255,135,0.32)' }}>
                    {tx.time}
                  </span>
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
                background: 'rgba(6,18,12,0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,255,135,0.07)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0,255,135,0.05)',
              }}
            >
              <h2 className="text-[10px] font-black uppercase tracking-[0.22em] mb-5" style={{ color: '#00FF87' }}>
                Risk Distribution
              </h2>
              {[
                { label: 'LOW',    pct: 78, count: '9,980', color: '#00FF87' },
                { label: 'MEDIUM', pct: 15, count: '1,927', color: '#FFB300' },
                { label: 'HIGH',   pct: 7,  count: '900',   color: '#FF4560' },
              ].map(r => (
                <div key={r.label} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-black" style={{ color: r.color }}>{r.label}</span>
                    <div>
                      <span className="text-xs font-black" style={{ color: `${r.color}cc` }}>{r.pct}%</span>
                      <span className="text-[10px] ml-1.5 font-mono" style={{ color: `${r.color}50` }}>{r.count}</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,255,135,0.05)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.pct}%`,
                        background: `linear-gradient(90deg, ${r.color}55, ${r.color})`,
                        boxShadow: `0 0 10px ${r.color}50`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Engine health */}
            <div
              className="rounded-2xl p-5 flex-1"
              style={{
                background: 'rgba(6,18,12,0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,255,135,0.07)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0,255,135,0.05)',
              }}
            >
              <h2 className="text-[10px] font-black uppercase tracking-[0.22em] mb-4" style={{ color: '#00FF87' }}>
                Engine Health
              </h2>
              {[
                { key: 'Risk Engine',    latency: '2ms'  },
                { key: 'Friction Layer', latency: '1ms'  },
                { key: 'ML Classifier',  latency: '14ms' },
                { key: 'Stats Engine',   latency: '3ms'  },
              ].map(s => (
                <div
                  key={s.key}
                  className="flex items-center justify-between py-2.5 border-b last:border-0"
                  style={{ borderColor: 'rgba(0,255,135,0.05)' }}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#9DD4B2' }}>{s.key}</p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(0,255,135,0.28)' }}>
                      latency {s.latency}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#00FF87', boxShadow: '0 0 5px #00FF87' }} />
                    <span className="text-[10px] font-black" style={{ color: '#00FF87' }}>Operational</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}