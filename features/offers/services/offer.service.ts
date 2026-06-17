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

function normalizeArray<T>(data: ApiResp<T[]> | ApiPaginatedResp<T>): T[] {
  if (isArrayPayload(data.data)) return data.data;

  if ('items' in data && Array.isArray(data.items)) {
    return data.items;
  }

  const nested = data.data;
  if (nested && typeof nested === 'object' && Array.isArray((nested as { items?: unknown }).items)) {
    return (nested as { items: T[] }).items;
  }

  return [];
}

export async function submitOffer(input: CreateOfferInput): Promise<Offer> {
  // Backend expects 'amount', not 'offerPrice'
  const payload = {
    listingId: input.listingId,
    amount: input.offerPrice,
    currency: input.currency,
    message: input.message,
  };
  const { data } = await apiClient.post<ApiResp<Offer>>(ENDPOINTS.OFFERS.SUBMIT, payload);
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function getMyOffers(): Promise<Offer[]> {
  try {
    const { data } = await apiClient.get<ApiResp<Offer[]> | ApiPaginatedResp<Offer>>(ENDPOINTS.OFFERS.MINE);
    return normalizeArray<Offer>(data);
  } catch {
    return [];
  }
}

export async function getReceivedOffers(): Promise<Offer[]> {
  try {
    const { data } = await apiClient.get<ApiResp<Offer[]> | ApiPaginatedResp<Offer>>(ENDPOINTS.OFFERS.RECEIVED);
    return normalizeArray<Offer>(data);
  } catch {
    return [];
  }
}

export async function respondOffer(id: string, input: RespondOfferInput): Promise<Offer> {
  const { data } = await apiClient.patch<ApiResp<Offer>>(ENDPOINTS.OFFERS.RESPOND(id), input);
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function cancelOffer(id: string): Promise<Offer> {
  const { data } = await apiClient.post<ApiResp<Offer>>(ENDPOINTS.OFFERS.CANCEL(id));
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export const offerService = {
  submitOffer,
  getMyOffers,
  getReceivedOffers,
  respondOffer,
  cancelOffer,
};
