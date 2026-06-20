import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  geocode,
  reverseGeocode,
  getNeighborhoods,
  getNeighborhoodDetail,
  getNeighborhoodAnalytics,
} from '../services/geo.service';

const geoKeys = {
  all: ['geo'] as const,
  geocode: (query: string) => [...geoKeys.all, 'geocode', query] as const,
  reverse: (lat: number, lng: number) => [...geoKeys.all, 'reverse', lat, lng] as const,
  neighborhoods: (p?: object) => [...geoKeys.all, 'neighborhoods', p] as const,
  neighborhoodDetail: (id: string) => [...geoKeys.all, 'neighborhood', id] as const,
  neighborhoodAnalytics: (id: string) => [...geoKeys.all, 'neighborhood-analytics', id] as const,
};

export function useGeocode(query: string, enabled = true) {
  return useQuery({
    queryKey: geoKeys.geocode(query),
    queryFn: () => geocode(query),
    enabled: !!query && enabled,
  });
}

export function useReverseGeocode(lat: number, lng: number, enabled = true) {
  return useQuery({
    queryKey: geoKeys.reverse(lat, lng),
    queryFn: () => reverseGeocode(lat, lng),
    enabled: enabled,
  });
}

export function useNeighborhoods(params?: {
  city?: string;
  region?: string;
  country?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: geoKeys.neighborhoods(params),
    queryFn: () => getNeighborhoods(params),
  });
}

export function useNeighborhoodDetail(id: string) {
  return useQuery({
    queryKey: geoKeys.neighborhoodDetail(id),
    queryFn: () => getNeighborhoodDetail(id),
    enabled: !!id,
  });
}

export function useNeighborhoodAnalytics(id: string) {
  return useQuery({
    queryKey: geoKeys.neighborhoodAnalytics(id),
    queryFn: () => getNeighborhoodAnalytics(id),
    enabled: !!id,
  });
}
