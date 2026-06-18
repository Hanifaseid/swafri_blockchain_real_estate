import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Offer, CreateOfferInput, RespondOfferInput } from '@/features/offers/types/offer.types';

interface ApiResp<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiPaginatedResp<T> {
  success: boolean;
  message: string;
  data: T[] | { items: T[]; total?: number; page?: number; limit?: number };
  items?: T[];
  total?: number;
  page?: number;
  limit?: number;
}

function isArrayPayload<T>(payload: T[] | { items: T[] } | undefined): payload is T[] {
  return Array.isArray(payload);
}

function normalizeOffer(offer: any): Offer {
  return {
    ...offer,

    // backend -> frontend mapping
    offerPrice: offer.offerPrice ?? offer.amount ?? 0,

    listing:
      typeof offer.listing === 'object'
        ? offer.listing
        : offer.listing,

    offerer:
      typeof offer.offerer === 'object'
        ? offer.offerer
        : offer.offerer,
  };
}

function normalizeArray<T>(data: ApiResp<T[]> | ApiPaginatedResp<T>): T[] {
  let items: T[] = [];

  if (isArrayPayload(data.data)) {
    items = data.data;
  } 
  else if ('items' in data && Array.isArray(data.items)) {
    items = data.items;
  } 
  else {
    const nested = data.data;

    if (
      nested &&
      typeof nested === 'object' &&
      Array.isArray((nested as { items?: unknown }).items)
    ) {
      items = (nested as { items: T[] }).items;
    }
  }

  return items;
}


export async function submitOffer(input: CreateOfferInput): Promise<Offer> {

  const payload = {
    listingId: input.listingId,
    amount: input.offerPrice,
    currency: input.currency,
    message: input.message,
  };

  const { data } =
    await apiClient.post<ApiResp<Offer>>(
      ENDPOINTS.OFFERS.SUBMIT,
      payload
    );

  if (!data.success) throw new Error(data.message);

  return normalizeOffer(data.data);
}


export async function getMyOffers(): Promise<Offer[]> {

  try {

    const { data } =
      await apiClient.get<
        ApiResp<Offer[]> | ApiPaginatedResp<Offer>
      >(ENDPOINTS.OFFERS.MINE);


    return normalizeArray<Offer>(data)
      .map(normalizeOffer);


  } catch {

    return [];

  }
}


export async function getReceivedOffers(): Promise<Offer[]> {

  try {

    const { data } =
      await apiClient.get<
        ApiResp<Offer[]> | ApiPaginatedResp<Offer>
      >(ENDPOINTS.OFFERS.RECEIVED);


    return normalizeArray<Offer>(data)
      .map(normalizeOffer);


  } catch {

    return [];

  }
}


export async function respondOffer(
  id: string,
  input: RespondOfferInput
): Promise<Offer> {

  const { data } =
    await apiClient.patch<ApiResp<Offer>>(
      ENDPOINTS.OFFERS.RESPOND(id),
      input
    );


  if (!data.success) throw new Error(data.message);


  return normalizeOffer(data.data);
}



export async function cancelOffer(id: string): Promise<Offer> {

  const { data } =
    await apiClient.post<ApiResp<Offer>>(
      ENDPOINTS.OFFERS.CANCEL(id)
    );


  if (!data.success) throw new Error(data.message);


  return normalizeOffer(data.data);
}



export const offerService = {
  submitOffer,
  getMyOffers,
  getReceivedOffers,
  respondOffer,
  cancelOffer,
};