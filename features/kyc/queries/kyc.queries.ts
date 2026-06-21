import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getKycStatus, submitKycDocuments, getKycDocumentUrl } from '@/features/kyc/services/kyc.service';
import type { KycStatusData } from '@/features/kyc/services/kyc.service';

export function useKycStatus() {
  return useQuery({
    queryKey: ['kyc', 'me'],
    queryFn: getKycStatus,
  });
}

export function useSubmitKycDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ files, documentType }: { files: File[]; documentType: string }) =>
      submitKycDocuments(files, documentType),
    onSuccess: (data: KycStatusData) => {
      // Replace the cached KYC data immediately with the server response
      qc.setQueryData(['kyc', 'me'], data);
      toast.success('Documents submitted for review.');
    },
    onError: () => toast.error('Upload failed. Please try again.'),
  });
}

export function useKycDocumentUrl() {
  return useMutation({
    mutationFn: (docId: string) => getKycDocumentUrl(docId),
  });
}
