import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  submitRentalApplication,
  getMyRentalApplications,
  getRentalApplication,
  withdrawRentalApplication,
  reviewRentalApplication,
  updateScreening,
  updateAppointment,
  createLeaseFromApplication
} from '../services/rental-application.service';
import type { 
  SubmitRentalApplicationPayload,
  ReviewApplicationPayload,
  ScreeningUpdatePayload,
  AppointmentUpdatePayload,
  CreateLeasePayload
} from '../types/rental-application.types';

export const rentalAppKeys = {
  all: ['rental-applications'] as const,
  mine: () => [...rentalAppKeys.all, 'mine'] as const,
  detail: (id: string) => [...rentalAppKeys.all, id] as const,
};

export function useSubmitRentalApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitRentalApplicationPayload) => submitRentalApplication(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rentalAppKeys.mine() });
      toast.success('Rental application submitted successfully.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMyRentalApplications() {
  return useQuery({
    queryKey: rentalAppKeys.mine(),
    queryFn: getMyRentalApplications,
  });
}

export function useRentalApplication(id: string) {
  return useQuery({
    queryKey: rentalAppKeys.detail(id),
    queryFn: () => getRentalApplication(id),
    enabled: !!id,
  });
}

export function useWithdrawRentalApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawRentalApplication(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: rentalAppKeys.mine() });
      qc.invalidateQueries({ queryKey: rentalAppKeys.detail(id) });
      toast.success('Application withdrawn.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useReviewRentalApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewApplicationPayload }) => 
      reviewRentalApplication(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: rentalAppKeys.detail(id) });
      qc.invalidateQueries({ queryKey: rentalAppKeys.mine() });
      toast.success('Application review updated.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ScreeningUpdatePayload }) => 
      updateScreening(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: rentalAppKeys.detail(id) });
      toast.success('Screening status updated.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AppointmentUpdatePayload }) => 
      updateAppointment(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: rentalAppKeys.detail(id) });
      toast.success('Appointment status updated.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateLeaseFromApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateLeasePayload }) => 
      createLeaseFromApplication(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: rentalAppKeys.detail(id) });
      toast.success('Lease created successfully.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
