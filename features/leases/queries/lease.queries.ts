import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  createLease,
  getMyLeases,
  getAllLeases,
  getLease,
  proposeLease,
  signLease,
  fundLease,
  activateLease,
  cancelLease,
  completeLease,
  terminateLease,
  disputeLease,
  respondToDispute,
  resolveDispute,
  getEscrowVerification,
  getLeaseTimeline,
} from '../services/lease.service';
import { CreateLeasePayload, ResolveDisputePayload } from '../types/lease.types';

export const leaseKeys = {
  all: ['leases'] as const,
  mine: () => [...leaseKeys.all, 'mine'] as const,
  detail: (id: string) => [...leaseKeys.all, 'detail', id] as const,
  escrow: (id: string) => [...leaseKeys.all, 'escrow', id] as const,
  timeline: (id: string) => [...leaseKeys.all, 'timeline', id] as const,
  tenants: (params?: object) => [...leaseKeys.all, 'tenants', params ?? {}] as const,
};

export function useCreateLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeasePayload) => createLease(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaseKeys.mine() });
      toast.success('Lease draft created successfully.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMyLeases() {
  return useQuery({
    queryKey: leaseKeys.mine(),
    queryFn: getMyLeases,
  });
}

export function useAllLeases() {
  return useQuery({
    queryKey: [...leaseKeys.all, 'all'],
    queryFn: getAllLeases,
  });
}

export function useLeaseDetail(id: string) {
  return useQuery({
    queryKey: leaseKeys.detail(id),
    queryFn: () => getLease(id),
    enabled: !!id,
  });
}

export function useProposeLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proposeLease(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: leaseKeys.mine() });
      toast.success('Lease proposed to tenant.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSignLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => signLease(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: leaseKeys.mine() });
      toast.success('Lease signed.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useFundLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fundLease(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: leaseKeys.mine() });
      toast.success('Escrow funded successfully.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useActivateLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateLease(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: leaseKeys.mine() });
      toast.success('Lease activated! First month rent released.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCancelLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelLease(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: leaseKeys.mine() });
      toast.success('Lease cancelled. Escrow refunded if applicable.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCompleteLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeLease(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: leaseKeys.mine() });
      toast.success('Lease completed. Deposit refunded to tenant.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useTerminateLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => terminateLease(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: leaseKeys.mine() });
      toast.success('Lease terminated. Deposit released to landlord.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDisputeLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disputeLease(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      toast.success('Dispute flagged.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveDisputePayload }) => resolveDispute(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      toast.success('Dispute resolved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useEscrowVerification(id: string, enabled = true) {
  return useQuery({
    queryKey: leaseKeys.escrow(id),
    queryFn: () => getEscrowVerification(id),
    enabled: !!id && enabled,
    retry: false,
    refetchInterval: enabled ? 10000 : false,
  });
}

// ─── Additional Hooks ─────────────────────────────────────────────────────────

export function useLeaseTimeline(id: string) {
  return useQuery({
    queryKey: leaseKeys.timeline(id),
    queryFn: () => getLeaseTimeline(id),
    enabled: !!id,
  });
}

export function useRespondToDispute() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      respondToDispute(id, { response }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leaseKeys.detail(data.id) });
      toast.success('Dispute response submitted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
