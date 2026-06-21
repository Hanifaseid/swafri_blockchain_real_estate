import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSystemSettings, updateSystemSettings } from '../services/settings.service';
import type { UpdateSettingsPayload } from '../types/settings.types';

export const settingsKeys = {
  all:    ['settings'] as const,
  system: () => [...settingsKeys.all, 'system'] as const,
};

export function useSystemSettings() {
  return useQuery({
    queryKey: settingsKeys.system(),
    queryFn:  getSystemSettings,
    staleTime: 60_000,
  });
}

export function useUpdateSystemSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateSystemSettings(payload),
    onSuccess: (data) => {
      qc.setQueryData(settingsKeys.system(), data);
      toast.success('Settings saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
