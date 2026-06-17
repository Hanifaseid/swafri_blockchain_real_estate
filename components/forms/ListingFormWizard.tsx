'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

import { Stepper } from '@/components/ui/Stepper';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

import { BasicInfoStep }      from './BasicInfoStep';
import { AmenitiesStep }      from './AmenitiesStep';
import { TierSelectionStep }  from './TierSelectionStep';
import { TitleUploadStep }    from './TitleUploadStep';
import { PhotoUploadGallery } from '@/components/listing/PhotoGallery';
import { FormField }          from '@/components/ui/FormField';

import {
  listingFormSchema,
  LISTING_FORM_DEFAULTS,
  STEP_FIELDS,
  type ListingFormValues,
} from './schemas';
import { appConfig } from '@/config/app.config';

/**
 * ListingFormWizard — 5-step form for creating or editing a listing.
 *
 * Props:
 *   onSubmit       — receives the validated form values on final submission
 *   onUploadPhoto  — uploads a photo file and returns a stored URL
 *   onUploadDoc    — uploads a title document file and returns a stored URL
 *   defaultValues  — pre-fills the form for edit mode
 *   isSubmitting   — disables submit button and shows loading state
 */

interface ListingFormWizardProps {
  onSubmit: (values: ListingFormValues) => Promise<void>;
  onUploadPhoto: (file: File) => Promise<string>;
  onUploadDoc: (file: File) => Promise<string>;
  defaultValues?: Partial<ListingFormValues>;
  isSubmitting?: boolean;
}

const STEP_LABELS = appConfig.listingWizard.steps;

export function ListingFormWizard({
  onSubmit,
  onUploadPhoto,
  onUploadDoc,
  defaultValues,
  isSubmitting,
}: ListingFormWizardProps) {
  const [step, setStep] = React.useState(0);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [uploadingDoc,   setUploadingDoc]   = React.useState(false);

  const methods = useForm<ListingFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(listingFormSchema) as any,
    defaultValues: { ...LISTING_FORM_DEFAULTS, ...defaultValues },
    mode: 'onTouched',
  });

  const { handleSubmit, trigger, watch, setValue } = methods;
  const photos = watch('photos') ?? [];

  // ── Step navigation ─────────────────────────────────────────────────────

  async function handleNext() {
    const fields = STEP_FIELDS[step];
    const valid  = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // ── Photo upload handler ─────────────────────────────────────────────────

  async function handlePhotoUpload(file: File): Promise<string> {
    setUploadingPhoto(true);
    try {
      return await onUploadPhoto(file);
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ── Doc upload handler ───────────────────────────────────────────────────

  async function handleDocUpload(file: File): Promise<string> {
    setUploadingDoc(true);
    try {
      return await onUploadDoc(file);
    } finally {
      setUploadingDoc(false);
    }
  }

  // ── Final submit ─────────────────────────────────────────────────────────

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  // ── Step content map ─────────────────────────────────────────────────────

  const STEPS: React.ReactNode[] = [
    <BasicInfoStep key="basic" />,

    // Step 2 — Photos (uses FormField wrapper + PhotoUploadGallery)
    <FormField key="photos" label="Property Photos" error={(methods.formState.errors.photos as { message?: string } | undefined)?.message} required>
      <PhotoUploadGallery
        photos={photos}
        onChange={(urls) => setValue('photos', urls, { shouldValidate: true })}
        onUpload={handlePhotoUpload}
        uploading={uploadingPhoto}
      />
    </FormField>,

    <AmenitiesStep key="amenities" />,
    <TierSelectionStep key="tier" />,
    <TitleUploadStep key="title" onUpload={handleDocUpload} uploading={uploadingDoc} />,
  ];

  const isLastStep = step === STEP_LABELS.length - 1;

  return (
    <FormProvider {...methods}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">

        {/* Progress */}
        <Stepper steps={STEP_LABELS} currentStep={step} />

        {/* Step card */}
        <Card>
          <CardContent className="pt-6">
            {STEPS[step]}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            <ChevronLeft size={16} />
            Back
          </Button>

          <span className="text-xs text-gray-400">
            Step {step + 1} of {STEP_LABELS.length}
          </span>

          {isLastStep ? (
            <Button type="submit" loading={isSubmitting}>
              <Send size={16} />
              Submit Listing
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
