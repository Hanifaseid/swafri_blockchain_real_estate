import React from 'react';
import Reveal from '@/components/Reveal';

interface SectionHeadingProps {
  /** Register index, e.g. "01" — rendered as "§ 01". */
  index: string;
  kicker: string;
  title: React.ReactNode;
  description?: string;
  align?: 'left' | 'center';
  /** Optional right-aligned action (left align only). */
  action?: React.ReactNode;
}

/**
 * SectionHeading — the editorial "register" heading used across the landing
 * page. "§ 0X" numeral + gold rule + mono kicker + serif display title.
 */
export default function SectionHeading({
  index,
  kicker,
  title,
  description,
  align = 'left',
  action,
}: SectionHeadingProps) {
  const center = align === 'center';

  return (
    <Reveal
      className={[
        'mb-14 flex gap-6',
        center
          ? 'flex-col items-center text-center max-w-2xl mx-auto'
          : 'flex-col md:flex-row md:items-end md:justify-between',
      ].join(' ')}
    >
      <div className={center ? '' : 'max-w-2xl'}>
        <div className={`flex items-center gap-3 mb-5 ${center ? 'justify-center' : ''}`}>
          <span className="font-mono text-[11px] tracking-[0.28em] text-amber-300/85">§ {index}</span>
          <span className="h-px w-8 rule-gold" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
            {kicker}
          </span>
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.04]">
          {title}
        </h2>
        {description && (
          <p className="text-sm md:text-base text-white/55 mt-4 font-light leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && !center && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
