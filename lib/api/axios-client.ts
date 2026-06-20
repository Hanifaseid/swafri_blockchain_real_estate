import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

import { getSession, setSession, clearSession } from "@/lib/auth/session";
import { ENDPOINTS } from "@/lib/api/endpoints";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuth?: boolean;
};

type RefreshResponse = {
  data?: {
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
    };
    accessToken?: string;
    refreshToken?: string;
  };
  accessToken?: string;
  refreshToken?: string;
};

const REFRESH_TOKEN_KEY = "vex_refresh_token";

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20_000,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setStoredRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function clearStoredRefreshToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function isRefreshEndpoint(url?: string): boolean {
  return Boolean(url && url.includes(ENDPOINTS.AUTH.REFRESH));
}

function forceLogout(): void {
  if (typeof window === "undefined") return;

  clearStoredRefreshToken();
  clearSession();

  document.cookie = "vex_authed=; path=/; max-age=0";
  document.cookie = "vex_user_role=; path=/; max-age=0";

  if (!window.location.pathname.includes("/auth/login")) {
    window.location.href = "/auth/login";
  }
}

function extractTokens(data: RefreshResponse) {
  const accessToken =
    data?.data?.tokens?.accessToken ??
    data?.data?.accessToken ??
    data?.accessToken;

  const refreshToken =
    data?.data?.tokens?.refreshToken ??
    data?.data?.refreshToken ??
    data?.refreshToken;

  return {
    accessToken,
    refreshToken,
  };
}

// ─── Request Interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.skipAuth) {
      return config;
    }

    const session = getSession();

    if (session?.token) {
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set("Authorization", `Bearer ${session.token}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Refresh Queue ────────────────────────────────────────────────────────────

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((pending) => {
    if (error) {
      pending.reject(error);
    } else if (token) {
      pending.resolve(token);
    } else {
      pending.reject(new Error("Token refresh failed without an error."));
    }
  });

  failedQueue = [];
}

// ─── Response Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    const shouldAttemptRefresh =
      status === 401 &&
      typeof window !== "undefined" &&
      !originalRequest._retry &&
      !originalRequest.skipAuth &&
      !isRefreshEndpoint(originalRequest.url);

    if (!shouldAttemptRefresh) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newAccessToken: string) => {
            originalRequest._retry = true;
            originalRequest.headers = AxiosHeaders.from(
              originalRequest.headers,
            );
            originalRequest.headers.set(
              "Authorization",
              `Bearer ${newAccessToken}`,
            );

            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const { data } = await apiClient.post<RefreshResponse>(
        ENDPOINTS.AUTH.REFRESH,
        { refreshToken },
        {
          skipAuth: true,
        },
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        extractTokens(data);

      if (!newAccessToken) {
        throw new Error("No access token in refresh response.");
      }

      setSession(newAccessToken);

      if (newRefreshToken) {
        setStoredRefreshToken(newRefreshToken);
      }

      originalRequest.headers = AxiosHeaders.from(originalRequest.headers);
      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

      processQueue(null, newAccessToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
