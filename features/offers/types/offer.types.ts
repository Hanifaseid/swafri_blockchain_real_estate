export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'cancelled';

export interface OfferUser {
  id: string;
  name: string;
  email: string;
}

export interface OfferListing {
  id: string;
  title: string;
  listingType?: string;
  price?: number;
  currency?: string;
}

export interface Offer {
  id: string;
  listingId: string;
  listing?: OfferListing | string;
  listingOwner?: OfferUser | string;
  offerer?: OfferUser | string;
  offerPrice: number;
  currency: string;
  message?: string;
  status: OfferStatus;
  responseMessage?: string;
  counterOfferPrice?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOfferInput {
  listingId: string;
  offerPrice: number;
  currency: string;
  message?: string;
}

export interface RespondOfferInput {
  status: 'accepted' | 'rejected' | 'countered';  // Maps to action
  responseMessage?: string;  // Maps to responseNote
  counterOfferPrice?: number;  // Maps to counterAmount
}

export interface PaginatedOffers {
  items: Offer[];
  total: number;
  page: number;
  limit: number;
}
