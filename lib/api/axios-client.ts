import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getSession, clearSession } from '@/lib/auth/session';

// ─── Axios Instance ───────────────────────────────────────────────────────────
// Base URL is injected from NEXT_PUBLIC_API_URL in .env.local
// Confirmed: https://real-estate-management-backend-grl9.onrender.com/api/v1

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000, // 20s — Render free tier can be slow on cold start
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches the Bearer token on every outgoing request.

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const session = getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// 401 → token expired, clear session and redirect to login.

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearSession();
      // Clear auth cookies so proxy.ts also unblocks
      document.cookie = 'vex_authed=; path=/; max-age=0';
      document.cookie = 'vex_user_role=; path=/; max-age=0';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
