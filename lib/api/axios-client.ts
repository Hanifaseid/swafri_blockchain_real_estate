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
    } else {
      console.warn('No token found in session for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// 401 → token expired, clear session and redirect to login.
// 403 → forbidden, handle gracefully without crashing.

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      // 401 - Unauthorized (invalid/expired token)
      if (error.response?.status === 401) {
        clearSession();
        // Clear auth cookies so proxy.ts also unblocks
        document.cookie = 'vex_authed=; path=/; max-age=0';
        document.cookie = 'vex_user_role=; path=/; max-age=0';
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // 403 - Forbidden (authenticated but not authorized)
      if (error.response?.status === 403) {
        console.warn('403 Forbidden for URL:', error.config?.url);
        console.warn('User may not have permission for this resource');
        
        // Don't clear session - user is authenticated, just lacks permissions
        
        // For offers/mine endpoint, return empty array instead of error
        // This prevents the app from crashing
        if (error.config?.url?.includes('/offers/mine')) {
          console.log('Returning empty offers array for 403 on /offers/mine');
          // @ts-ignore - we're transforming the response
          return Promise.resolve({ 
            data: [], 
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          });
        }
      }
    }
    
    return Promise.reject(error);
  }
);