import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Inquiry, CreateInquiryInput, UpdateInquiryInput } from '@/features/inquiries/types/inquiry.types';

interface ApiResp<T> { success: boolean; message: string; data: T; }

function extractArray<T>(data: unknown): T[] {
  const d = data as Record<string, unknown>;
  if (Array.isArray(d)) return d as T[];
  if (d?.data && Array.isArray(d.data)) return d.data as T[];
  if (d?.data && typeof d.data === 'object') {
    const nested = d.data as Record<string, unknown>;
    if (Array.isArray(nested.items))    return nested.items as T[];
    if (Array.isArray(nested.inquiries)) return nested.inquiries as T[];
  }
  return [];
}

// ─── getMyInquiries ───────────────────────────────────────────────────────────
// GET /inquiries/mine — inquiries I sent

export async function getMyInquiries(): Promise<Inquiry[]> {
  try {
    const { data } = await apiClient.get(ENDPOINTS.INQUIRIES.MINE);
    return extractArray<Inquiry>(data);
  } catch {
    return [];
  }
}

// ─── getReceivedInquiries ─────────────────────────────────────────────────────
// GET /inquiries/received — inquiries on my listings (OWNER)

export async function getReceivedInquiries(): Promise<Inquiry[]> {
  try {
    const { data } = await apiClient.get(ENDPOINTS.INQUIRIES.RECEIVED);
    return extractArray<Inquiry>(data);
  } catch {
    return [];
  }
}

// ─── sendInquiry ──────────────────────────────────────────────────────────────
// POST /inquiries

export async function sendInquiry(input: CreateInquiryInput): Promise<Inquiry> {
  const { data } = await apiClient.post<ApiResp<Inquiry>>(ENDPOINTS.INQUIRIES.SEND, input);
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// ─── updateInquiry ────────────────────────────────────────────────────────────
// PATCH /inquiries/{id} — owner responds

export async function updateInquiry(id: string, input: UpdateInquiryInput): Promise<Inquiry> {
  const { data } = await apiClient.patch<ApiResp<Inquiry>>(ENDPOINTS.INQUIRIES.UPDATE(id), input);
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// ─── getAllInquiriesAdmin ─────────────────────────────────────────────────────
// GET /inquiries/admin — admin list all inquiries

export async function getAllInquiriesAdmin(params?: import('@/features/inquiries/types/inquiry.types').AdminInquiriesParams): Promise<Inquiry[]> {
  try {
    const { data } = await apiClient.get(ENDPOINTS.INQUIRIES.ADMIN, { params });
    return extractArray<Inquiry>(data);
  } catch {
    return [];
  }
}
