// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000,
};

export const ENDPOINTS = {
  transactions: '/api/transactions',
  alerts: '/api/alerts',
  actions: '/api/actions',
  health: '/health',
};
