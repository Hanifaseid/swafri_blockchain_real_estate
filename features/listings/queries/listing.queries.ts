import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type {
  CreateListingInput,
  ListingFilters,
  TransitionInput,
  CreateSavedSearchInput,
  CreateMaintenanceRecordInput,
} from "@/features/listings/types/listing.types";
import {
  getListings,
  getListingClusters,
  geocode,
  reverseGeocode,
  getNeighborhoods,
  getNeighborhoodAnalytics,
  getMyListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  transitionListing,
  getAdminListings,
  getAdminListingsStats,
  getListingAnalytics,
  getListingYield,
  getMaintenanceRecords,
  createMaintenanceRecord,
  getListingDashboard,
  getListingDocuments,
  getDocumentSignedUrl,
  reviewDocument,
  getListingDuplicates,
  uploadPhotos,
  deletePhoto,
  setCoverPhoto,
  reorderPhotos,
  getListingTitle,
  mintTitle,
  disputeTitle,
  clearTitleDispute,
  revokeTitle,
  createSavedSearch,
  getSavedSearches,
  updateSavedSearch,
  deleteSavedSearch,
} from "@/features/listings/services/listing.service";

const KEYS = {
  all: ["listings"] as const,
  discover: (f: object) => ["listings", "discover", f] as const,
  mine: () => ["listings", "mine"] as const,
  detail: (id: string) => ["listings", "detail", id] as const,
  adminList: (p: object) => ["listings", "admin", p] as const,
  clusters: (f: object) => ["listings", "clusters", f] as const,
  savedSearches: () => ["saved-searches"] as const,
};

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: KEYS.discover(filters ?? {}),
    queryFn: () => getListings(filters),
  });
}

export function useListingClusters(filters?: ListingFilters & { zoom?: number }) {
  return useQuery({
    queryKey: KEYS.clusters(filters ?? {}),
    queryFn: () => getListingClusters(filters),
  });
}

export function useGeocode(query: string) {
  return useQuery({
    queryKey: ["geo", "geocode", query],
    queryFn: () => geocode(query),
    enabled: query.trim().length >= 3,
  });
}

export function useReverseGeocode(lat?: number, lng?: number) {
  return useQuery({
    queryKey: ["geo", "reverse", lat, lng],
    queryFn: () => reverseGeocode(lat as number, lng as number),
    enabled: Number.isFinite(lat) && Number.isFinite(lng),
  });
}

export function useNeighborhoods(params?: {
  city?: string;
  country?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["geo", "neighborhoods", params ?? {}],
    queryFn: () => getNeighborhoods(params),
  });
}

export function useNeighborhoodAnalytics(id?: string) {
  return useQuery({
    queryKey: ["geo", "neighborhoods", id, "analytics"],
    queryFn: () => getNeighborhoodAnalytics(id as string),
    enabled: !!id,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: KEYS.mine(),
    queryFn: getMyListings,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getListing(id),
    enabled: !!id,
  });
}

export function useAdminListings(params?: Record<string, string | number>) {
  return useQuery({
    queryKey: KEYS.adminList(params ?? {}),
    queryFn: () => getAdminListings(params),
  });
}

export function useAdminListingsStats() {
  return useQuery({
    queryKey: ["listings", "admin", "stats"],
    queryFn: getAdminListingsStats,
  });
}

export function useSaveSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSavedSearchInput) => createSavedSearch(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.savedSearches() });
      toast.success("Search saved successfully.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSavedSearches() {
  return useQuery({
    queryKey: KEYS.savedSearches(),
    queryFn: getSavedSearches,
  });
}

export function useUpdateSavedSearch(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateSavedSearchInput>) =>
      updateSavedSearch(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.savedSearches() });
      toast.success("Search updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSavedSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSavedSearch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.savedSearches() });
      toast.success("Search deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingInput) => createListing(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.mine() });
      toast.success("Listing created as draft.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateListingInput>) =>
      updateListing(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.mine() });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success("Listing updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.mine() });
      toast.success("Listing deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTransitionListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransitionInput) => transitionListing(id, input),
    onSuccess: (listing) => {
      qc.invalidateQueries({ queryKey: KEYS.mine() });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success(`Listing ${listing.status}.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Analytics + Dashboard ────────────────────────────────────────────────────

export function useListingAnalytics(id: string) {
  return useQuery({
    queryKey: ["listings", "analytics", id],
    queryFn: () => getListingAnalytics(id),
    enabled: !!id,
  });
}

export function useListingYield(id: string) {
  return useQuery({
    queryKey: ["listings", "yield", id],
    queryFn: () => getListingYield(id),
    enabled: !!id,
  });
}

export function useMaintenanceRecords(id: string) {
  return useQuery({
    queryKey: ["listings", "maintenance", id],
    queryFn: () => getMaintenanceRecords(id),
    enabled: !!id,
  });
}

export function useCreateMaintenanceRecord(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMaintenanceRecordInput) =>
      createMaintenanceRecord(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings", "maintenance", id] });
      qc.invalidateQueries({ queryKey: ["listings", "yield", id] });
      toast.success("Maintenance record added.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useListingDashboard() {
  return useQuery({
    queryKey: ["listings", "dashboard"],
    queryFn: getListingDashboard,
  });
}

// ─── Documents ────────────────────────────────────────────────────────────────

export function useListingDocuments(id: string) {
  return useQuery({
    queryKey: ["listings", "documents", id],
    queryFn: () => getListingDocuments(id),
    enabled: !!id,
  });
}

export function useDocumentSignedUrl() {
  return useMutation({
    mutationFn: ({ listingId, docId }: { listingId: string; docId: string }) =>
      getDocumentSignedUrl(listingId, docId),
    onError: () => toast.error("Failed to get document URL."),
  });
}

export function useReviewDocument(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, input }: { docId: string; input: { decision: "approve" | "reject"; note?: string } }) =>
      reviewDocument(listingId, docId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings", "documents", listingId] });
      qc.invalidateQueries({ queryKey: KEYS.detail(listingId) });
      toast.success("Document reviewed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useListingDuplicates(id: string) {
  return useQuery({
    queryKey: ["listings", "duplicates", id],
    queryFn: () => getListingDuplicates(id),
    enabled: !!id,
  });
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export function useUploadPhotos(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => uploadPhotos(id, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success("Photos uploaded.");
    },
    onError: (error: any) => {
      const msg = error?.message || "Photo upload failed.";
      toast.error(msg);
    },
  });
}

export function useDeletePhoto(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => deletePhoto(id, publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success("Photo removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSetCoverPhoto(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => setCoverPhoto(id, publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success("Cover photo updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReorderPhotos(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: string[]) => reorderPhotos(id, order),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success("Photos reordered.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── On-chain title ───────────────────────────────────────────────────────────

export function useListingTitle(id: string) {
  return useQuery({
    queryKey: ["listings", "title", id],
    queryFn: () => getListingTitle(id),
    enabled: !!id,
    retry: false,
  });
}

export function useMintTitle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => mintTitle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings", "title", id] });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success("Title minted on-chain.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDisputeTitle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => disputeTitle(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success("Title disputed. Listing suspended.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useClearTitleDispute(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => clearTitleDispute(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success("Dispute cleared. Listing restored.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRevokeTitle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => revokeTitle(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success("Title revoked. Listing archived.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
