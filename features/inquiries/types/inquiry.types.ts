// ─── Inquiry Types ────────────────────────────────────────────────────────────
// Matches the real API response from POST/GET /inquiries

export type InquiryType   = 'rent' | 'buy' | 'general';
export type InquiryStatus = 'open' | 'responded' | 'in_discussion' | 'closed' | 'spam';

export interface InquiryContactInfo {
  phone?: string;
  email?: string;
}

export interface InquiryListing {
  id: string;
  title: string;
  listingType?: string;
}

export interface InquiryUser {
  id: string;
  name: string;
  email: string;
}

export interface Inquiry {
  id: string;
  listing: InquiryListing | string;   // API may return object or string ID
  listingOwner?: InquiryUser | string;
  inquirer?: InquiryUser | string;
  message: string;
  inquiryType: InquiryType;
  status: InquiryStatus;
  response?: string;
  contactInfo?: InquiryContactInfo;
  createdAt: string;
  updatedAt?: string;
}

// ─── Create inquiry payload ───────────────────────────────────────────────────

export interface CreateInquiryInput {
  listingId: string;
  message: string;
  inquiryType?: InquiryType;
  contactInfo?: InquiryContactInfo;
}

// ─── Update inquiry payload (owner/admin) ─────────────────────────────────────

export interface UpdateInquiryInput {
  response?: string;
  status?: InquiryStatus;
}

export interface AdminInquiriesParams {
  status?: string;
  listingId?: string;
  page?: number;
  limit?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getInquiryListingTitle(inquiry: Inquiry): string {
  if (typeof inquiry.listing === 'string') return inquiry.listing;
  return inquiry.listing?.title ?? 'Unknown Listing';
}

export function getInquiryListingId(inquiry: Inquiry): string {
  if (typeof inquiry.listing === 'string') return inquiry.listing;
  return inquiry.listing?.id ?? '';
}

export function getInquirerName(inquiry: Inquiry): string {
  if (!inquiry.inquirer) return 'Unknown';
  if (typeof inquiry.inquirer === 'string') return inquiry.inquirer;
  return inquiry.inquirer.name;
}
