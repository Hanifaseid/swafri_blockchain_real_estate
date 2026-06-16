import { User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── RoleSelector ─────────────────────────────────────────────────────────────
// Two-card role picker used in the register form.
// Only TENANT and PROPERTY_OWNER can register publicly.

interface RoleSelectorProps {
  value: 'TENANT' | 'PROPERTY_OWNER';
  onChange: (role: 'TENANT' | 'PROPERTY_OWNER') => void;
  error?: string;
}

const ROLES = [
  {
    key: 'TENANT' as const,
    icon: User,
    title: 'Tenant',
    subtitle: 'Browse, rent & invest',
    color: 'text-emerald-400',
  },
  {
    key: 'PROPERTY_OWNER' as const,
    icon: Building2,
    title: 'Property Owner',
    subtitle: 'List & manage properties',
    color: 'text-purple-400',
  },
];

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
        I am registering as
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ROLES.map(({ key, icon: Icon, title, subtitle, color }) => {
          const isSelected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all text-center cursor-pointer',
                isSelected
                  ? 'bg-white/10 border-white text-white'
                  : 'bg-black/40 border-white/10 text-white/50 hover:border-white/25 hover:text-white'
              )}
              aria-pressed={isSelected}
            >
              <Icon className={cn('w-5 h-5', isSelected ? color : 'text-white/30')} />
              <span className="text-xs font-semibold font-mono">{title}</span>
              <span className="text-[9px] text-white/40 font-normal leading-tight">{subtitle}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-400 font-mono">
          {error}
        </p>
      )}
    </div>
  );
}
