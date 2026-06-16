/**
 * styles.ts — shared Tailwind class strings for all form inputs.
 *
 * Import these in every form step instead of duplicating class strings.
 * Changing the design system input style means editing ONE file.
 *
 * Two variants:
 *   light — used in dashboard forms (white background)
 *   dark  — used in auth forms (black/glass background)
 */

// ─── Light (dashboard) ────────────────────────────────────────────────────────

const baseLight =
  'w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 ' +
  'placeholder:text-gray-400 ' +
  'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ' +
  'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 ' +
  'transition-colors';

export const inputClass = `${baseLight} h-9 px-3 py-2`;
export const textareaClass = `${baseLight} px-3 py-2 resize-none`;
export const selectClass = `${baseLight} h-9 px-3 py-2 pr-8 appearance-none cursor-pointer`;

export const selectWrapClass =
  'relative [&>select]:pr-8 after:pointer-events-none after:absolute after:right-2.5 after:top-1/2 after:-translate-y-1/2 after:border-4 after:border-transparent after:border-t-gray-400 after:content-[""]';

export const inputErrorClass =
  'border-red-400 focus:border-red-500 focus:ring-red-500/20';

export const checkboxClass =
  'h-4 w-4 rounded border-gray-300 text-emerald-600 ' +
  'focus:ring-2 focus:ring-emerald-500/20 cursor-pointer';

// ─── Dark (auth forms) ────────────────────────────────────────────────────────
// Used by LoginForm and RegisterForm on the black/glass auth pages.

const baseDark =
  'w-full bg-black/60 border border-white/10 rounded-xl text-sm text-white ' +
  'placeholder:text-white/25 font-mono ' +
  'focus:outline-none focus:border-emerald-400 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'transition-all';

export const darkInputClass = `${baseDark} px-4 py-3.5`;

/** With left icon padding — pair with an absolute-positioned icon at left-3.5 */
export const darkInputWithIconClass = `${baseDark} pl-11 pr-4 py-3.5`;

/** With left + right icon padding — for password toggle */
export const darkInputPasswordClass = `${baseDark} pl-11 pr-11 py-3.5`;

export const darkInputErrorClass =
  'border-rose-500/60 focus:border-rose-500';
