import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wantingListingsAPI, WantingListQueryParams } from '../api/wantingListings';
import { CreateWantingListData, UpdateWantingListData } from '../../types/wantedListing';
import { QueryParams } from '../api/base';

// Query keys for wanting lists
export const wantingListKeys = {
  all: ['wanting-lists'] as const,
  lists: () => [...wantingListKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...wantingListKeys.lists(), params] as const,
  details: () => [...wantingListKeys.all, 'detail'] as const,
  detail: (slug: string) => [...wantingListKeys.details(), slug] as const,
  statistics: () => [...wantingListKeys.all, 'statistics'] as const,
};

// Get wanting lists statistics
export const useWantingListStatistics = () => {
  return useQuery({
    queryKey: wantingListKeys.statistics(),
    queryFn: () => wantingListingsAPI.statistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes - statistics can be cached longer
  });
};

// Get list of wanting lists
export const useWantingLists = (params?: WantingListQueryParams) => {
  return useQuery({
    queryKey: wantingListKeys.list(params),
    queryFn: () => wantingListingsAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single wanting list
export const useWantingList = (slug: string) => {
  return useQuery({
    queryKey: wantingListKeys.detail(slug),
    queryFn: () => wantingListingsAPI.get(slug),
    enabled: !!slug, // Only run if slug exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create wanting list
export const useCreateWantingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWantingListData) => wantingListingsAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch wanting lists lists
      queryClient.invalidateQueries({ queryKey: wantingListKeys.lists() });
    },
  });
};

// Update wanting list
export const useUpdateWantingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateWantingListData }) =>
      wantingListingsAPI.update(slug, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch wanting lists lists
      queryClient.invalidateQueries({ queryKey: wantingListKeys.lists() });
      // Invalidate the specific wanting list to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: wantingListKeys.detail(variables.slug) });
    },
  });
};

// Delete wanting list
export const useDeleteWantingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => wantingListingsAPI.delete(slug),
    onSuccess: (_, slug) => {
      // Remove the specific wanting list from cache
      queryClient.removeQueries({ queryKey: wantingListKeys.detail(slug) });
      // Invalidate and refetch wanting lists lists
      queryClient.invalidateQueries({ queryKey: wantingListKeys.lists() });
    },
  });
};

// Restore wanting list
export const useRestoreWantingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => wantingListingsAPI.restore(slug),
    onSuccess: (data, slug) => {
      // Update the specific wanting list in cache
      queryClient.setQueryData(
        wantingListKeys.detail(slug),
        data
      );
      // Invalidate and refetch wanting lists lists
      queryClient.invalidateQueries({ queryKey: wantingListKeys.lists() });
    },
  });
};

// Toggle wanting list status
export const useToggleWantingListStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => wantingListingsAPI.toggleStatus(slug),
    onSuccess: (data, slug) => {
      // Update the specific wanting list in cache
      queryClient.setQueryData(
        wantingListKeys.detail(slug),
        data
      );
      // Invalidate and refetch wanting lists lists
      queryClient.invalidateQueries({ queryKey: wantingListKeys.lists() });
    },
  });
};

// Force delete wanting list
export const useForceDeleteWantingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => wantingListingsAPI.forceDelete(slug),
    onSuccess: () => {
      // Invalidate and refetch wanting lists lists
      queryClient.invalidateQueries({ queryKey: wantingListKeys.lists() });
    },
  });
};