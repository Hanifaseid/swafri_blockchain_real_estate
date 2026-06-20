# Listings & Discovery Frontend Mismatch Audit

Scope: current frontend in `swafri_blockchain_real_estate` compared against the Listings & Discovery integration guide and OpenAPI contract.

## Executive summary

The listings/discovery area is partially integrated, but the frontend is currently in a hybrid state:

- the core listings API layer is mostly present
- several UI flows still use older payloads or legacy localStorage fallbacks
- some domain types are out of sync with the backend contract
- multiple contract surfaces are missing from the frontend entirely

## Severity scale

- **High**: will send the wrong request shape, mis-handle responses, or break real backend integration
- **Medium**: works partially but is inconsistent, fragile, or bypasses the intended backend flow
- **Low**: contract gap or polish issue that does not immediately block core integration

---

## High severity mismatches

| Area | File(s) | Current frontend behavior | Expected backend contract | Severity | Fix needed |
|---|---|---|---|---|---|
| Public listing detail inquiry | `components/listing/ListingDetail.tsx` | Sends inquiry payload with `propertyId`, `tenantName`, `tenantEmail` | `POST /inquiries` expects `listingId`, `message`, optional `inquiryType`, optional `contactInfo` | High | Replace direct axios call with `sendInquiry()` hook/service and send contract-aligned payload |
| Public listing detail favorites | `components/listing/ListingDetail.tsx` | Uses localStorage as primary source of truth and only optionally calls backend | Favorites should be fully backend-driven with idempotent `POST /favorites` / `DELETE /favorites/:listingId` | High | Remove localStorage primary behavior and reuse `components/common/FavoriteButton.tsx` or query-backed hooks |
| Offer type model | `features/offers/types/offer.types.ts` | Uses `pending`, `offerPrice`, `responseMessage`, `counterOfferPrice` | Contract uses `submitted`, `amount`, `responseNote`, `counterAmount` | High | Rename frontend types to match contract or create explicit adapter layer consistently across queries and UI |
| Offer response payload | `features/offers/types/offer.types.ts`, `features/offers/services/offer.service.ts` | UI payload type is `{ status: 'accepted' | 'rejected' | 'countered' }` | `PATCH /offers/:id/respond` expects `{ action: 'accept' | 'reject' | 'counter', counterAmount?, responseNote? }` | High | Update request type and all callers to backend action names |
| Rental application type model | `features/rental-applications/types/rental-application.types.ts`, `app/(dashboard)/applications/[id]/page.tsx` | Uses uppercase statuses like `PENDING`, `SCREENING`, flattened fields like `screeningProvider`, `appointmentDate` | Contract uses lowercase workflow states (`submitted`, `screening`, `approved`, `rejected`, `withdrawn`, `lease_created`) with nested `screening` and `appointment` objects | High | Redesign rental application types and UI bindings around backend response shape |
| Public listing detail fallback data | `app/listings/[id]/page.tsx` | If API fails, renders fake listing object instead of not-found/error state | Contract says unpublished/invisible listings should return 404; published listings are real backend content | High | Remove fake fallback and use `notFound()` or explicit unavailable state |
| Listing detail initial offer sync | `app/(dashboard)/properties/[id]/page.tsx` | Seeds offer amount from `listing.price` only | Sale listings use `price`, rent listings should not offer; contract is sale-only | High | Initialize offer amount only when `listingType === 'sale'` and tighten UI assumptions |

---

## Medium severity mismatches

| Area | File(s) | Current frontend behavior | Expected backend contract | Severity | Fix needed |
|---|---|---|---|---|---|
| Ownership document upload type | `app/(dashboard)/properties/[id]/page.tsx` | Document type selector exists, but upload handler hardcodes `title_deed` | Contract allows `title_deed`, `tax_record`, `utility_bill`, `ownership_certificate`, `lease_authority`, `government_document`, `other` | Medium | Send selected `docUploadType` instead of a hardcoded value |
| Saved search query coverage | `app/(dashboard)/properties/page.tsx`, `features/listings/services/listing.service.ts`, `features/saved-searches/types/saved-search.types.ts` | Save/apply logic only persists a subset: `listingType`, `category`, `minPrice`, `maxPrice`, `minBedrooms`, `minBathrooms` | Contract supports viewport, radius, polygon, `propertyType`, and `alertEnabled`; matching logic also depends on spatial filters | Medium | Expand saved-search serialization and restore logic to include spatial mode + `propertyType` |
| Radius filtering | `app/(dashboard)/properties/page.tsx` | Performs additional client-side radius filtering after API call | Contract already supports backend radius mode | Medium | Remove client-side distance filtering once backend search is trusted; keep only as fallback if explicitly desired |
| Map geocoding | `app/(dashboard)/properties/create/page.tsx` | Calls Nominatim directly from client | Contract exposes `/geo/geocode` and `/geo/reverse` | Medium | Add geo endpoints to API layer and route all geocoding through backend |
| Listing documents review result refresh | `features/listings/services/listing.service.ts`, `app/(dashboard)/properties/[id]/page.tsx` | Review action only assumes generic success and relies on manual refresh/invalidation | Contract review response updates listing verification state and owner notifications | Medium | Normalize reviewed listing response and update UI from returned data when available |
| Favorites mock mode | `features/favorites/services/favorite.service.ts` | Uses `localStorage` in mock mode with simplified fake objects | Contract returns populated listing objects | Medium | Either keep mock mode explicitly isolated or remove it for production integration |
| Auth/session-driven route protection | `proxy.ts`, `components/providers/AuthProvider.tsx`, `lib/auth/session.ts` | Protected routes rely on client-hydrated cookies mirrored from localStorage | Contract/backend auth is token-driven; SSR truth should ideally come from verified server cookies/session | Medium | Keep as-is short term, but plan for server-trusted auth if app becomes fully productionized |

---

## Low severity mismatches / inconsistencies

| Area | File(s) | Current frontend behavior | Expected backend contract | Severity | Fix needed |
|---|---|---|---|---|---|
| Branding inconsistency | `config/site.config.ts`, `metadata.json`, chat route, repo naming | Uses `VEX`, `Swafri`, and `Swafir` interchangeably | One consistent product identity | Low | Normalize naming before shipping |
| Map provider docs | `TESTING_GUIDE.md`, `components/map/PropertyMap.tsx` | Testing guide mentions MapTiler, actual map uses OpenStreetMap tiles | Documentation should match implementation | Low | Update guide or map implementation |
| Listing filters component | `components/listing/ListingFilters.tsx` | Uses older `PropertyFilters` shape (`query`, `type`, `beds`, `tier`) | Current listings contract uses `q`, `propertyType`, `minBedrooms`, etc. | Low | Either retire this component or refactor it to current listing filters |
| `lib/api/response.ts` pagination model | `lib/api/response.ts` | Defines `pageSize` / `totalPages` helper shape not used by listings service | Contract uses `{ items, total, page, limit }` | Low | Simplify or align helper models |

---

## Missing or only partially implemented contract surfaces

These are in the backend contract but are absent or only partially surfaced in the frontend.

### Discovery / listings
- `GET /listings/clusters`
- `GET /listings/analytics/neighborhood`
- `GET /geo/geocode`
- `GET /geo/reverse`
- `GET /geo/neighborhoods`
- `GET /geo/neighborhoods/:id/analytics`
- `POST /listings/bulk-action`
- `GET /listings/dashboard/yield`
- `GET /listings/:id/maintenance-records`
- `POST /listings/:id/maintenance-records`
- `GET /listings/:id/yield`

### Title / certificate
- `GET /listings/:id/certificate`
- `POST /listings/:id/certificate/suspend`
- `POST /listings/:id/certificate/restore`

### Admin review enhancements
- admin document review queue UI based on pending docs
- richer publish precondition UI and explicit 409 messaging
- duplicate hints are shown on listing detail but not surfaced as a dedicated queue/workflow

---

## File-by-file notes

### `features/listings/services/listing.service.ts`
Good:
- central discovery/list/detail/create/update/delete API integration exists
- supports photos, documents, analytics, duplicates, title actions

Gaps:
- no geo endpoints
- no clusters endpoint
- no maintenance/yield endpoints
- saved search payload is too narrow for full contract support

### `app/(dashboard)/properties/page.tsx`
Good:
- role-aware tenant/owner/admin split is clear
- supports viewport/radius/polygon search modes
- supports saved searches and map UI

Gaps:
- saved searches only persist partial query state
- extra client-side radius filtering should eventually be unnecessary
- missing full restore for spatial saved-search queries

### `app/(dashboard)/properties/[id]/page.tsx`
Good:
- most operational listing actions are already modeled
- document review, photo management, analytics, duplicates, title actions are present

Gaps:
- document upload ignores selected type
- lint issue from effect-driven state sync
- image handling still uses raw `<img>` in several spots

### `components/listing/ListingDetail.tsx`
This is the most outdated listing-related surface.

Problems:
- localStorage-driven favorites
- old inquiry payload shape
- older prop model not aligned with current `Listing`
- mixes modern service layer with legacy direct API usage

Recommendation:
- either rewrite it against the current listing domain types
- or replace it with a simplified read-only public detail built from `features/listings/types/listing.types.ts`

### `features/offers/*`
Good:
- service/query hooks exist

Gaps:
- request/response semantics still reflect older naming
- type model does not match contract status values

### `features/rental-applications/*`
Good:
- service/query hooks exist
- application detail screen exists

Gaps:
- domain model is materially out of sync with backend response shape
- UI logic is written against old flattened fields
- this area likely needs a focused schema + UI refactor before production use

---

## Recommended cleanup order

1. **Public listing detail rewrite**
   - fix favorites
   - fix inquiries
   - remove fake fallback listing

2. **Offers refactor**
   - align types and request payloads with `submitted / action / counterAmount / responseNote`

3. **Rental applications refactor**
   - align types with backend response shape
   - update applications pages and review flows

4. **Saved search completion**
   - include `propertyType` + spatial filters + `alertEnabled`

5. **Geo integration**
   - move geocode/reverse geocode to backend endpoints

6. **Optional production cleanup**
   - reduce mock/localStorage listing behavior
   - standardize branding
   - clean lint issues in touched files

---

## Suggested next step

Step 2 should be a concrete cleanup plan with:
- target files
- exact refactor batches
- dependency order
- low-risk implementation sequence
