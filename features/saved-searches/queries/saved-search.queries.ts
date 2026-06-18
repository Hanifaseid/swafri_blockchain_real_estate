import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
} from '@/features/saved-searches/services/saved-search.service';
import type {
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
} from '@/features/saved-searches/types/saved-search.types';

const KEYS = {
  all: ['saved-searches'] as const,
};

export function useSavedSearches() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn:  getSavedSearches,
  });
}

export function useCreateSavedSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSavedSearchInput) => createSavedSearch(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Search saved.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateSavedSearch(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSavedSearchInput) => updateSavedSearch(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Search updated.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSavedSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSavedSearch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Search removed.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
