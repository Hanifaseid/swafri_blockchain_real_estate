export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },

  USERS: {
    LIST: "/users",
    DETAIL: (id: string) => `/users/${id}`,
  },

  ROLES: {
    LIST: "/roles",
  },

  DASHBOARD: {
    STATS: "/dashboard/stats",
  },
} as const;