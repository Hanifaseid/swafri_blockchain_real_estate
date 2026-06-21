"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useRegister } from "@/features/auth/queries/auth.queries";
import { AuthServiceError } from "@/features/auth/services/auth.service";

// Shared UI components
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import {
  darkInputWithIconClass,
  darkInputPasswordClass,
  darkInputErrorClass,
} from "@/components/forms/styles";
import { RoleSelector } from "./RoleSelector";
import { cn } from "@/lib/utils";

// ─── RegisterForm ─────────────────────────────────────────────────────────────

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: registerFn, isPending, error, isSuccess } = useRegister();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "TENANT",
    },
  });

  const selectedRole = watch("role");
  const onSubmit = (data: RegisterFormValues) => registerFn(data);

  const serverError =
    error instanceof AuthServiceError
      ? error.message
      : error
        ? "Something went wrong. Please try again."
        : null;

  return (
    <div className="space-y-5 p-6 md:p-8">
      {/* Heading */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-medium text-white tracking-tight">
          Create your account
        </h2>
        <p className="text-xs text-white/35">Join the EstateLedger marketplace</p>
      </div>

      {/* Server alerts */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-rose-300 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}
      {isSuccess && (
        <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-300 text-xs">
          <CheckCircle2
            className="w-4 h-4 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>Account created. Redirecting to dashboard…</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Role selector — Controller wraps it for react-hook-form */}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RoleSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.role?.message}
            />
          )}
        />

        {/* Full name */}
        <FormField
          label="Full Name"
          variant="dark"
          error={errors.name?.message}
          required
        >
          <div className="relative">
            <User
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="e.g. John Doe"
              autoComplete="name"
              {...register("name")}
              className={cn(
                darkInputWithIconClass,
                errors.name && darkInputErrorClass,
              )}
            />
          </div>
        </FormField>

        {/* Email */}
        <FormField
          label="Email Address"
          variant="dark"
          error={errors.email?.message}
          required
        >
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="email"
              placeholder="e.g. john@example.com"
              autoComplete="email"
              {...register("email")}
              className={cn(
                darkInputWithIconClass,
                errors.email && darkInputErrorClass,
              )}
            />
          </div>
        </FormField>

        {/* Phone — optional */}
        <FormField
          label="Phone Number"
          variant="dark"
          error={errors.phone?.message}
          hint="Optional — used for account recovery"
        >
          <div className="relative">
            <Phone
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="tel"
              placeholder="e.g. +1 (555) 000-1234"
              autoComplete="tel"
              {...register("phone")}
              className={cn(
                darkInputWithIconClass,
                errors.phone && darkInputErrorClass,
              )}
            />
          </div>
        </FormField>

        {/* Password */}
        <FormField
          label="Password"
          variant="dark"
          error={errors.password?.message}
          hint="Min 8 characters, one uppercase, one number"
          required
        >
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password")}
              className={cn(
                darkInputPasswordClass,
                errors.password && darkInputErrorClass,
              )}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>

        {/* Confirm password */}
        <FormField
          label="Confirm Password"
          variant="dark"
          error={errors.confirmPassword?.message}
          required
        >
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={cn(
                darkInputPasswordClass,
                errors.confirmPassword && darkInputErrorClass,
              )}
            />
            <button
              type="button"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>

        {/* Property owner notice */}
        {selectedRole === "PROPERTY_OWNER" && (
          <div className="flex items-start gap-2.5 bg-emerald-950/30 border border-emerald-900/40 p-3.5 rounded-xl">
            <Sparkles
              className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-[11px] text-emerald-400 font-mono leading-relaxed">
              Your account starts as <strong>PENDING</strong> and requires admin
              review before you can publish verified properties.
            </p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending || isSuccess}
          loading={isPending}
          className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase shadow-lg shadow-amber-500/20"
          size="lg"
        >
          {isSuccess ? "Redirecting…" : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
