// ─── Notification Types ───────────────────────────────────────────────────────
// Matches GET /notifications API response

export interface Notification {
  id: string;
  _id?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}
