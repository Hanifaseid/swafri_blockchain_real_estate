'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-900/40 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-xl font-light text-white mb-2 tracking-tight">Something went wrong</h2>
        <p className="text-sm text-white/45 mb-6 font-light leading-relaxed">
          An unexpected error occurred. Please try again or contact support if the issue persists.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-white/25 mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
