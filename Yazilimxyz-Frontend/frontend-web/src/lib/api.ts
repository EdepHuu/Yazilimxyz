// src/lib/api.ts
import axios from 'axios';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  cfg.headers['Content-Type'] = 'application/json';
  return cfg;
});

export const ENDPOINTS = {
  MERCHANT_PROFILE: '/api/merchant/profile',
  LOGIN: process.env.NEXT_PUBLIC_LOGIN_ENDPOINT || '/api/Auth/login',
  REGISTER: process.env.NEXT_PUBLIC_REGISTER_ENDPOINT || '/api/Auth/register',
};
