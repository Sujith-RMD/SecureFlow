import React from "react";

const StatCard = ({ label, value, delta, color }: { label: string; value: string; delta?: string; color: string }) => (
  <div
    className="flex flex-col gap-3 p-6 rounded-2xl relative overflow-hidden"
    style={{ background: 'rgba(6,14,10,0.95)', border: `1px solid ${color}22` }}
  >
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
    <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: `${color}99` }}>{label}</p>
    <span className="text-4xl font-black" style={{ color }}>{value}</span>
    {delta && <span className="text-xs font-semibold" style={{ color: `${color}80` }}>{delta}</span>}
  </div>
);

export default function Dashboard() {
  return (
    <div className="min-h-screen" style={{ background: '#040D0A' }}>

      {/* ── Top Bar ── */}
      <div
        className="sticky top-16 z-30 px-8 py-4 flex items-center justify-between border-b"
        style={{ background: 'rgba(4,13,10,0.97)', borderColor: 'rgba(0,255,135,0.08)', backdropFilter: 'blur(8px)' }}
      >
        <div>
          <h1 className="text-2xl font-black text-[#E8FFF1] tracking-tight">Overview</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(0,255,135,0.45)' }}>Real-time fraud intelligence · SecureFlow</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF87', boxShadow: '0 0 6px #00FF87' }} />
          <span className="text-xs font-semibold" style={{ color: '#00FF87' }}>ENGINE LIVE</span>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard label="Transactions Screened" value="12,847" delta="↑2.3% vs last hour" color="#00FF87" />
          <StatCard label="Threats Blocked" value="234" delta="↘3 from baseline" color="#FF4560" />
          <StatCard label="Avg Risk Score" value="18.4" delta="Low-risk zone" color="#00E5CC" />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Activity Feed */}
          <div className="lg:col-span-2 rounded-2xl p-6 space-y-4" style={{ background: 'rgba(6,14,10,0.95)', border: '1px solid rgba(0,255,135,0.07)' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: '#00FF87' }}>Recent Transactions</h2>
              <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(0,255,135,0.07)', color: 'rgba(0,255,135,0.6)', border: '1px solid rgba(0,255,135,0.12)' }}>LIVE</span>
            </div>
            {[
              { id: 'TXN-8821', to: 'rahul@okaxis',   amount: '₹2,500',  risk: 'LOW',    score: 12, time: '2s ago' },
              { id: 'TXN-8820', to: 'unknown@paytm',  amount: '₹45,000', risk: 'HIGH',   score: 91, time: '18s ago' },
              { id: 'TXN-8819', to: 'priya@upi',      amount: '₹800',    risk: 'LOW',    score: 8,  time: '34s ago' },
              { id: 'TXN-8818', to: 'new_recvr@ybl',  amount: '₹12,000', risk: 'MEDIUM', score: 54, time: '1m ago' },
              { id: 'TXN-8817', to: 'friend@okicici', amount: '₹500',    risk: 'LOW',    score: 5,  time: '2m ago' },
            ].map(tx => {
              const riskColor = tx.risk === 'LOW' ? '#00FF87' : tx.risk === 'MEDIUM' ? '#FFB300' : '#FF4560';
              return (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(0,255,135,0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs" style={{ background: `${riskColor}14`, color: riskColor }}>
                      {tx.risk[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#C8F5DC' }}>{tx.to}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'rgba(0,255,135,0.35)' }}>{tx.id} · {tx.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black" style={{ color: '#E8FFF1' }}>{tx.amount}</span>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: `${riskColor}14`, color: riskColor, border: `1px solid ${riskColor}30` }}>
                      {tx.risk}
                    </span>
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,255,135,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: `${tx.score}%`, background: riskColor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Risk Distribution */}
          <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: 'rgba(6,14,10,0.95)', border: '1px solid rgba(0,255,135,0.07)' }}>
            <h2 className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: '#00FF87' }}>Risk Distribution</h2>
            {[
              { label: 'LOW',    pct: 78, color: '#00FF87' },
              { label: 'MEDIUM', pct: 15, color: '#FFB300' },
              { label: 'HIGH',   pct: 7,  color: '#FF4560' },
            ].map(r => (
              <div key={r.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span style={{ color: r.color }}>{r.label}</span>
                  <span style={{ color: `${r.color}99` }}>{r.pct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(0,255,135,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: `linear-gradient(90deg, ${r.color}99, ${r.color})`, boxShadow: `0 0 8px ${r.color}60` }} />
                </div>
              </div>
            ))}

            <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(0,255,135,0.06)' }}>
              <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'rgba(0,255,135,0.4)' }}>Engine Health</p>
              {[
                { key: 'Risk Engine',    status: 'Operational' },
                { key: 'Friction Layer', status: 'Operational' },
                { key: 'ML Classifier', status: 'Operational' },
              ].map(s => (
                <div key={s.key} className="flex justify-between items-center py-2">
                  <span className="text-xs" style={{ color: 'rgba(200,245,220,0.6)' }}>{s.key}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: '#00FF87' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00FF87', boxShadow: '0 0 4px #00FF87' }} />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}