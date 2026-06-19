'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { inputClass } from './styles';
import type { ListingFormValues } from './schemas';

interface TitleUploadStepProps {
  onUpload: (file: File) => Promise<string>;
  uploading?: boolean;
}

export function TitleUploadStep({ onUpload, uploading }: TitleUploadStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  const titleDocumentUrl = watch('titleDocumentUrl');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await onUpload(file);
    setValue('titleDocumentUrl', url, { shouldValidate: true });
  };

  return (
    <div className="grid gap-6">
      <FormField label="Title document" error={errors.titleDocumentUrl?.message}>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
          className={inputClass}
        />
      </FormField>

      {titleDocumentUrl && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          Document uploaded successfully.
        </div>
      )}

      <FormField label="Existing token ID" error={errors.existingTokenId?.message}>
        <input {...register('existingTokenId')} className={inputClass} placeholder="Token ID (optional)" />
      </FormField>

      <FormField label="Confirm title accuracy" error={errors.confirmTitleAccuracy?.message} required>
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('confirmTitleAccuracy')} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
          <span className="text-sm text-gray-700">I confirm the title document is accurate.</span>
        </div>
      </FormField>
    </div>
  );
}
