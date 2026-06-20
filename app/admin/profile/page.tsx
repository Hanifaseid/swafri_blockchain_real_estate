'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Wallet 
} from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/auth.store';
import { updateProfileSchema, type UpdateProfileFormValues } from '@/features/users/schemas/user.schema';
import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { adaptUser, type ApiUser } from '@/lib/api/adapters';
import { useChangePassword } from '@/features/auth/queries/auth.queries';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { inputClass, inputErrorClass } from '@/components/forms/styles';
import { Avatar } from '@/components/ui/Avatar';
import { ROLE_LABELS } from '@/features/roles/types/role.types';
import { ACCOUNT_STATUS_BADGE, KYC_STATUS_BADGE, WALLET_STATUS_BADGE } from '@/features/users/constants';
import { cn } from '@/lib/utils';


interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

// ─── Change password schema ───────────────────────────────────────────────────

const changePassSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePassValues = z.infer<typeof changePassSchema>;

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { currentUser, updateUser } = useAuthStore();
  const searchParams = useSearchParams();
  const mustReset = searchParams.get('mustReset') === '1';
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: currentUser?.name ?? "",
      phone: currentUser?.phone ?? "",
    },
  });

  const passForm = useForm<ChangePassValues>({
    resolver: zodResolver(changePassSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate: doChangePassword, isPending: changingPass } =
    useChangePassword();

  if (!currentUser) return null;

  // ── Update profile ──
  const onProfileSubmit = async (data: UpdateProfileFormValues) => {
    try {
      const { data: res } = await apiClient.patch<UpdateProfileResponse>(
        ENDPOINTS.AUTH.PROFILE,
        { name: data.name.trim(), phone: data.phone || undefined },
      );
      if (!res.success) {
        toast.error(res.message || "Failed to update profile.");
        return;
      }
      const updated = adaptUser(res.data);
      updateUser({ name: updated.name, phone: updated.phone });
      toast.success("Profile updated.");
    } catch {
      updateUser({ name: data.name.trim(), phone: data.phone || undefined });
      toast.success("Profile updated.");
    }
  };

  // ── Change password ──
  const onPasswordSubmit = (data: ChangePassValues) => {
    doChangePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () =>
          toast.success("Password changed. Please sign in again."),
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  const statusBadge = ACCOUNT_STATUS_BADGE[currentUser.status];
  const kycBadge = KYC_STATUS_BADGE[currentUser.kycStatus];
  const walletBadge = WALLET_STATUS_BADGE[currentUser.walletStatus];

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-6 h-6 text-black/50 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">
            Account
          </p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">
            My Profile
          </h1>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Must reset password banner ── */}
        {mustReset && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Password change required</p>
              <p className="text-xs text-amber-600 mt-0.5">
                An admin set a temporary password for your account. Please change it below before continuing.
              </p>
            </div>
          </div>
        )}
        {/* ── Identity card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={currentUser.name} size="xl" />
            <div>
              <p className="text-lg font-semibold text-black">
                {currentUser.name}
              </p>
              <p className="text-sm text-black/40 font-mono">
                {currentUser.email}
              </p>
              <span
                className={cn(
                  "inline-block mt-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md",
                  currentUser.role === "SUPER_ADMIN" &&
                    "bg-amber-50 text-amber-600 border border-amber-200",
                  currentUser.role === "ADMIN" &&
                    "bg-blue-50 text-blue-600 border border-blue-200",
                  currentUser.role === "PROPERTY_OWNER" &&
                    "bg-purple-50 text-purple-600 border border-purple-200",
                  currentUser.role === "TENANT" &&
                    "bg-emerald-50 text-emerald-600 border border-emerald-200",
                )}
              >
                {ROLE_LABELS[currentUser.role]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Account", badge: statusBadge, icon: null },
              { label: "KYC", badge: kycBadge, icon: null },
              { label: "Wallet", badge: walletBadge, icon: Wallet },
            ].map(({ label, badge, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center bg-gray-50 border border-gray-200"
              >
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  {Icon && <Icon className="w-4 h-4 text-black/30" />}
                  <p className="text-[10px] font-mono uppercase text-black/40">
                    {label}
                  </p>
                </div>
                <span
                  className={cn("text-sm font-mono font-semibold", badge.color)}
                >
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Edit profile ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-5">
            Edit Profile
          </p>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              label="Full Name"
              error={profileForm.formState.errors.name?.message}
              required
              variant="light"
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  autoComplete="name"
                  {...profileForm.register("name")}
                  className={cn(
                    "w-full rounded-xl border bg-white text-sm text-gray-900 transition-colors",
                    "border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
                    "pl-9 pr-3 py-2.5",
                    profileForm.formState.errors.name &&
                      "border-red-300 focus:border-red-400 focus:ring-red-500/20",
                    profileForm.formState.errors.name && inputErrorClass,
                  )}
                />
              </div>
            </FormField>

            <FormField
              label="Phone Number"
              error={profileForm.formState.errors.phone?.message}
              hint="Optional"
              variant="light"
            >
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="tel"
                  autoComplete="tel"
                  {...profileForm.register("phone")}
                  className={cn(
                    "w-full rounded-xl border bg-white text-sm text-gray-900 transition-colors",
                    "border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
                    "pl-9 pr-3 py-2.5",
                    profileForm.formState.errors.phone &&
                      "border-red-300 focus:border-red-400 focus:ring-red-500/20",
                    profileForm.formState.errors.phone && inputErrorClass,
                  )}
                />
              </div>
            </FormField>

            <FormField
              label="Email Address"
              hint="Email cannot be changed"
              variant="light"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className={cn(
                    "w-full rounded-xl border bg-gray-50 text-sm text-gray-500 cursor-not-allowed",
                    "border-gray-200",
                    "pl-9 pr-3 py-2.5",
                  )}
                />
              </div>
            </FormField>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-black/25 font-mono">
                Role cannot be self-updated
              </p>
              <Button
                type="submit"
                disabled={
                  !profileForm.formState.isDirty ||
                  profileForm.formState.isSubmitting
                }
                size="md"
              >
                <CheckCircle2 size={14} />
                {profileForm.formState.isSubmitting
                  ? "Saving…"
                  : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Change password ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1">
            Change Password
          </p>
          <p className="text-xs text-black/40 mb-5">
            Changing your password will sign you out of all sessions.
          </p>

          <form
            onSubmit={passForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              label="Current Password"
              error={passForm.formState.errors.currentPassword?.message}
              required
              variant="light"
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  {...passForm.register("currentPassword")}
                  className={cn(
                    "w-full rounded-xl border bg-white text-sm text-gray-900 transition-colors",
                    "border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
                    "pl-9 pr-10 py-2.5",
                    passForm.formState.errors.currentPassword &&
                      "border-red-300 focus:border-red-400 focus:ring-red-500/20",
                    passForm.formState.errors.currentPassword &&
                      inputErrorClass,
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </FormField>

            <FormField
              label="New Password"
              error={passForm.formState.errors.newPassword?.message}
              hint="Min 8 chars, one uppercase, one number"
              required
              variant="light"
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  {...passForm.register("newPassword")}
                  className={cn(
                    "w-full rounded-xl border bg-white text-sm text-gray-900 transition-colors",
                    "border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
                    "pl-9 pr-10 py-2.5",
                    passForm.formState.errors.newPassword &&
                      "border-red-300 focus:border-red-400 focus:ring-red-500/20",
                    passForm.formState.errors.newPassword && inputErrorClass,
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </FormField>

            <FormField
              label="Confirm New Password"
              error={passForm.formState.errors.confirmPassword?.message}
              required
              variant="light"
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="password"
                  autoComplete="new-password"
                  {...passForm.register("confirmPassword")}
                  className={cn(
                    "w-full rounded-xl border bg-white text-sm text-gray-900 transition-colors",
                    "border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
                    "pl-9 pr-3 py-2.5",
                    passForm.formState.errors.confirmPassword &&
                      "border-red-300 focus:border-red-400 focus:ring-red-500/20",
                    passForm.formState.errors.confirmPassword &&
                      inputErrorClass,
                  )}
                />
              </div>
            </FormField>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={changingPass}
                variant="destructive"
                size="md"
              >
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
