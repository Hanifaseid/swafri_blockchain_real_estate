import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  createLease,
  getMyLeases,
  getLease,
  proposeLease,
  fundLease,
  activateLease,
  cancelLease,
  completeLease,
  terminateLease,
  disputeLease,
  resolveDispute,
  getEscrowVerification,
} from '../services/lease.service';
import { CreateLeasePayload, ResolveDisputePayload } from '../types/lease.types';

export const leaseKeys = {
  all: ['leases'] as const,
  mine: () => [...leaseKeys.all, 'mine'] as const,
  detail: (id: string) => [...leaseKeys.all, 'detail', id] as const,
  escrow: (id: string) => [...leaseKeys.all, 'escrow', id] as const,
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

export function useEscrowVerification(id: string) {
  return useQuery({
    queryKey: leaseKeys.escrow(id),
    queryFn: () => getEscrowVerification(id),
    enabled: !!id,
    refetchInterval: 10000, // Polling every 10 seconds for on-chain status
  });
}
