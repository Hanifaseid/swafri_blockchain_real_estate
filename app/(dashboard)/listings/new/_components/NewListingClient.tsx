'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { ListingFormWizard } from '@/components/forms/ListingFormWizard';
import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { createListing } from '@/features/listings/services/listing.service';
import type { ListingFormValues } from '@/components/forms/schemas';

export function NewListingClient() {
  const router = useRouter();

  async function handleSubmit(values: ListingFormValues) {
    try {
      const payload = {
        ...values,
        amenities: values.amenityIds,
        address: {
          street: values.address,
          city: values.city,
          country: values.country,
        },
        // ensure required CreateListingInput fields are present
        category: (values as any).category ?? 'general',
        propertyType: (values as any).propertyType ?? 'other',
        location: (values as any).location ?? { lat: 0, lng: 0 },
      };

      await createListing(payload);

      toast.success('Listing submitted for review!');

      router.push('/account/listings');

    } catch (error) {
      console.error(error);

      toast.error('Failed to submit listing');
    }
  }


  async function handlePhotoUpload(file: File): Promise<string> {
    const formData = new FormData();

    formData.append('file', file);

    const { data } = await apiClient.post(
      ENDPOINTS.LISTINGS.UPLOAD_PHOTOS('new'),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.url;
  }


  async function handleDocUpload(file: File): Promise<string> {
    const formData = new FormData();

    formData.append('file', file);

    const { data } = await apiClient.post(
      '/titles/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.url;
  }


  return (
    <ListingFormWizard
      onSubmit={handleSubmit}
      onUploadPhoto={handlePhotoUpload}
      onUploadDoc={handleDocUpload}
    />
  );
}
