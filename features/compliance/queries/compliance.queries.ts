import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getComplianceCases,
  updateComplianceCase,
  createScreening,
  getBrokerLicenses,
  submitBrokerLicense,
  reviewBrokerLicense,
  getComplianceNotes,
  createComplianceNote,
  deleteComplianceNote,
} from '../services/compliance.service';
import type {
  UpdateComplianceCaseInput,
  CreateScreeningInput,
  SubmitBrokerLicenseInput,
  ReviewBrokerLicenseInput,
  ComplianceCasesParams,
  BrokerLicensesParams,
} from '../types/compliance.types';

const KEYS = {
  cases: (params?: ComplianceCasesParams) => ['compliance-cases', params] as const,
  case: (id: string) => ['compliance-case', id] as const,
  caseNotes: (id: string) => ['compliance-case-notes', id] as const,
  brokerLicenses: (params?: BrokerLicensesParams) => ['broker-licenses', params] as const,
  brokerLicense: (id: string) => ['broker-license', id] as const,
};

// ─── Compliance Cases ───────────────────────────────────────────────────────────

export function useComplianceCases(params?: ComplianceCasesParams) {
  return useQuery({
    queryKey: KEYS.cases(params),
    queryFn: () => getComplianceCases(params),
  });
}

export function useUpdateComplianceCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateComplianceCaseInput }) =>
      updateComplianceCase(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.cases() });
      toast.success('Case updated.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Screenings ────────────────────────────────────────────────────────────────

export function useCreateScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScreeningInput) => createScreening(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.cases() });
      toast.success('Screening created.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Broker Licenses ───────────────────────────────────────────────────────────

export function useBrokerLicenses(params?: BrokerLicensesParams) {
  return useQuery({
    queryKey: KEYS.brokerLicenses(params),
    queryFn: () => getBrokerLicenses(params),
  });
}

export function useSubmitBrokerLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitBrokerLicenseInput) => submitBrokerLicense(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.brokerLicenses() });
      toast.success('License submitted.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReviewBrokerLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewBrokerLicenseInput }) =>
      reviewBrokerLicense(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.brokerLicenses() });
      toast.success('License reviewed.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Compliance Case Notes ─────────────────────────────────────────────────────

export function useComplianceNotes(caseId: string) {
  return useQuery({
    queryKey: KEYS.caseNotes(caseId),
    queryFn: () => getComplianceNotes(caseId),
    enabled: !!caseId,
  });
}

export function useCreateComplianceNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, input }: { caseId: string; input: { body: string } }) =>
      createComplianceNote(caseId, input),
    onSuccess: (_, { caseId }) => {
      qc.invalidateQueries({ queryKey: KEYS.caseNotes(caseId) });
      toast.success('Note added successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteComplianceNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, noteId }: { caseId: string; noteId: string }) =>
      deleteComplianceNote(caseId, noteId),
    onSuccess: (_, { caseId }) => {
      qc.invalidateQueries({ queryKey: KEYS.caseNotes(caseId) });
      toast.success('Note deleted successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
