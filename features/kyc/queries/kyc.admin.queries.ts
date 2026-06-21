import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getUserKycDetails,
  reviewUserKyc,
  getUserKycDocUrl,
  startKycReview,
} from '@/features/kyc/services/kyc.admin.service';

const KEYS = {
  adminKyc: (userId: string) => ['admin', 'kyc', userId] as const,
};

// ─── useAdminKycDetails ───────────────────────────────────────────────────────

export function useAdminKycDetails(userId: string) {
  return useQuery({
    queryKey: KEYS.adminKyc(userId),
    queryFn: () => getUserKycDetails(userId),
    enabled: !!userId,
  });
}

// ─── useReviewUserKyc ─────────────────────────────────────────────────────────

export function useReviewUserKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, decision, note }: { userId: string; decision: 'approve' | 'reject'; note?: string }) =>
      reviewUserKyc(userId, decision, note),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: KEYS.adminKyc(userId) });
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('KYC review submitted.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── useAdminKycDocUrl ────────────────────────────────────────────────────────

export function useAdminKycDocUrl(userId: string, docId: string) {
  return useQuery({
    queryKey: ['admin', 'kyc', userId, 'doc', docId],
    queryFn: () => getUserKycDocUrl(userId, docId),
    enabled: !!userId && !!docId,
  });
}

// ─── useStartKycReview ────────────────────────────────────────────────────────
// Moves a pending KYC submission to under_review status.

export function useStartKycReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => startKycReview(userId),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: KEYS.adminKyc(userId) });
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Review started.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
