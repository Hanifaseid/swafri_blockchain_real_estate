import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Inquiry, CreateInquiryInput, UpdateInquiryInput } from '@/features/inquiries/types/inquiry.types';

interface ApiResp<T> { success: boolean; message: string; data: T; }

type RawItem = Record<string, unknown>;

function normalizeId(item: RawItem): RawItem {
  // MongoDB returns _id; normalize it to id so the rest of the UI can use inquiry.id safely
  if (!item.id && item._id) return { ...item, id: item._id };
  return item;
}

function extractArray<T>(data: unknown): T[] {
  const d = data as RawItem;
  let arr: RawItem[] = [];

  if (Array.isArray(d)) {
    arr = d as RawItem[];
  } else if (d?.data && Array.isArray(d.data)) {
    arr = d.data as RawItem[];
  } else if (d?.data && typeof d.data === 'object') {
    const nested = d.data as RawItem;
    if (Array.isArray(nested.items))      arr = nested.items as RawItem[];
    else if (Array.isArray(nested.inquiries)) arr = nested.inquiries as RawItem[];
  }

  return arr.map(normalizeId) as T[];
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
