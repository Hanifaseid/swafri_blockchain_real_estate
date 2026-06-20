// ─── API Endpoints ────────────────────────────────────────────────────────────
// All route strings confirmed against the official API spec.
// Base URL: NEXT_PUBLIC_API_URL (set in .env.local)

export const ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    REGISTER:        '/auth/register',
    LOGIN:           '/auth/login',
    REFRESH:         '/auth/refresh-token',
    ME:              '/auth/me',
    LOGOUT:          '/auth/logout',
    LOGOUT_ALL:      '/auth/logout-all',
    SESSIONS:        '/auth/sessions',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD:  '/auth/reset-password',
    PROFILE:         '/auth/profile',        // PATCH — update name/phone
    WALLET_CHALLENGE:'/auth/wallet/challenge',
    WALLET_LINK:     '/auth/wallet/link',
    WALLET_UNLINK:   '/auth/wallet',         // DELETE
  },

  // ── KYC (self-service) ────────────────────────────────────────────────────
  KYC: {
    SUBMIT:      '/kyc/documents',
    ME:          '/kyc/me',
    DOC_URL:     (docId: string) => `/kyc/documents/${docId}/url`,
  },

  // ── Listings (owner + public) ─────────────────────────────────────────────
  LISTINGS: {
    CREATE:       '/listings',
    MINE:         '/listings/mine',
    DISCOVER:     '/listings',               // GET with query params
    CLUSTERS:     '/listings/clusters',
    DETAIL:       (id: string) => `/listings/${id}`,
    UPDATE:       (id: string) => `/listings/${id}`,
    DELETE:       (id: string) => `/listings/${id}`,
    TRANSITION:   (id: string) => `/listings/${id}/transition`,
    DASHBOARD:    '/listings/dashboard',
    ANALYTICS:    (id: string) => `/listings/${id}/analytics`,
    YIELD:        (id: string) => `/listings/${id}/yield`,
    MAINTENANCE:  (id: string) => `/listings/${id}/maintenance-records`,

    // Photos
    UPLOAD_PHOTOS:   (id: string) => `/listings/${id}/photos`,
    DELETE_PHOTO:    (id: string) => `/listings/${id}/photos`,
    REORDER_PHOTOS:  (id: string) => `/listings/${id}/photos/reorder`,
    SET_COVER:       (id: string) => `/listings/${id}/photos/cover`,

    // Ownership documents
    UPLOAD_DOCS:  (id: string) => `/listings/${id}/documents`,
    LIST_DOCS:    (id: string) => `/listings/${id}/documents`,
    DOC_URL:      (id: string, docId: string) => `/listings/${id}/documents/${docId}/url`,

    // Titles
    MINT_TITLE:    (id: string) => `/listings/${id}/mint-title`,
    GET_TITLE:     (id: string) => `/listings/${id}/title`,
    DISPUTE_TITLE: (id: string) => `/listings/${id}/title/dispute`,
    CLEAR_DISPUTE: (id: string) => `/listings/${id}/title/clear-dispute`,
    REVOKE_TITLE:  (id: string) => `/listings/${id}/title/revoke`,

    // Duplicates
    DUPLICATES: (id: string) => `/listings/${id}/duplicates`,

    // Rental Yield
    RENTAL_YIELD: (id: string) => `/listings/${id}/rental-yield`,
    DASHBOARD_YIELD: '/listings/dashboard/yield',

    // Maintenance Records
    // MAINTENANCE: (id: string) => `/listings/${id}/maintenance`,

    // Neighborhood Analytics
    NEIGHBORHOOD_ANALYTICS: '/listings/analytics/neighborhood',

    // Bulk Actions
    BULK_ACTIONS: '/listings/bulk',
  },

  // ── Favorites ─────────────────────────────────────────────────────────────
  FAVORITES: {
    LIST:   '/favorites',
    SAVE:   '/favorites',
    REMOVE: (listingId: string) => `/favorites/${listingId}`,
  },

  // ── Inquiries ─────────────────────────────────────────────────────────────
  INQUIRIES: {
    SEND:     '/inquiries',
    MINE:     '/inquiries/mine',
    RECEIVED: '/inquiries/received',
    UPDATE:   (id: string) => `/inquiries/${id}`,
    ADMIN:    '/inquiries/admin',
  },

  // ── Offers ────────────────────────────────────────────────────────────────
  OFFERS: {
    SUBMIT:   '/offers',
    MINE:     '/offers/mine',
    RECEIVED: '/offers/received',
    RESPOND:  (id: string) => `/offers/${id}/respond`,
    CANCEL:   (id: string) => `/offers/${id}/cancel`,
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    LIST:      '/notifications',
    READ_ALL:  '/notifications/read-all',
    READ_ONE:  (id: string) => `/notifications/${id}/read`,
  },

  // ── Saved Searches ────────────────────────────────────────────────────────
  SAVED_SEARCHES: {
    LIST:   '/saved-searches',
    CREATE: '/saved-searches',
    UPDATE: (id: string) => `/saved-searches/${id}`,
    DELETE: (id: string) => `/saved-searches/${id}`,
  },

  GEO: {
    GEOCODE: '/geo/geocode',
    REVERSE: '/geo/reverse',
    NEIGHBORHOODS: '/geo/neighborhoods',
    NEIGHBORHOOD_ANALYTICS: (id: string) => `/geo/neighborhoods/${id}/analytics`,
  },

  // ── Leases ────────────────────────────────────────────────────────────────
  LEASES: {
    CREATE:          '/leases',
    MINE:            '/leases/mine',
    DETAIL:          (id: string) => `/leases/${id}`,
    PROPOSE:         (id: string) => `/leases/${id}/propose`,
    SIGN:            (id: string) => `/leases/${id}/sign`,
    FUND:            (id: string) => `/leases/${id}/fund`,
    ACTIVATE:        (id: string) => `/leases/${id}/activate`,
    CANCEL:          (id: string) => `/leases/${id}/cancel`,
    COMPLETE:        (id: string) => `/leases/${id}/complete`,
    TERMINATE:       (id: string) => `/leases/${id}/terminate`,
    DISPUTE:         (id: string) => `/leases/${id}/dispute`,
    RESPOND_DISPUTE: (id: string) => `/leases/${id}/dispute/respond`,
    RESOLVE_DISPUTE: (id: string) => `/leases/${id}/dispute/resolve`,
    ESCROW:          (id: string) => `/leases/${id}/escrow`,
    TIMELINE:        (id: string) => `/leases/${id}/timeline`,
  },

  // ── Rental Applications ───────────────────────────────────────────────────
  RENTAL_APPS: {
    SUBMIT:      '/rental-applications',
    MINE:        '/rental-applications/mine',
    DETAIL:      (id: string) => `/rental-applications/${id}`,
    WITHDRAW:    (id: string) => `/rental-applications/${id}/withdraw`,
    REVIEW:      (id: string) => `/rental-applications/${id}/review`,
    SCREENING:   (id: string) => `/rental-applications/${id}/screening`,
    APPOINTMENT: (id: string) => `/rental-applications/${id}/appointment`,
    CREATE_LEASE:(id: string) => `/rental-applications/${id}/lease`,
  },

  // ── Purchase Transactions ─────────────────────────────────────────────────
  PURCHASES: {
    LIST:          '/purchase-transactions',
    DETAIL:        (id: string) => `/purchase-transactions/${id}`,
    UPDATE_STATUS: (id: string) => `/purchase-transactions/${id}/status`,
    FUND_ESCROW:   (id: string) => `/purchase-transactions/${id}/fund`,
    RELEASE_ESCROW:(id: string) => `/purchase-transactions/${id}/release`,
    REFUND_ESCROW: (id: string) => `/purchase-transactions/${id}/refund`,
    DISPUTE:       (id: string) => `/purchase-transactions/${id}/dispute`,
    RESOLVE_DISPUTE:(id: string) => `/purchase-transactions/${id}/dispute/resolve`,
  },

  // ── Admin — Users ─────────────────────────────────────────────────────────
  ADMIN: {
    // Users
    USERS:            '/admin/users',
    USER_DETAIL:      (id: string) => `/admin/users/${id}`,
    USER_STATUS:      (id: string) => `/admin/users/${id}/status`,   // PATCH — set any status
    USER_SUSPEND:     (id: string) => `/admin/users/${id}/suspend`,  // POST
    USER_REACTIVATE:  (id: string) => `/admin/users/${id}/reactivate`, // POST
    USER_BLOCK:       (id: string) => `/admin/users/${id}/block`,    // POST
    USER_KYC:         (id: string) => `/admin/users/${id}/kyc`,
    USER_KYC_REVIEW:  (id: string) => `/admin/users/${id}/kyc/review`,
    USER_KYC_DOC_URL: (id: string, docId: string) => `/admin/users/${id}/kyc/documents/${docId}/url`,
    USER_WALLET_REVOKE: (id: string) => `/admin/users/${id}/wallet/revoke`, // POST — Admin only

    // Admins — super_admin only
    ADMINS:           '/admin/admins',                               // GET list + POST create
    ADMIN_DETAIL:     (id: string) => `/admin/admins/${id}`,
    ADMIN_SUSPEND:    (id: string) => `/admin/admins/${id}/suspend`,
    ADMIN_REACTIVATE: (id: string) => `/admin/admins/${id}/reactivate`,

    // Listings review
    LISTINGS:         '/admin/listings',
    LISTINGS_STATS:   '/admin/listings/stats',
    DOC_REVIEW:       (listingId: string, docId: string) => `/listings/${listingId}/documents/${docId}/review`,

    // Compliance
    COMPLIANCE_CASES:    '/compliance/cases',
    COMPLIANCE_CASE:     (id: string) => `/compliance/cases/${id}`,
    COMPLIANCE_NOTES:    (id: string) => `/compliance/cases/${id}/notes`,
    COMPLIANCE_NOTE:     (id: string, noteId: string) => `/compliance/cases/${id}/notes/${noteId}`,
    SCREENINGS:          '/compliance/screenings',
    BROKER_LICENSES:     '/compliance/broker-licenses',
    BROKER_LICENSE:      (id: string) => `/compliance/broker-licenses/${id}/review`,

    // Chain transactions
    CHAIN_TXS:        '/chain-transactions',
    CHAIN_RECONCILE:  (id: string) => `/chain-transactions/${id}/reconcile`,
    CHAIN_STALE:      (id: string) => `/chain-transactions/${id}/mark-stale`,

    // Audit logs
    AUDIT_LOGS:       '/audit-logs',
  },

  // ── Health ───────────────────────────────────────────────────────────────────
  HEALTH: {
    LIVENESS:  '/health/live',
    READINESS: '/health/ready',
  },
} as const;
