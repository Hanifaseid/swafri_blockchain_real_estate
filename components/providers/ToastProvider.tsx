'use client';

import { Toaster } from 'react-hot-toast';

/**
 * ToastProvider — mounts the react-hot-toast Toaster with project defaults.
 *
 * Position: bottom-right — doesn't overlap the sidebar or main content.
 * Duration: 4 seconds for success, 6 seconds for errors.
 * Max visible: 3 — prevents toast stacking on bulk operations.
 *
 * Usage anywhere in the app:
 *   import toast from 'react-hot-toast'
 *   toast.success('Listing created!')
 *   toast.error('Something went wrong.')
 */

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      gutter={8}
      toastOptions={{
        // Shared defaults
        className: 'text-sm font-medium shadow-lg',
        style: {
          background: '#fff',
          color: '#111827',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '12px 16px',
          maxWidth: '380px',
        },

        // Success
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },

        // Error — longer so the user has time to read it
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },

        // Loading (used with toast.promise)
        loading: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
