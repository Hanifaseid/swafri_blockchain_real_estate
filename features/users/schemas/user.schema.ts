import { z } from 'zod';

// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

// ─── Update User Status (Admin action) ───────────────────────────────────────

export const updateUserStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED', 'REJECTED']),
  reason: z.string().max(500).optional(),
});

export type UpdateUserStatusFormValues = z.infer<typeof updateUserStatusSchema>;

// ─── Create Admin (Super Admin only) ─────────────────────────────────────────

export const createAdminSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>;
