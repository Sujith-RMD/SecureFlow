import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/api';
import type { Transaction } from '../types';
import RiskBadge from '../components/RiskBadge';

type FilterTab = 'all' | 'safe' | 'flagged' | 'blocked';

const formatAmount = (amount: number) =>
  '₹' + amount.toLocaleString('en-IN');

const formatDate = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const statusConfig: Record<
  Transaction['status'],
  { label: string; color: string; bg: string; border: string }
> = {
  completed: {
    label: 'Completed',
    color: '#00FF87',
    bg: 'rgba(0,255,135,0.08)',
    border: 'rgba(0,255,135,0.25)',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#9CA3AF',
    bg: 'rgba(156,163,175,0.07)',
    border: 'rgba(156,163,175,0.2)',
  },
  blocked: {
    label: 'Blocked',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
  },
};

const leftBorderStyle: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
  LOW:    'border-l-[3px] border-l-[#00FF87]',
  MEDIUM: 'border-l-[3px] border-l-[#F59E0B]',
  HIGH:   'border-l-[3px] border-l-[#EF4444]',
};

const ChevronDown = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ChevronUp = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const EmptyIcon = () => (
  <svg
    className="w-14 h-14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(0,255,135,0.15)"
    strokeWidth="1.4"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'safe',    label: 'Safe' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'blocked', label: 'Blocked' },
];

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = () => {
      getHistory()
        .then(setTransactions)
        .catch(() => setError('Failed to load transaction history. Is the backend running?'))
        .finally(() => setLoading(false));
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = transactions.filter((t) => {
    // Tab filter
    if (tab === 'safe'    && t.riskResult.level !== 'LOW') return false;
    if (tab === 'flagged' && t.riskResult.level !== 'MEDIUM') return false;
    if (tab === 'blocked' && t.status !== 'blocked' && t.riskResult.level !== 'HIGH') return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesName = t.recipientName.toLowerCase().includes(q);
      const matchesUPI = t.recipientUPI.toLowerCase().includes(q);
      const matchesAmount = t.amount.toString().includes(q);
      const matchesRemarks = t.remarks?.toLowerCase().includes(q);
      const matchesId = t.id.toLowerCase().includes(q);
      if (!matchesName && !matchesUPI && !matchesAmount && !matchesRemarks && !matchesId) return false;
    }

    return true;
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const counts = {
    all:     transactions.length,
    safe:    transactions.filter(t => t.riskResult.level === 'LOW').length,
    flagged: transactions.filter(t => t.riskResult.level === 'MEDIUM').length,
    blocked: transactions.filter(t => t.status === 'blocked' || t.riskResult.level === 'HIGH').length,
  };

  return (
    <div className="min-h-screen" style={{ background: '#040D0A' }}>

      {/* ── Sticky header ── */}
      <div
        className="sticky top-16 z-30 px-4 sm:px-6 lg:px-8 py-5 border-b"
        style={{
          background: 'rgba(4,13,10,0.97)',
          borderColor: 'rgba(0,255,135,0.07)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Page heading */}
          <div className="mb-4">
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ color: '#E8FFF1' }}
            >
              Transaction History
            </h1>
            <p className="mt-0.5 text-xs font-medium" style={{ color: 'rgba(0,255,135,0.4)' }}>
              {transactions.length} total transactions · SecureFlow audit trail
            </p>
          </div>

          {/* Filter tabs + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {TABS.map(({ key, label }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                    style={{
                      background: active ? 'rgba(0,255,135,0.12)' : 'transparent',
                      color: active ? '#00FF87' : 'rgba(0,255,135,0.38)',
                      border: active
                        ? '1px solid rgba(0,255,135,0.3)'
                        : '1px solid rgba(0,255,135,0.07)',
                    }}
                  >
                    {label}
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-black"
                      style={{
                        background: active ? 'rgba(0,255,135,0.15)' : 'rgba(0,255,135,0.05)',
                        color: active ? '#00FF87' : 'rgba(0,255,135,0.3)',
                      }}
                    >
                      {counts[key]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(0,255,135,0.3)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, UPI, amount…"
                className="pl-9 pr-8 py-2 rounded-lg text-xs font-medium outline-none transition-all w-full sm:w-64"
                style={{
                  background: 'rgba(0,255,135,0.04)',
                  border: '1px solid rgba(0,255,135,0.08)',
                  color: '#E8FFF1',
                  caretColor: '#00FF87',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,135,0.25)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,255,135,0.08)'}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ color: 'rgba(0,255,135,0.5)', background: 'rgba(0,255,135,0.06)' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(0,255,135,0.2)', borderTopColor: '#00FF87' }}
            />
            <p className="text-sm font-medium" style={{ color: 'rgba(0,255,135,0.4)' }}>
              Loading transactions…
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl text-sm"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.22)',
              color: '#FCA5A5',
            }}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <EmptyIcon />
            <div>
              <p className="text-base font-bold" style={{ color: 'rgba(0,255,135,0.4)' }}>
                No transactions found
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(0,255,135,0.2)' }}>
                {tab === 'all'
                  ? "You haven't made any transactions yet."
                  : `No ${tab} transactions to show.`}
              </p>
            </div>
          </div>
        )}

        {/* Transaction list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {/* Desktop column headers */}
            <div
              className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_32px] px-5 py-2 text-[10px] font-black uppercase tracking-[0.18em]"
              style={{ color: 'rgba(0,255,135,0.28)' }}
            >
              <span>Recipient</span>
              <span>UPI ID</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Risk</span>
              <span>Status</span>
              <span />
            </div>

            {filtered.map((txn) => {
              const isExpanded = expanded.has(txn.id);
              return (
                <div
                  key={txn.id}
                  className={`rounded-xl overflow-hidden transition-all duration-200 ${leftBorderStyle[txn.riskResult.level]}`}
                  style={{
                    background: 'rgba(6,14,10,0.95)',
                    border: '1px solid rgba(0,255,135,0.06)',
                    borderLeft: undefined, // let className handle the left border
                  }}
                >
                  {/* Main row */}
                  <button
                    className="w-full text-left group"
                    onClick={() => toggleExpand(txn.id)}
                    style={{ display: 'block' }}
                  >
                    {/* Desktop layout */}
                    <div
                      className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_32px] items-center px-5 py-4 gap-3 transition-colors duration-150"
                      style={{}}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,255,135,0.03)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}
                    >
                      <span className="font-semibold truncate" style={{ color: '#C8F5DC' }}>
                        {txn.recipientName}
                      </span>
                      <span className="text-sm truncate font-mono" style={{ color: 'rgba(0,255,135,0.38)' }}>
                        {txn.recipientUPI}
                      </span>
                      <span className="font-black" style={{ color: '#E8FFF1' }}>
                        {formatAmount(txn.amount)}
                      </span>
                      <span className="text-sm font-mono" style={{ color: 'rgba(0,255,135,0.45)' }}>
                        {formatDate(txn.timestamp)}
                      </span>
                      <span>
                        <RiskBadge level={txn.riskResult.level} score={txn.riskResult.score} />
                      </span>
                      <span>
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            color: statusConfig[txn.status].color,
                            background: statusConfig[txn.status].bg,
                            border: `1px solid ${statusConfig[txn.status].border}`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: statusConfig[txn.status].color }}
                          />
                          {statusConfig[txn.status].label}
                        </span>
                      </span>
                      <span
                        className="flex items-center justify-end"
                        style={{ color: 'rgba(0,255,135,0.25)' }}
                      >
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </span>
                    </div>

                    {/* Mobile layout */}
                    <div className="lg:hidden flex flex-col gap-3 px-4 py-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold" style={{ color: '#C8F5DC' }}>{txn.recipientName}</p>
                          <p className="text-xs font-mono mt-0.5" style={{ color: 'rgba(0,255,135,0.38)' }}>
                            {txn.recipientUPI}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black" style={{ color: '#E8FFF1' }}>{formatAmount(txn.amount)}</p>
                          <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(0,255,135,0.45)' }}>
                            {formatDate(txn.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <RiskBadge level={txn.riskResult.level} score={txn.riskResult.score} />
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            color: statusConfig[txn.status].color,
                            background: statusConfig[txn.status].bg,
                            border: `1px solid ${statusConfig[txn.status].border}`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: statusConfig[txn.status].color }}
                          />
                          {statusConfig[txn.status].label}
                        </span>
                        <span className="ml-auto" style={{ color: 'rgba(0,255,135,0.25)' }}>
                          {isExpanded ? <ChevronUp /> : <ChevronDown />}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded risk details */}
                  {isExpanded && (
                    <div
                      className="border-t px-5 py-4"
                      style={{
                        borderColor: 'rgba(0,255,135,0.07)',
                        background: 'rgba(4,11,8,0.8)',
                      }}
                    >
                      {/* Remarks */}
                      {txn.remarks && (
                        <p className="text-sm mb-4" style={{ color: 'rgba(0,255,135,0.5)' }}>
                          <span className="font-semibold" style={{ color: 'rgba(0,255,135,0.3)' }}>Remarks: </span>
                          <span style={{ color: '#9DD4B2' }}>{txn.remarks}</span>
                        </p>
                      )}

                      {/* Risk reasons */}
                      {txn.riskResult.reasons.length === 0 ? (
                        <p className="text-sm" style={{ color: 'rgba(0,255,135,0.25)' }}>
                          No risk flags detected.
                        </p>
                      ) : (
                        <div>
                          <p
                            className="text-[10px] font-black uppercase tracking-[0.18em] mb-3"
                            style={{ color: 'rgba(0,255,135,0.28)' }}
                          >
                            Risk Flags Detected
                          </p>
                          <div className="flex flex-col gap-2">
                            {txn.riskResult.reasons.map((reason) => {
                              const sevStyle =
                                reason.severity === 'HIGH'
                                  ? { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.22)' }
                                  : reason.severity === 'MEDIUM'
                                  ? { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.22)' }
                                  : { color: '#00FF87', bg: 'rgba(0,255,135,0.06)', border: 'rgba(0,255,135,0.2)' };
                              return (
                                <div
                                  key={reason.ruleId}
                                  className="flex items-start gap-3 p-3 rounded-lg"
                                  style={{
                                    background: 'rgba(6,14,10,0.9)',
                                    border: '1px solid rgba(0,255,135,0.06)',
                                  }}
                                >
                                  <span
                                    className="mt-0.5 shrink-0 text-[10px] px-2 py-0.5 rounded-full font-black"
                                    style={{
                                      color: sevStyle.color,
                                      background: sevStyle.bg,
                                      border: `1px solid ${sevStyle.border}`,
                                    }}
                                  >
                                    {reason.severity}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold" style={{ color: '#C8F5DC' }}>
                                      {reason.title}
                                    </p>
                                    <p
                                      className="text-xs mt-0.5 leading-relaxed"
                                      style={{ color: 'rgba(0,255,135,0.38)' }}
                                    >
                                      {reason.description}
                                    </p>
                                  </div>
                                  <span
                                    className="ml-auto shrink-0 text-xs font-mono font-bold"
                                    style={{ color: sevStyle.color }}
                                  >
                                    +{reason.scoreAdded}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recommended action */}
                      <div
                        className="mt-4 flex items-center gap-2 text-xs"
                        style={{ color: 'rgba(0,255,135,0.3)' }}
                      >
                        <span>Recommended action:</span>
                        <span
                          className="font-black"
                          style={{
                            color:
                              txn.riskResult.recommendedAction === 'BLOCK' ? '#EF4444'
                              : txn.riskResult.recommendedAction === 'WARN' ? '#F59E0B'
                              : '#00FF87',
                          }}
                        >
                          {txn.riskResult.recommendedAction}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Footer count */}
            <p
              className="text-center text-xs mt-6 font-medium"
              style={{ color: 'rgba(0,255,135,0.2)' }}
            >
              Showing {filtered.length} of {transactions.length} transactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
