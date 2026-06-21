"use client";

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/FormField";
import {
  inputClass,
  textareaClass,
  selectClass,
  inputErrorClass,
} from "./styles";
import type { ListingFormValues } from "./schemas";

export function BasicInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <FormField label="Title" error={errors.title?.message} required>
          <input
            {...register("title")}
            className={inputClass}
            placeholder="Modern 3BR apartment"
          />
        </FormField>

        <FormField
          label="Description"
          error={errors.description?.message}
          required
        >
          <textarea
            {...register("description")}
            rows={5}
            className={textareaClass}
            placeholder="Describe the property and its features."
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Listing type"
          error={errors.listingType?.message}
          required
        >
          <select {...register("listingType")} className={selectClass}>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </FormField>

        <FormField label="Property type" error={errors.type?.message} required>
          <select {...register("type")} className={selectClass}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Price" error={errors.price?.message} required>
          <input
            type="number"
            step="any"
            {...register("price", { valueAsNumber: true })}
            className={inputClass}
            placeholder="250000"
          />
        </FormField>

        <FormField label="Currency" error={errors.currency?.message}>
          <select {...register("currency")} className={selectClass}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </FormField>

        <FormField label="Bedrooms" error={errors.beds?.message}>
          <input
            type="number"
            {...register("beds", { valueAsNumber: true })}
            className={inputClass}
            placeholder="3"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Bathrooms" error={errors.baths?.message}>
          <input
            type="number"
            {...register("baths", { valueAsNumber: true })}
            className={inputClass}
            placeholder="2"
          />
        </FormField>

        <FormField label="Square footage" error={errors.sqft?.message}>
          <input
            type="number"
            {...register("sqft", { valueAsNumber: true })}
            className={inputClass}
            placeholder="1200"
          />
        </FormField>

        <FormField label="Year built" error={errors.yearBuilt?.message}>
          <input
            type="number"
            {...register("yearBuilt", { valueAsNumber: true })}
            className={inputClass}
            placeholder="2015"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Parking spaces" error={errors.parkingSpaces?.message}>
          <input
            type="number"
            {...register("parkingSpaces", { valueAsNumber: true })}
            className={inputClass}
            placeholder="1"
          />
        </FormField>

        <FormField label="Address" error={errors.address?.message} required>
          <input
            {...register("address")}
            className={inputClass}
            placeholder="123 Main Street"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="City" error={errors.city?.message} required>
          <input
            {...register("city")}
            className={inputClass}
            placeholder="Addis Ababa"
          />
        </FormField>

        <FormField label="Country" error={errors.country?.message} required>
          <input
            {...register("country")}
            className={inputClass}
            placeholder="Ethiopia"
          />
        </FormField>

        <FormField label="Latitude" error={errors.lat?.message}>
          <input
            type="number"
            step="any"
            {...register("lat", { valueAsNumber: true })}
            className={inputClass}
            placeholder="8.9806"
          />
        </FormField>
      </div>

      <FormField label="Longitude" error={errors.lng?.message}>
        <input
          type="number"
          step="any"
          {...register("lng", { valueAsNumber: true })}
          className={inputClass}
          placeholder="38.7578"
        />
      </FormField>
    </div>
  );
}
