import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Stepper — horizontal step progress indicator for multi-step forms.
 * Used by ListingFormWizard.
 *
 * Usage:
 *   <Stepper
 *     steps={['Basic Info', 'Photos', 'Amenities', 'Tier', 'Title Docs']}
 *     currentStep={2}   // 0-indexed
 *   />
 */

interface StepperProps {
  steps: readonly string[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {steps.map((label, index) => {
          const isDone    = index < currentStep;
          const isActive  = index === currentStep;
          const isLast    = index === steps.length - 1;

          return (
            <li
              key={label}
              className={cn('flex items-center', !isLast && 'flex-1')}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Circle */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                    isDone  && 'border-emerald-600 bg-emerald-600 text-white',
                    isActive && 'border-emerald-600 bg-white text-emerald-600',
                    !isDone && !isActive && 'border-gray-300 bg-white text-gray-400'
                  )}
                >
                  {isDone ? (
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'whitespace-nowrap text-xs font-medium',
                    isActive ? 'text-emerald-600' : isDone ? 'text-gray-600' : 'text-gray-400'
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'mx-2 mb-5 h-0.5 flex-1 transition-colors',
                    isDone ? 'bg-emerald-600' : 'bg-gray-200'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
