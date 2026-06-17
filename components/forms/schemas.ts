import { z } from 'zod';

/**
 * schemas.ts — listing form Zod schema (Zod v4 compatible).
 *
 * Zod v4 changes from v3:
 *  - required_error → error  (on string/number/enum)
 *  - z.number({ required_error }) → z.number({ error })
 *  - z.string({ required_error }) → z.string({ error })
 *  - z.enum([...], { required_error }) → z.enum([...], { error })
 *
 *  - z.preprocess on numeric fields coerces "" → undefined so optional
 *    number fields don't fail when left blank.
 *  - z.boolean().refine(v => v === true) keeps inferred type as boolean
 *    so react-hook-form default values of false compile correctly.
 *  - STEP_FIELDS drives per-step validation via form.trigger().
 */

// ── Numeric coerce helpers ────────────────────────────────────────────────────

const optionalNumber = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number().positive().optional()
);

const requiredNumber = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number({ error: 'Required' }).positive('Must be a positive number')
);

// ── Step 1 — Basic Info ───────────────────────────────────────────────────────

export const basicInfoSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .min(5, 'At least 5 characters')
    .max(100, 'Max 100 characters'),

  description: z
    .string({ error: 'Description is required' })
    .min(20, 'At least 20 characters')
    .max(3000, 'Max 3000 characters'),

  address: z.string({ error: 'Address is required' }).min(5, 'Enter a full address'),
  city:    z.string({ error: 'City is required' }).min(2, 'Enter a city'),
  country: z.string({ error: 'Country is required' }).min(2, 'Enter a country'),

  lat: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(-90).max(90).optional()
  ),
  lng: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(-180).max(180).optional()
  ),

  listingType: z.enum(['sale', 'rent'], { error: 'Select listing type' }),
  type:        z.enum(['residential', 'commercial'], { error: 'Select property type' }),

  price:    requiredNumber,
  currency: z.string().default('USD'),

  beds:          optionalNumber,
  baths:         optionalNumber,
  sqft:          optionalNumber,
  yearBuilt:     optionalNumber,
  parkingSpaces: optionalNumber,
});

// ── Step 2 — Photos ───────────────────────────────────────────────────────────

export const photosSchema = z.object({
  photos: z
    .array(z.string().url('Invalid photo URL'))
    .min(1, 'Upload at least one photo')
    .max(20, 'Maximum 20 photos'),
});

// ── Step 3 — Amenities ────────────────────────────────────────────────────────

export const AVAILABLE_AMENITIES = [
  { id: 'wifi',        label: 'Wi-Fi'             },
  { id: 'ac',          label: 'Air Conditioning'   },
  { id: 'gym',         label: 'Gym'                },
  { id: 'pool',        label: 'Swimming Pool'       },
  { id: 'parking',     label: 'Parking'             },
  { id: 'security',    label: 'Security / CCTV'     },
  { id: 'elevator',    label: 'Elevator'             },
  { id: 'generator',   label: 'Generator'            },
  { id: 'solar',       label: 'Solar Power'          },
  { id: 'garden',      label: 'Garden'               },
  { id: 'balcony',     label: 'Balcony'              },
  { id: 'laundry',     label: 'Laundry'              },
  { id: 'storage',     label: 'Storage Room'          },
  { id: 'ev_charging', label: 'EV Charging'          },
] as const;

export type AmenityId = (typeof AVAILABLE_AMENITIES)[number]['id'];

export const amenitiesSchema = z.object({
  amenityIds: z.array(z.string()).default([]),
});

// ── Step 4 — Tier & Pricing ───────────────────────────────────────────────────

export const tierSchema = z.object({
  tier: z.enum(['basic', 'premium', 'featured'], { error: 'Select a listing tier' }),

  leaseDurationMonths: optionalNumber,
  depositAmount:       optionalNumber,

  confirmOwnership: z
    .boolean()
    .refine((v) => v === true, { message: 'You must confirm you are the legal owner' })
    .optional(),
});

// ── Step 5 — Title Documents ──────────────────────────────────────────────────

export const titleSchema = z.object({
  titleDocumentUrl: z.string().url('Upload a valid document').optional(),

  confirmTitleAccuracy: z
    .boolean()
    .refine((v) => v === true, { message: 'Confirm the title document is accurate' }),

  existingTokenId: z.string().optional(),
});

// ── Full merged schema ────────────────────────────────────────────────────────

export const listingFormSchema = basicInfoSchema
  .merge(photosSchema)
  .merge(amenitiesSchema)
  .merge(tierSchema)
  .merge(titleSchema);

export type ListingFormValues = z.infer<typeof listingFormSchema>;

// ── Step field map ────────────────────────────────────────────────────────────

export const STEP_FIELDS: Record<number, (keyof ListingFormValues)[]> = {
  0: ['title', 'description', 'address', 'city', 'country', 'listingType', 'type', 'price'],
  1: ['photos'],
  2: ['amenityIds'],
  3: ['tier'],
  4: ['confirmTitleAccuracy'],
};

// ── Default values ────────────────────────────────────────────────────────────

export const LISTING_FORM_DEFAULTS: Partial<ListingFormValues> = {
  listingType:          'sale',
  type:                 'residential',
  currency:             'USD',
  tier:                 'basic',
  photos:               [],
  amenityIds:           [],
  confirmTitleAccuracy: false,
  confirmOwnership:     false,
};
