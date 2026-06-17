import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getKycStatus, submitKycDocuments } from '@/features/kyc/services/kyc.service';

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
    onSuccess: (ok) => {
      if (ok) {
        qc.invalidateQueries({ queryKey: ['kyc'] });
        toast.success('Documents submitted for review.');
      } else {
        toast.error('Failed to submit documents.');
      }
    },
    onError: () => toast.error('Upload failed. Please try again.'),
  });
}
