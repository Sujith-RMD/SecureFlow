import React, { useState, useRef, useEffect } from 'react';
import { analyzeTransaction, sendTransaction } from '../services/api';
import type { RiskResult } from '../types';

/* ═══════════════════════════════════════════════════
   PALETTE
═══════════════════════════════════════════════════ */
const P = {
  bg:       '#040D0A',
  card:     'rgba(10,20,15,0.65)',
  glass:    'blur(24px)',
  border:   'rgba(0,255,135,0.06)',
  borderHi: 'rgba(0,255,135,0.18)',
  accent:   '#00FF87',
  accentSoft: '#34D399',
  danger:   '#F87171',
  amber:    '#FBBF24',
  textH:    '#E8FFF1',
  textB:    '#9BB8A8',
  textM:    'rgba(0,255,135,0.35)',
};

type Step = 'form' | 'analyzing' | 'review' | 'sending' | 'success' | 'blocked';

/* ═══════════════════════════════════════════════════
   MINI ICONS
═══════════════════════════════════════════════════ */
const IconSend = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconShield = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const IconBlock = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const IconWarning = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconUser = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconRupee = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="4" x2="18" y2="4" />
    <line x1="6" y1="10" x2="18" y2="10" />
    <path d="M14 4a4 4 0 0 1 0 8H6l8 8" />
  </svg>
);
const IconNote = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

/* ═══════════════════════════════════════════════════
   RISK METER (mini radial)
═══════════════════════════════════════════════════ */
const RiskMeter: React.FC<{ score: number; level: string }> = ({ score, level }) => {
  const R = 38, CX = 50, CY = 50;
  const arcLen = Math.PI * R * 1.5; // 270°
  const filled = arcLen * (score / 100);
  const col = level === 'LOW' ? P.accent : level === 'MEDIUM' ? P.amber : P.danger;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const polar = (deg: number) => ({ x: CX + R * Math.cos(toRad(deg)), y: CY + R * Math.sin(toRad(deg)) });
  const s = polar(135), e = polar(45);
  const path = `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 1 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;

  return (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <path d={path} fill="none" stroke="rgba(0,255,135,0.07)" strokeWidth="6" strokeLinecap="round" />
      <path d={path} fill="none" stroke={col} strokeWidth="6" strokeLinecap="round"
        style={{ strokeDasharray: `${filled.toFixed(2)} ${(arcLen + 2).toFixed(2)}`, transition: 'stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x={CX} y={CY - 2} textAnchor="middle" fontSize="20" fontWeight="900" fill={col} style={{ fontFamily: 'inherit' }}>
        {score}
      </text>
      <text x={CX} y={CY + 12} textAnchor="middle" fontSize="7" fontWeight="800" fill={P.textM} style={{ fontFamily: 'inherit', letterSpacing: '2px' }}>
        {level}
      </text>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════
   COUNTDOWN TIMER
═══════════════════════════════════════════════════ */
const CountdownBar: React.FC<{ seconds: number; onDone: () => void }> = ({ seconds, onDone }) => {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onDone(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);
  const pct = ((seconds - left) / seconds) * 100;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
        <span style={{ color: P.amber }}>Cooling period</span>
        <span style={{ color: P.amber }}>{left}s remaining</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(251,191,36,0.1)' }}>
        <div className="h-full rounded-full" style={{
          width: `${pct}%`, background: P.amber, transition: 'width 1s linear',
        }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SHARED CARD WRAPPER
═══════════════════════════════════════════════════ */
const Card: React.FC<{ children: React.ReactNode; maxW?: string }> = ({ children, maxW = '480px' }) => (
  <div
    className="relative rounded-2xl p-6 sm:p-8 overflow-hidden"
    style={{
      maxWidth: maxW,
      width: '100%',
      background: P.card,
      backdropFilter: P.glass,
      border: `1px solid ${P.border}`,
      boxShadow: `0 0 60px rgba(0,255,135,0.04), 0 24px 48px rgba(0,0,0,0.5)`,
    }}
  >
    {/* Top shimmer line */}
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${P.accent}40, transparent)` }} />
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const SendMoney: React.FC = () => {
  const [step, setStep] = useState<Step>('form');
  const [upi, setUpi] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [error, setError] = useState('');
  const [cooldownDone, setCooldownDone] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setStep('form'); setUpi(''); setAmount(''); setRemarks('');
    setRisk(null); setError(''); setCooldownDone(false);
  };

  const handleAnalyze = async () => {
    setError('');
    if (!upi.trim() || !amount.trim()) {
      setError('Please fill in recipient UPI and amount.');
      return;
    }
    if (!upi.trim().includes('@')) {
      setError('Invalid UPI ID — must contain "@" (e.g. name@upi).');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid amount.'); return; }

    setStep('analyzing');
    try {
      const result = await analyzeTransaction({
        recipientUPI: upi.trim(),
        amount: amt,
        remarks: remarks.trim(),
      });
      setRisk(result);
      if (result.friction.type === 'BLOCK') {
        // Still persist the blocked transaction so it appears in history
        try {
          await sendTransaction({
            recipientUPI: upi.trim(),
            amount: amt,
            remarks: remarks.trim(),
          });
        } catch { /* best-effort persist */ }
        setStep('blocked');
      } else {
        setStep('review');
      }
    } catch {
      setError('Failed to analyze. Is the backend running?');
      setStep('form');
    }
  };

  const handleConfirm = async () => {
    setStep('sending');
    try {
      await sendTransaction({
        recipientUPI: upi.trim(),
        amount: parseFloat(amount),
        remarks: remarks.trim(),
      });
      setStep('success');
    } catch {
      setError('Transaction failed. Please try again.');
      setStep('review');
    }
  };

  const formatAmt = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? '₹0' : '₹' + n.toLocaleString('en-IN');
  };

  /* ─── Step indicator ─── */
  const steps = ['Details', 'Analysis', 'Confirm'];
  const stepIdx = step === 'form' ? 0 : step === 'analyzing' ? 1 : step === 'review' ? 1 : 2;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg }}>

      {/* ── Background grid effect ── */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(rgba(0,255,135,0.03) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pt-12 pb-20">

        {/* ── Page title ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(0,255,135,0.06)', border: `1px solid ${P.border}` }}>
            <IconSend />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: P.textM }}>
              Secure Transfer
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: P.textH }}>
            Send Money
          </h1>
          <p className="mt-2 text-sm" style={{ color: P.textB }}>
            Protected by real-time risk analysis
          </p>
        </div>

        {/* ── Step dots ── */}
        {(step === 'form' || step === 'analyzing' || step === 'review') && (
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <div className="w-8 h-px" style={{ background: i <= stepIdx ? P.accent : 'rgba(0,255,135,0.1)' }} />}
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{
                      background: i <= stepIdx ? 'rgba(0,255,135,0.15)' : 'rgba(0,255,135,0.04)',
                      color: i <= stepIdx ? P.accent : P.textM,
                      border: `1px solid ${i <= stepIdx ? 'rgba(0,255,135,0.3)' : 'rgba(0,255,135,0.08)'}`,
                    }}>
                    {i + 1}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold" style={{ color: i <= stepIdx ? P.textB : P.textM }}>
                    {s}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════
           STEP: FORM
        ══════════════════════════════════════════ */}
        {step === 'form' && (
          <Card>
            <div className="flex flex-col gap-5">
              {/* Recipient */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: P.textM }}>
                  <IconUser /> Recipient UPI
                </label>
                <input
                  type="text"
                  value={upi}
                  onChange={e => setUpi(e.target.value)}
                  placeholder="name@upi"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(0,255,135,0.03)',
                    border: `1px solid ${P.border}`,
                    color: P.textH,
                    caretColor: P.accent,
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,135,0.3)'}
                  onBlur={e => e.currentTarget.style.borderColor = P.border}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: P.textM }}>
                  <IconRupee /> Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: P.textM }}>₹</span>
                  <input
                    ref={amountRef}
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(0,255,135,0.03)',
                      border: `1px solid ${P.border}`,
                      color: P.textH,
                      caretColor: P.accent,
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,135,0.3)'}
                    onBlur={e => e.currentTarget.style.borderColor = P.border}
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: P.textM }}>
                  <IconNote /> Remarks <span className="font-normal lowercase tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="What's this for?"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200 resize-none"
                  style={{
                    background: 'rgba(0,255,135,0.03)',
                    border: `1px solid ${P.border}`,
                    color: P.textH,
                    caretColor: P.accent,
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,135,0.3)'}
                  onBlur={e => e.currentTarget.style.borderColor = P.border}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: P.danger }}>
                  <IconWarning />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleAnalyze}
                className="w-full py-3.5 rounded-xl text-sm font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: `linear-gradient(135deg, ${P.accent}, #00C96A)`,
                  color: '#040D0A',
                  boxShadow: `0 0 30px rgba(0,255,135,0.2), 0 4px 16px rgba(0,0,0,0.3)`,
                }}
              >
                <IconShield />
                Analyze & Send
              </button>

              <p className="text-center text-[10px]" style={{ color: P.textM }}>
                Transaction will be analyzed for fraud before processing
              </p>
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════
           STEP: ANALYZING (loading)
        ══════════════════════════════════════════ */}
        {step === 'analyzing' && (
          <Card>
            <div className="flex flex-col items-center gap-6 py-8">
              {/* Animated scanner ring */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: `${P.accent}30`, borderTopColor: P.accent }} />
                <div className="absolute inset-2 rounded-full border-2 border-b-transparent animate-spin"
                  style={{ borderColor: `${P.accent}15`, borderBottomColor: `${P.accent}60`, animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center" style={{ color: P.accent }}>
                  <IconShield />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: P.textH }}>Scanning Transaction</p>
                <p className="text-xs mt-1" style={{ color: P.textB }}>
                  Running risk analysis on {formatAmt(amount)} to {upi}
                </p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: P.accent, animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════
           STEP: REVIEW (risk results)
        ══════════════════════════════════════════ */}
        {step === 'review' && risk && (
          <Card maxW="520px">
            <div className="flex flex-col gap-5">

              {/* Transaction summary bar */}
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(0,255,135,0.03)', border: `1px solid ${P.border}` }}>
                <div>
                  <p className="text-xs font-medium" style={{ color: P.textM }}>To</p>
                  <p className="text-sm font-bold font-mono" style={{ color: P.textH }}>{upi}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium" style={{ color: P.textM }}>Amount</p>
                  <p className="text-lg font-black" style={{ color: P.textH }}>{formatAmt(amount)}</p>
                </div>
              </div>

              {/* Risk meter + level */}
              <div className="flex items-center gap-4">
                <RiskMeter score={risk.score} level={risk.level} />
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: P.textH }}>Risk Assessment</p>
                  <p className="text-xs mt-0.5" style={{ color: P.textB }}>
                    {risk.level === 'LOW' && 'This transaction appears safe.'}
                    {risk.level === 'MEDIUM' && 'Some risk signals detected. Please review.'}
                    {risk.level === 'HIGH' && 'High risk detected. Transaction requires caution.'}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black"
                    style={{
                      color: risk.level === 'LOW' ? P.accent : risk.level === 'MEDIUM' ? P.amber : P.danger,
                      background: risk.level === 'LOW' ? 'rgba(0,255,135,0.08)' : risk.level === 'MEDIUM' ? 'rgba(251,191,36,0.08)' : 'rgba(248,113,113,0.08)',
                      border: `1px solid ${risk.level === 'LOW' ? 'rgba(0,255,135,0.25)' : risk.level === 'MEDIUM' ? 'rgba(251,191,36,0.25)' : 'rgba(248,113,113,0.25)'}`,
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{ background: risk.level === 'LOW' ? P.accent : risk.level === 'MEDIUM' ? P.amber : P.danger }} />
                    {risk.level} RISK · ACTION: {risk.recommendedAction}
                  </div>
                </div>
              </div>

              {/* Risk reasons */}
              {risk.reasons.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: P.textM }}>
                    Risk Flags ({risk.reasons.length})
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {risk.reasons.map((r) => {
                      const sev = r.severity === 'HIGH' ? P.danger : r.severity === 'MEDIUM' ? P.amber : P.accent;
                      return (
                        <div key={r.ruleId} className="flex items-start gap-3 p-3 rounded-lg"
                          style={{ background: 'rgba(0,255,135,0.02)', border: `1px solid ${P.border}` }}>
                          <span className="mt-0.5 shrink-0 text-[9px] px-2 py-0.5 rounded-full font-black"
                            style={{ color: sev, background: `${sev}12`, border: `1px solid ${sev}30` }}>
                            {r.severity}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold" style={{ color: P.textH }}>{r.title}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: P.textB }}>{r.description}</p>
                          </div>
                          <span className="shrink-0 text-xs font-mono font-bold" style={{ color: sev }}>
                            +{r.scoreAdded}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Friction: countdown for DELAY type */}
              {risk.friction.type === 'DELAY' && !cooldownDone && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <IconWarning />
                    <p className="text-xs font-bold" style={{ color: P.amber }}>
                      Cooling period required — please wait before confirming.
                    </p>
                  </div>
                  <CountdownBar seconds={risk.friction.delaySeconds} onDone={() => setCooldownDone(true)} />
                </div>
              )}

              {/* Warning banner — only for MODAL (medium-risk) friction */}
              {risk.friction.type === 'MODAL' && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <span style={{ color: P.amber }}><IconWarning /></span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: P.amber }}>Proceed with caution</p>
                    <p className="text-[11px] mt-0.5" style={{ color: P.textB }}>
                      Potential risk signals were detected. Double-check the recipient before confirming.
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setStep('form'); setRisk(null); setError(''); setCooldownDone(false); }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: 'rgba(0,255,135,0.04)', border: `1px solid ${P.borderHi}`, color: P.textB }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={risk.friction.type === 'DELAY' && !cooldownDone}
                  className="flex-1 py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: risk.level === 'HIGH' ? `linear-gradient(135deg, ${P.amber}, #D97706)` : `linear-gradient(135deg, ${P.accent}, #00C96A)`,
                    color: '#040D0A',
                    boxShadow: risk.level === 'HIGH' ? '0 0 20px rgba(251,191,36,0.15)' : `0 0 20px rgba(0,255,135,0.15)`,
                  }}
                >
                  <IconSend />
                  Confirm & Send
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════
           STEP: SENDING
        ══════════════════════════════════════════ */}
        {step === 'sending' && (
          <Card>
            <div className="flex flex-col items-center gap-5 py-10">
              <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `${P.accent}30`, borderTopColor: P.accent }} />
              <p className="text-lg font-bold" style={{ color: P.textH }}>Processing Transfer</p>
              <p className="text-xs" style={{ color: P.textB }}>Sending {formatAmt(amount)} to {upi}…</p>
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════
           STEP: SUCCESS
        ══════════════════════════════════════════ */}
        {step === 'success' && (
          <Card>
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,255,135,0.08)', border: `2px solid ${P.accent}40`, color: P.accent }}>
                <IconCheck />
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: P.textH }}>Transfer Complete</p>
                <p className="text-sm mt-1" style={{ color: P.textB }}>
                  {formatAmt(amount)} sent to <span className="font-mono font-bold" style={{ color: P.accent }}>{upi}</span>
                </p>
              </div>

              {/* Receipt card */}
              <div className="w-full p-4 rounded-xl" style={{ background: 'rgba(0,255,135,0.03)', border: `1px solid ${P.border}` }}>
                <div className="flex flex-col gap-2 text-xs">
                  {[
                    ['Recipient', upi],
                    ['Amount', formatAmt(amount)],
                    ['Remarks', remarks || '—'],
                    ['Risk Score', `${risk?.score ?? 0} (${risk?.level ?? 'N/A'})`],
                    ['Status', 'Completed'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span style={{ color: P.textM }}>{k}</span>
                      <span className="font-semibold" style={{ color: P.textH }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={resetForm}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: `linear-gradient(135deg, ${P.accent}, #00C96A)`,
                  color: '#040D0A',
                  boxShadow: `0 0 20px rgba(0,255,135,0.15)`,
                }}
              >
                Send Another
              </button>
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════
           STEP: BLOCKED
        ══════════════════════════════════════════ */}
        {step === 'blocked' && risk && (
          <Card>
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(248,113,113,0.08)', border: `2px solid rgba(248,113,113,0.3)`, color: P.danger }}>
                <IconBlock />
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: P.textH }}>Transaction Blocked</p>
                <p className="text-sm mt-1" style={{ color: P.textB }}>
                  This transaction was blocked due to high risk (Score: {risk.score})
                </p>
              </div>

              {/* Risk reasons */}
              {risk.reasons.length > 0 && (
                <div className="w-full">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: P.textM }}>
                    Reasons
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {risk.reasons.map(r => (
                      <div key={r.ruleId} className="flex items-center gap-2 p-2 rounded-lg text-xs"
                        style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.1)' }}>
                        <span className="font-bold" style={{ color: P.danger }}>•</span>
                        <span style={{ color: P.textH }}>{r.title}</span>
                        <span className="ml-auto font-mono font-bold" style={{ color: P.danger }}>+{r.scoreAdded}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={resetForm}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: 'rgba(0,255,135,0.06)', border: `1px solid ${P.borderHi}`, color: P.textH }}
              >
                Go Back
              </button>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};

export default SendMoney;
