'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

import { Stepper } from '@/components/ui/Stepper';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

// ❌ TEMPORARILY DISABLED (missing files cause build error)
// import { BasicInfoStep }      from './BasicInfoStep';
// import { AmenitiesStep }      from './AmenitiesStep';
// import { TierSelectionStep }  from './TierSelectionStep';
// import { TitleUploadStep }    from './TitleUploadStep';

import { PhotoUploadGallery } from '@/components/listing/PhotoGallery';
import { FormField } from '@/components/ui/FormField';

import {
  listingFormSchema,
  LISTING_FORM_DEFAULTS,
  STEP_FIELDS,
  type ListingFormValues,
} from './schemas';

import { appConfig } from '@/config/app.config';

/**
 * ListingFormWizard — 5-step form for creating or editing a listing.
 */

interface ListingFormWizardProps {
  onSubmit: (values: ListingFormValues) => Promise<void>;
  onUploadPhoto: (file: File) => Promise<string>;
  onUploadDoc: (file: File) => Promise<string>;
  defaultValues?: Partial<ListingFormValues>;
  isSubmitting?: boolean;
}

// const STEP_LABELS = appConfig.listingWizard.steps;
const STEP_LABELS = [
  "Basic Info",
  "Photos",
  "Amenities",
  "Tier",
  "Title",
];

export function ListingFormWizard({
  onSubmit,
  onUploadPhoto,
  onUploadDoc,
  defaultValues,
  isSubmitting,
}: ListingFormWizardProps) {
  const [step, setStep] = React.useState(0);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [uploadingDoc, setUploadingDoc] = React.useState(false);

  const methods = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema) as any,
    defaultValues: { ...LISTING_FORM_DEFAULTS, ...defaultValues },
    mode: 'onTouched',
  });

  const { handleSubmit, watch, setValue } = methods;
  const photos = watch('photos') ?? [];

  // ── Step navigation (disabled because steps are removed) ───────────────
  /*
  async function handleNext() {
    const fields = STEP_FIELDS[step];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }
  */

  // ── Photo upload handler ───────────────────────────────────────────────
  async function handlePhotoUpload(file: File): Promise<string> {
    setUploadingPhoto(true);
    try {
      return await onUploadPhoto(file);
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ── Doc upload handler ──────────────────────────────────────────────────
  async function handleDocUpload(file: File): Promise<string> {
    setUploadingDoc(true);
    try {
      return await onUploadDoc(file);
    } finally {
      setUploadingDoc(false);
    }
  }

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  // ── STEP COMPONENTS DISABLED (was causing missing module errors) ────────
  /*
  const STEPS: React.ReactNode[] = [
    <BasicInfoStep key="basic" />,

    <FormField
      key="photos"
      label="Property Photos"
      required
      error={(methods.formState.errors.photos as any)?.message}
    >
      <PhotoUploadGallery
        photos={photos}
        onChange={(urls) =>
          setValue('photos', urls, { shouldValidate: true })
        }
        onUpload={handlePhotoUpload}
        uploading={uploadingPhoto}
      />
    </FormField>,

    <AmenitiesStep key="amenities" />,
    <TierSelectionStep key="tier" />,
    <TitleUploadStep
      key="title"
      onUpload={handleDocUpload}
      uploading={uploadingDoc}
    />,
  ];

  const isLastStep = step === STEP_LABELS.length - 1;
  */

  return (
    <FormProvider {...methods}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">

        {/* Progress (disabled because Stepper depended on steps) */}
        {/* <Stepper steps={STEP_LABELS} currentStep={step} /> */}

        <Card>
          <CardContent className="pt-6 space-y-6">

            {/* Photos only (safe working part) */}
            <FormField
              label="Property Photos"
              required
              error={(methods.formState.errors.photos as any)?.message}
            >
              <PhotoUploadGallery
                photos={photos}
                onChange={(urls) =>
                  setValue('photos', urls, { shouldValidate: true })
                }
                onUpload={handlePhotoUpload}
                uploading={uploadingPhoto}
              />
            </FormField>

          </CardContent>
        </Card>

        {/* Submit only (no step navigation) */}
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Submit Listing
          </Button>
        </div>

      </form>
    </FormProvider>
  );
}