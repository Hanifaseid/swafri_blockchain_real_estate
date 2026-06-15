import { z } from 'zod';

// ─── Password Rules ───────────────────────────────────────────────────────────
// Shared password schema reused by login, register, and reset forms.

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ─── Login Schema ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register Schema ──────────────────────────────────────────────────────────
// Only TENANT and PROPERTY_OWNER can register publicly.

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['TENANT', 'PROPERTY_OWNER'], {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Forgot Password Schema ───────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ─── Reset Password Schema ────────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// ─── Create Admin Schema ──────────────────────────────────────────────────────
// Used by SUPER_ADMIN only to create ADMIN accounts.

export const createAdminSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: passwordSchema,
});

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>;
