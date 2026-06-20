import { useQuery } from '@tanstack/react-query';

import { getLiveness, getReadiness } from '../services/health.service';

const healthKeys = {
  all: ['health'] as const,
  liveness: () => [...healthKeys.all, 'liveness'] as const,
  readiness: () => [...healthKeys.all, 'readiness'] as const,
};

export function useLiveness(enabled = true) {
  return useQuery({
    queryKey: healthKeys.liveness(),
    queryFn: getLiveness,
    enabled,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useReadiness(enabled = true) {
  return useQuery({
    queryKey: healthKeys.readiness(),
    queryFn: getReadiness,
    enabled,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}
