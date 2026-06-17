import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  submitOffer,
  getMyOffers,
  getReceivedOffers,
  respondOffer,
  cancelOffer,
} from '@/features/offers/services/offer.service';
import type { CreateOfferInput, RespondOfferInput } from '@/features/offers/types/offer.types';

const OFFER_KEYS = {
  mine: ['offers', 'mine'] as const,
  received: ['offers', 'received'] as const,
};

export function useMyOffers() {
  return useQuery({ queryKey: OFFER_KEYS.mine, queryFn: getMyOffers });
}

export function useReceivedOffers() {
  return useQuery({ queryKey: OFFER_KEYS.received, queryFn: getReceivedOffers });
}

export function useSubmitOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOfferInput) => submitOffer(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OFFER_KEYS.mine });
      toast.success('Offer submitted.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to submit offer.');
    },
  });
}

export function useRespondOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RespondOfferInput }) => respondOffer(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OFFER_KEYS.received });
      qc.invalidateQueries({ queryKey: OFFER_KEYS.mine });
      toast.success('Offer response saved.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to respond to offer.');
    },
  });
}

export function useCancelOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelOffer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OFFER_KEYS.mine });
      toast.success('Offer cancelled.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to cancel offer.');
    },
  });
}
