import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * formatCurrency — formats a number as a locale currency string.
 *
 * Usage:
 *   formatCurrency(1500000)           → "$1,500,000"
 *   formatCurrency(1500000, 'ETB')    → "ETB 1,500,000"
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
