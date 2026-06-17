'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ListingFormWizard } from '@/components/forms/ListingFormWizard';
import { uploadFile } from '@/lib/api/axios-client';
import { endpoints } from '@/lib/api/endpoints';
import { listingsService } from '@/features/listings/services/listings.service';
import type { ListingFormValues } from '@/components/forms/schemas';

export function NewListingClient() {
  const router = useRouter();

  async function handleSubmit(values: ListingFormValues) {
    // Build FormData from wizard values so the API gets multipart if needed
    const body = {
      ...values,
      amenities: values.amenityIds,
    };
    await listingsService.createListing(
      Object.entries(body).reduce((fd, [k, v]) => {
        fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''));
        return fd;
      }, new FormData())
    );
    toast.success('Listing submitted for review!');
    router.push('/dashboard/listings');
  }

  async function handlePhotoUpload(file: File): Promise<string> {
    const { url } = await uploadFile(endpoints.listings.uploadPhoto('new'), file);
    return url;
  }

  async function handleDocUpload(file: File): Promise<string> {
    const { url } = await uploadFile(endpoints.titles.upload, file);
    return url;
  }

  return (
    <ListingFormWizard
      onSubmit={handleSubmit}
      onUploadPhoto={handlePhotoUpload}
      onUploadDoc={handleDocUpload}
    />
  );
}
