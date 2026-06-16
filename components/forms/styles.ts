/**
 * styles.ts — shared Tailwind class strings for all form inputs.
 *
 * Import these in every form step instead of duplicating class strings.
 * Changing the design system input style means editing ONE file.
 */

const base =
  'w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 ' +
  'placeholder:text-gray-400 ' +
  'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ' +
  'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 ' +
  'transition-colors';

export const inputClass = `${base} h-9 px-3 py-2`;

export const textareaClass = `${base} px-3 py-2 resize-none`;

export const selectClass = `${base} h-9 px-3 py-2 pr-8 appearance-none cursor-pointer`;

/** Wraps a <select> to add the custom chevron icon */
export const selectWrapClass =
  'relative [&>select]:pr-8 after:pointer-events-none after:absolute after:right-2.5 after:top-1/2 after:-translate-y-1/2 after:border-4 after:border-transparent after:border-t-gray-400 after:content-[""]';

/** Error ring — applied when a field has a validation error */
export const inputErrorClass =
  'border-red-400 focus:border-red-500 focus:ring-red-500/20';

/** Checkbox */
export const checkboxClass =
  'h-4 w-4 rounded border-gray-300 text-emerald-600 ' +
  'focus:ring-2 focus:ring-emerald-500/20 cursor-pointer';
