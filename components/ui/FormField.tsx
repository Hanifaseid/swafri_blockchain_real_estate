import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

/**
 * FormField — label + input + error message wrapper.
 * Ensures every form input has an associated <label> (accessibility).
 *
 * Usage:
 *   <FormField label="Property Title" error={errors.title?.message} required>
 *     <input {...register('title')} className={inputClass} />
 *   </FormField>
 */

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Override the generated id used to link label↔input */
  htmlFor?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  // Auto-generate a stable id from the label if not provided
  const id = htmlFor ?? label.toLowerCase().replace(/\s+/g, '-');

  // Clone the first child to inject the id if it accepts one
  const child = React.Children.only(children) as React.ReactElement<{ id?: string }>;
  const childWithId = React.cloneElement(child, { id: child.props.id ?? id });

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <LabelPrimitive.Root
        htmlFor={id}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
        )}
      </LabelPrimitive.Root>

      {childWithId}

      {hint && !error && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
