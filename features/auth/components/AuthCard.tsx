import { cn } from '@/lib/utils';

// ─── AuthCard ─────────────────────────────────────────────────────────────────
// Glass card wrapper used by LoginForm and RegisterForm.
// Matches the existing auth/page.tsx dark glass style.

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  /** Small version label shown in the top-right corner */
  version?: string;
}

export function AuthCard({ children, className, version = 'v1.0' }: AuthCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-white/15 bg-zinc-950/40 backdrop-blur-xl shadow-2xl overflow-hidden',
        className
      )}
    >
      {/* Corner version badge */}
      <div className="absolute top-0 right-0 bg-white/5 border-b border-l border-white/10 px-2.5 py-1.5 text-[9px] font-mono text-white/40 select-none">
        SWAFIR-AUTH {version}
      </div>

      {/* Glass shimmer border effect — same as .liquid-glass */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.06) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
