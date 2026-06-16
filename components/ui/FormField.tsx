import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

/**
 * FormField — label + input + error message wrapper.
 * Ensures every form input has an associated <label> (accessibility).
 *
 * Two variants:
 *   light (default) — white background, used in dashboard forms
 *   dark            — transparent/glass, used in auth forms
 *
 * Usage (light):
 *   <FormField label="Property Title" error={errors.title?.message} required>
 *     <input {...register('title')} className={inputClass} />
 *   </FormField>
 *
 * Usage (dark):
 *   <FormField label="Email" variant="dark" error={errors.email?.message} required>
 *     <div className="relative">
 *       <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
 *       <input {...register('email')} className={darkInputWithIconClass} />
 *     </div>
 *   </FormField>
 */

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  /** 'light' = dashboard forms (default), 'dark' = auth forms */
  variant?: 'light' | 'dark';
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
  htmlFor,
  variant = 'light',
}: FormFieldProps) {
  const id = htmlFor ?? label.toLowerCase().replace(/\s+/g, '-');

  // Inject id into the first child element if it accepts one
  const child = React.Children.only(children) as React.ReactElement<{ id?: string }>;
  const childWithId = React.cloneElement(child, { id: child.props.id ?? id });

  const isDark = variant === 'dark';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <LabelPrimitive.Root
        htmlFor={id}
        className={cn(
          isDark
            ? 'text-[10px] uppercase tracking-widest font-mono text-white'
            : 'text-sm font-medium text-white-700'
        )}
      >
        {label}
        {required && (
          <span
            className={cn('ml-0.5', isDark ? 'text-emerald-400' : 'text-red-500')}
            aria-hidden="true"
          >
            *
          </span>
        )}
      </LabelPrimitive.Root>

      {childWithId}

      {hint && !error && (
        <p className={cn('text-xs', isDark ? 'text-white/30 font-mono' : 'text-gray-400')}>
          {hint}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className={cn('text-xs font-mono', isDark ? 'text-rose-400' : 'text-red-600')}
        >
          {error}
        </p>
      )}
    </div>
  );
}
