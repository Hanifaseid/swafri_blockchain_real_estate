import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getSession, setSession, clearSession } from '@/lib/auth/session';
import { ENDPOINTS } from '@/lib/api/endpoints';

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

// ─── Silent Token Refresh ─────────────────────────────────────────────────────
// On 401, attempt to refresh the access token using the stored refresh token.
// Queues concurrent 401s so only one refresh request fires at a time.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((pending) => {
    if (error) {
      pending.reject(error);
    } else {
      pending.resolve(token!);
    }
  });
  failedQueue = [];
}

function forceLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('vex_refresh_token');
  clearSession();
  document.cookie = 'vex_authed=; path=/; max-age=0';
  document.cookie = 'vex_user_role=; path=/; max-age=0';
  window.location.href = '/auth/login';
}

// ─── Response Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 on client side, and skip if already retried or is the refresh call itself
    if (
      error.response?.status !== 401 ||
      typeof window === 'undefined' ||
      originalRequest._retry ||
      originalRequest.url === ENDPOINTS.AUTH.REFRESH
    ) {
      // Non-401 or server-side or refresh endpoint itself failed → reject immediately
      if (error.response?.status === 401 && typeof window !== 'undefined' && originalRequest.url === ENDPOINTS.AUTH.REFRESH) {
        forceLogout();
      }
      return Promise.reject(error);
    }

    // Check if we have a refresh token to use
    const refreshToken = localStorage.getItem('vex_refresh_token');
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken: string) => {
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    // Mark as refreshing and attempt token refresh
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const { data } = await apiClient.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });

      const newAccessToken: string = data?.data?.tokens?.accessToken ?? data?.data?.accessToken ?? data?.accessToken;
      const newRefreshToken: string = data?.data?.tokens?.refreshToken ?? data?.data?.refreshToken ?? data?.refreshToken;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }
      // Persist the refreshed access token only. User profile data stays in memory.
      setSession(newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('vex_refresh_token', newRefreshToken);
      }

      // Update auth header for the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Process queued requests with the new token
      processQueue(null, newAccessToken);

      // Retry the original request
      return apiClient(originalRequest);

    } catch (refreshError) {
      // Refresh failed — flush queue, force logout
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
