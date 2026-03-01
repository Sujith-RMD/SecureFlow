import axios from 'axios';
import type { Transaction, User } from '../types';

// In dev, Vite proxies /api → localhost:5000 so BASE_URL can be empty.
// In production, set VITE_API_BASE_URL to your deployed backend URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getHistory = async (): Promise<Transaction[]> => {
  const res = await api.get<Transaction[]>('/api/history');
  return res.data;
};

export const getUser = async (): Promise<User> => {
  const res = await api.get<User>('/api/user');
  return res.data;
};

export const analyzeTransaction = async (payload: {
  recipientUPI: string;
  amount: number;
  remarks: string;
}) => {
  const res = await api.post('/api/analyze', payload);
  return res.data;
};

export const sendTransaction = async (payload: {
  recipientUPI: string;
  amount: number;
  remarks: string;
}) => {
  const res = await api.post('/api/send', payload);
  return res.data;
};

export interface DashboardStats {
  totalTransactions: number;
  flaggedCount: number;
  blockedCount: number;
  moneySaved: number;
  safeCount: number;
  securityScore: number;
  trustRate: number;
  avgRiskScore: number;
  totalAmount: number;
  recentTransactions: {
    id: string;
    to: string;
    name: string;
    amount: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    score: number;
    time: string;
  }[];
  riskDistribution: {
    low:    { count: number; pct: number };
    medium: { count: number; pct: number };
    high:   { count: number; pct: number };
  };
  topRules?: { ruleId: string; count: number }[];
  threatTrend?: number[];
  hourlyDistribution?: number[];
  rulesEvaluated?: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get<DashboardStats>('/api/dashboard-stats');
  return res.data;
};

export default api;
