import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ComplianceCase,
  UpdateComplianceCaseInput,
  Screening,
  CreateScreeningInput,
  BrokerLicense,
  SubmitBrokerLicenseInput,
  ReviewBrokerLicenseInput,
  ComplianceCasesParams,
  BrokerLicensesParams,
  ComplianceNote,
  CreateNoteInput,
} from '../types/compliance.types';

type RawItem = Record<string, unknown>;

function normalizeId(item: RawItem): RawItem {
  if (!item.id && item._id) return { ...item, id: item._id };
  return item;
}

function extractArray<T>(data: unknown): T[] {
  const d = data as RawItem;
  let arr: RawItem[] = [];
  if (Array.isArray(d)) arr = d;
  else if (Array.isArray(d?.data)) arr = d.data as RawItem[];
  else if (Array.isArray((d?.data as RawItem)?.items)) arr = (d.data as RawItem).items as RawItem[];
  return arr.map(normalizeId) as T[];
}

function extractOne<T>(data: unknown): T {
  const d = data as RawItem;
  const item = (d?.data ?? d) as RawItem;
  return normalizeId(item) as T;
}

function extractPaginated<T>(data: unknown): { items: T[]; total: number; page: number; limit: number } {
  const d = data as RawItem;
  const nested = (d?.data ?? d) as RawItem;
  return {
    items: extractArray<T>(nested),
    total: (nested.total as number) ?? 0,
    page: (nested.page as number) ?? 1,
    limit: (nested.limit as number) ?? 20,
  };
}

// ─── Compliance Cases ───────────────────────────────────────────────────────────

export async function getComplianceCases(params?: ComplianceCasesParams): Promise<{
  items: ComplianceCase[];
  total: number;
  page: number;
  limit: number;
}> {
  const { data } = await apiClient.get(ENDPOINTS.ADMIN.COMPLIANCE_CASES, { params });
  return extractPaginated<ComplianceCase>(data);
}

export async function updateComplianceCase(
  id: string,
  input: UpdateComplianceCaseInput,
): Promise<ComplianceCase> {
  const { data } = await apiClient.patch(ENDPOINTS.ADMIN.COMPLIANCE_CASE(id), input);
  return extractOne<ComplianceCase>(data);
}

// ─── Screenings ────────────────────────────────────────────────────────────────

export async function createScreening(input: CreateScreeningInput): Promise<Screening> {
  const { data } = await apiClient.post(ENDPOINTS.ADMIN.SCREENINGS, input);
  return extractOne<Screening>(data);
}

// ─── Broker Licenses ───────────────────────────────────────────────────────────

export async function getBrokerLicenses(params?: BrokerLicensesParams): Promise<BrokerLicense[]> {
  const { data } = await apiClient.get(ENDPOINTS.ADMIN.BROKER_LICENSES, { params });
  return extractArray<BrokerLicense>(data);
}

export async function submitBrokerLicense(input: SubmitBrokerLicenseInput): Promise<BrokerLicense> {
  const { data } = await apiClient.post(ENDPOINTS.ADMIN.BROKER_LICENSES, input);
  return extractOne<BrokerLicense>(data);
}

export async function reviewBrokerLicense(
  id: string,
  input: ReviewBrokerLicenseInput,
): Promise<BrokerLicense> {
  const { data } = await apiClient.post(ENDPOINTS.ADMIN.BROKER_LICENSE(id), input);
  return extractOne<BrokerLicense>(data);
}

// ─── Compliance Case Notes ───────────────────────────────────────────────────────

export async function getComplianceNotes(caseId: string): Promise<ComplianceNote[]> {
  try {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.COMPLIANCE_NOTES(caseId));
    return extractArray<ComplianceNote>(data);
  } catch {
    return [];
  }
}

export async function createComplianceNote(
  caseId: string,
  input: CreateNoteInput,
): Promise<ComplianceNote> {
  const { data } = await apiClient.post(ENDPOINTS.ADMIN.COMPLIANCE_NOTES(caseId), input);
  return extractOne<ComplianceNote>(data);
}

export async function deleteComplianceNote(
  caseId: string,
  noteId: string,
): Promise<void> {
  await apiClient.delete(ENDPOINTS.ADMIN.COMPLIANCE_NOTE(caseId, noteId));
}
