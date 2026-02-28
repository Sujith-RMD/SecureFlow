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

const statusConfig: Record<Transaction['status'], { label: string; cls: string }> = {
  completed: { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', cls: 'bg-[#9CA3AF]/10 text-[#9CA3AF] border-[#4B5563]' },
  blocked:   { label: 'Blocked',   cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

const leftBorderClass: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
  LOW:    'border-l-[3px] border-l-[#10B981]',
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
  <svg className="w-14 h-14 text-[#1E2D45]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
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

  useEffect(() => {
    getHistory()
      .then(setTransactions)
      .catch(() => setError('Failed to load transaction history.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) => {
    if (tab === 'safe')    return t.riskResult.level === 'LOW';
    if (tab === 'flagged') return t.riskResult.level === 'MEDIUM';
    if (tab === 'blocked') return t.status === 'blocked';
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        {/* ── Page heading ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
            Transaction History
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Review all your past UPI transactions and their risk assessments.
          </p>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-[#1E2D45] pb-4">
          {TABS.map(({ key, label }) => {
            const count =
              key === 'all'     ? transactions.length
              : key === 'safe'  ? transactions.filter(t => t.riskResult.level === 'LOW').length
              : key === 'flagged' ? transactions.filter(t => t.riskResult.level === 'MEDIUM').length
              : transactions.filter(t => t.status === 'blocked').length;

            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-[#3B82F6] text-white shadow-lg'
                    : 'bg-[#111827] text-[#9CA3AF] border border-[#1E2D45] hover:border-[#3B82F6]/50 hover:text-[#F9FAFB]'
                }`}
              >
                {label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-[#1E2D45] text-[#9CA3AF]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── States ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin" />
            <p className="text-[#9CA3AF] text-sm">Loading transactions…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <EmptyIcon />
            <p className="text-[#F9FAFB] font-semibold text-lg">No transactions found</p>
            <p className="text-[#9CA3AF] text-sm max-w-xs">
              {tab === 'all'
                ? 'You haven\'t made any transactions yet.'
                : `No ${tab} transactions to show.`}
            </p>
          </div>
        )}

        {/* ── Transaction list ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {/* Desktop column headers */}
            <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_32px] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[#4B5563]">
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
              const isHigh = txn.riskResult.level === 'HIGH';
              return (
                <div
                  key={txn.id}
                  className={`rounded-xl border border-[#1E2D45] bg-[#111827] overflow-hidden transition-all duration-200 hover:border-[#3B82F6]/30 ${isHigh ? 'bg-[#7F1D1D]/10' : ''} ${leftBorderClass[txn.riskResult.level]}`}
                >
                  {/* Main row */}
                  <button
                    className="w-full text-left"
                    onClick={() => toggleExpand(txn.id)}
                  >
                    {/* Desktop layout */}
                    <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_32px] items-center px-5 py-4 gap-3">
                      <span className="font-semibold text-[#F9FAFB] truncate">
                        {txn.recipientName}
                      </span>
                      <span className="text-[#9CA3AF] text-sm truncate font-mono">
                        {txn.recipientUPI}
                      </span>
                      <span className="font-bold text-[#F9FAFB]">
                        {formatAmount(txn.amount)}
                      </span>
                      <span className="text-[#9CA3AF] text-sm">
                        {formatDate(txn.timestamp)}
                      </span>
                      <span>
                        <RiskBadge level={txn.riskResult.level} score={txn.riskResult.score} />
                      </span>
                      <span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig[txn.status].cls}`}>
                          {statusConfig[txn.status].label}
                        </span>
                      </span>
                      <span className="text-[#4B5563] flex items-center justify-end">
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </span>
                    </div>

                    {/* Mobile layout */}
                    <div className="lg:hidden flex flex-col gap-3 px-4 py-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[#F9FAFB]">{txn.recipientName}</p>
                          <p className="text-xs text-[#9CA3AF] font-mono mt-0.5">{txn.recipientUPI}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#F9FAFB]">{formatAmount(txn.amount)}</p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">{formatDate(txn.timestamp)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <RiskBadge level={txn.riskResult.level} score={txn.riskResult.score} />
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig[txn.status].cls}`}>
                          {statusConfig[txn.status].label}
                        </span>
                        <span className="ml-auto text-[#4B5563]">
                          {isExpanded ? <ChevronUp /> : <ChevronDown />}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded risk reasons */}
                  {isExpanded && (
                    <div className="border-t border-[#1E2D45] px-5 py-4 bg-[#0A0F1E]/60">
                      {/* Remarks */}
                      {txn.remarks && (
                        <p className="text-sm text-[#9CA3AF] mb-4">
                          <span className="text-[#4B5563] font-medium">Remarks: </span>
                          {txn.remarks}
                        </p>
                      )}

                      {/* Risk reasons */}
                      {txn.riskResult.reasons.length === 0 ? (
                        <p className="text-sm text-[#4B5563]">No risk flags detected.</p>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-[#4B5563] mb-3">
                            Risk Flags Detected
                          </p>
                          <div className="flex flex-col gap-2">
                            {txn.riskResult.reasons.map((reason) => {
                              const sevColor =
                                reason.severity === 'HIGH'   ? 'text-red-400 border-red-500/30 bg-red-500/10'
                                : reason.severity === 'MEDIUM' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                                : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
                              return (
                                <div
                                  key={reason.ruleId}
                                  className="flex items-start gap-3 p-3 rounded-lg border border-[#1E2D45] bg-[#111827]"
                                >
                                  <span
                                    className={`mt-0.5 shrink-0 text-xs px-2 py-0.5 rounded-full border font-semibold ${sevColor}`}
                                  >
                                    {reason.severity}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#F9FAFB]">{reason.title}</p>
                                    <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">{reason.description}</p>
                                  </div>
                                  <span className="ml-auto shrink-0 text-xs text-[#4B5563] font-mono">
                                    +{reason.scoreAdded}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recommended action */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-[#9CA3AF]">
                        <span className="text-[#4B5563]">Recommended action:</span>
                        <span
                          className={`font-bold ${
                            txn.riskResult.recommendedAction === 'BLOCK'  ? 'text-red-400'
                            : txn.riskResult.recommendedAction === 'DELAY' ? 'text-amber-400'
                            : txn.riskResult.recommendedAction === 'WARN'  ? 'text-amber-300'
                            : 'text-emerald-400'
                          }`}
                        >
                          {txn.riskResult.recommendedAction}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
