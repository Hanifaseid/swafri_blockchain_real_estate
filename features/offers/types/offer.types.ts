// Backend statuses: submitted | accepted | rejected | countered | cancelled.
// 'pending' kept as a legacy alias — normalizeOffer maps it to 'submitted'.
export type OfferStatus =
  | 'submitted'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'countered'
  | 'cancelled';

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
  // 'offerer' is the frontend alias; backend sends 'buyer' — normalizeOffer maps both
  offerer?: OfferUser | string;
  buyer?: OfferUser | string;
  // 'offerPrice' is the canonical frontend field; 'amount' mirrors the backend name
  offerPrice: number;
  amount?: number;
  currency: string;
  message?: string;
  status: OfferStatus;
  // 'responseMessage' is the canonical frontend field; 'responseNote' mirrors backend
  responseMessage?: string;
  responseNote?: string;
  // 'counterOfferPrice' is the canonical frontend field; 'counterAmount' mirrors backend
  counterOfferPrice?: number;
  counterAmount?: number;
  expiresAt?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOfferInput {
  listingId: string;
  /** Sent to backend as `amount` */
  offerPrice: number;
  currency: string;
  message?: string;
  expiresAt?: string;
}

export interface RespondOfferInput {
  /** Maps to backend `action`: accepted→accept, rejected→reject, countered→counter */
  status: 'accepted' | 'rejected' | 'countered';
  /** Maps to backend `responseNote` */
  responseMessage?: string;
  /** Maps to backend `counterAmount` — required when status is 'countered' */
  counterOfferPrice?: number;
}

export interface PaginatedOffers {
  items: Offer[];
  total: number;
  page: number;
  limit: number;
}
