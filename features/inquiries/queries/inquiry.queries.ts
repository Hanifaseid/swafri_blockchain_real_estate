import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { CreateInquiryInput, UpdateInquiryInput } from '@/features/inquiries/types/inquiry.types';
import {
  getMyInquiries,
  getReceivedInquiries,
  sendInquiry,
  updateInquiry,
} from '@/features/inquiries/services/inquiry.service';

const KEYS = {
  mine:     ['inquiries', 'mine']     as const,
  received: ['inquiries', 'received'] as const,
};

export function useMyInquiries() {
  return useQuery({ queryKey: KEYS.mine, queryFn: getMyInquiries });
}

export function useReceivedInquiries() {
  return useQuery({ queryKey: KEYS.received, queryFn: getReceivedInquiries });
}

export function useSendInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInquiryInput) => sendInquiry(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.mine });
      toast.success('Inquiry sent.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateInquiry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateInquiryInput) => updateInquiry(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.received });
      qc.invalidateQueries({ queryKey: KEYS.mine });
      toast.success('Inquiry updated.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAllInquiriesAdmin(params?: import('@/features/inquiries/types/inquiry.types').AdminInquiriesParams) {
  return useQuery({
    queryKey: ['inquiries', 'admin', params],
    queryFn: () => import('@/features/inquiries/services/inquiry.service').then(m => m.getAllInquiriesAdmin(params)),
  });
}
