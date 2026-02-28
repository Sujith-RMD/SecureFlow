import React from 'react';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  score?: number;
}

const levelConfig = {
  LOW: {
    label: 'LOW',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  MEDIUM: {
    label: 'MEDIUM',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  HIGH: {
    label: 'HIGH',
    bg: 'bg-red-500/15',
    border: 'border-red-500/40',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
};

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score }) => {
  const cfg = levelConfig[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {score !== undefined && (
        <span className="opacity-70">· {score}</span>
      )}
    </span>
  );
};

export default RiskBadge;
