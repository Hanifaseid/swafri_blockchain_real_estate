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
  // optional metadata used by getNotificationHref and other helpers
  metadata?: Record<string, unknown>;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

// ─── Query params for GET /notifications ─────────────────────────────────────
export interface NotificationsParams {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

// ─── getNotificationHref ─────────────────────────────────────────────────────
// Maps a notification type + metadata to the correct dashboard URL to navigate to.

export function getNotificationHref(notification: Notification): string | null {
  const meta = notification.metadata ?? {};

  switch (notification.type) {
    // Inquiries
    case 'inquiry.received':
    case 'inquiry.responded':
    case 'inquiry.updated':
      return '/inquiries';

    // Listings / properties
    case 'listing.approved':
    case 'listing.rejected':
    case 'listing.published':
    case 'listing.review':
      return meta.listingId ? `/properties/${meta.listingId}` : '/properties';

    // KYC
    case 'kyc.approved':
    case 'kyc.rejected':
    case 'kyc.submitted':
      return '/kyc';

    // Offers
    case 'offer.received':
    case 'offer.accepted':
    case 'offer.rejected':
    case 'offer.countered':
      return '/offers';

    // Wallet
    case 'wallet.linked':
    case 'wallet.unlinked':
      return '/kyc';

    // User account
    case 'account.suspended':
    case 'account.reactivated':
    case 'account.blocked':
      return '/settings';

    default:
      return null;
  }
}
