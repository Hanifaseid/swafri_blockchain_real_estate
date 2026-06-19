'use client';

import { useFormContext } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { inputClass } from './styles';
import { AVAILABLE_AMENITIES, type ListingFormValues } from './schemas';

export function AmenitiesStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  return (
    <div className="grid gap-6">
      <p className="text-sm text-gray-600">Select amenities that apply to this listing.</p>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4">
        {AVAILABLE_AMENITIES.map((amenity) => (
          <label key={amenity.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50/60">
            <input
              type="checkbox"
              value={amenity.id}
              {...register('amenityIds')}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-800">{amenity.label}</span>
          </label>
        ))}
      </div>

      {errors.amenityIds?.message && (
        <p role="alert" className="text-xs text-red-600">
          {errors.amenityIds.message}
        </p>
      )}

      <FormField label="Other amenities" hint="Add any additional amenities not listed above.">
        <input type="text" placeholder="e.g. sauna, concierge" className={inputClass} disabled />
      </FormField>
    </div>
  );
}
