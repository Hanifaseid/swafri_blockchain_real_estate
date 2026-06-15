import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getSession } from "@/lib/auth/session";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
}); 

// Attach auth token on every request
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 redirect
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
