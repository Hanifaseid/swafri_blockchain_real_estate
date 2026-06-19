"use client";

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/FormField";
import { inputClass, selectClass } from "./styles";
import type { ListingFormValues } from "./schemas";

export function TierSelectionStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  return (
    <div className="grid gap-6">
      <FormField label="Listing tier" error={errors.tier?.message} required>
        <select {...register("tier")} className={selectClass}>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="featured">Featured</option>
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Lease duration (months)"
          error={errors.leaseDurationMonths?.message}
        >
          <input
            type="number"
            {...register("leaseDurationMonths", { valueAsNumber: true })}
            className={inputClass}
            placeholder="12"
          />
        </FormField>

        <FormField label="Deposit amount" error={errors.depositAmount?.message}>
          <input
            type="number"
            {...register("depositAmount", { valueAsNumber: true })}
            className={inputClass}
            placeholder="500"
          />
        </FormField>
      </div>

      <FormField
        label="Confirm ownership"
        error={errors.confirmOwnership?.message}
        required
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("confirmOwnership")}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">
            I confirm I am the legal owner of this property.
          </span>
        </div>
      </FormField>
    </div>
  );
}
