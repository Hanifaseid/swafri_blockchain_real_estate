import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getSession, clearSession } from '@/lib/auth/session';

// ─── Axios Instance ───────────────────────────────────────────────────────────
// Base client for all real API calls.
// While running with mock services, this client is not used directly —
// mock service functions return Promise<T> without hitting the network.
// When the backend is ready, replace mock service calls with apiClient calls.

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
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
// Handles global error cases:
//   401 → session expired, clear session, redirect to login
//   403 → forbidden, the user does not have permission

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        // Token expired or invalid — clear session and send to login
        clearSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
