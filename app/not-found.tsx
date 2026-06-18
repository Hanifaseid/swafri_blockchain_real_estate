import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-7 h-7 text-emerald-400" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-3">404</p>
        <h2 className="text-2xl font-light text-white mb-2 tracking-tight">Page not found</h2>
        <p className="text-sm text-white/45 mb-8 font-light">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    </div>
  );
}
