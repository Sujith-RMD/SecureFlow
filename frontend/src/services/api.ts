import axios from 'axios';
import type { Transaction, User } from '../types';

const BASE_URL = 'http://localhost:5000';

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

export default api;
