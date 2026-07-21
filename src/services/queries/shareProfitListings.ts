/**
 * React Query hooks for Share Profit Listings (Admin → V2 API).
 */
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { shareProfitListingsAPI, ShareProfitListingQueryParams } from '../api/shareProfitListings';
import {
  CreateShareProfitListingData,
  ShareProfitListing,
  UpdateShareProfitListingData,
} from '../../types/shareProfitListing';
import { ApiResponse, QueryParams } from '../api/base';

export const shareProfitListingKeys = {
  all: ['share-profit-listings'] as const,
  lists: () => [...shareProfitListingKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...shareProfitListingKeys.lists(), params] as const,
  details: () => [...shareProfitListingKeys.all, 'detail'] as const,
  detail: (slug: string) => [...shareProfitListingKeys.details(), slug] as const,
  statistics: () => [...shareProfitListingKeys.all, 'statistics'] as const,
};

type ShareProfitListResponse = ApiResponse<ShareProfitListing[]>;

/**
 * Read listing rows from any cached list response shape.
 */
function getListingsFromCache(response?: ShareProfitListResponse): ShareProfitListing[] {
  if (!response?.data) {
    return [];
  }

  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Patch all cached list queries in place so actions do not flash the whole table.
 */
function patchShareProfitListingListCache(
  queryClient: QueryClient,
  patch: (listings: ShareProfitListing[]) => ShareProfitListing[]
) {
  queryClient.setQueriesData<ShareProfitListResponse>(
    { queryKey: shareProfitListingKeys.lists() },
    (old) => {
      if (!old) {
        return old;
      }

      return {
        ...old,
        data: patch(getListingsFromCache(old)),
      };
    }
  );
}

export const useShareProfitListingStatistics = () => {
  return useQuery({
    queryKey: shareProfitListingKeys.statistics(),
    queryFn: () => shareProfitListingsAPI.statistics(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useShareProfitListings = (params?: ShareProfitListingQueryParams) => {
  return useQuery({
    queryKey: shareProfitListingKeys.list(params),
    queryFn: () => shareProfitListingsAPI.list(params),
    staleTime: 5 * 60 * 1000,
    /**
     * Keep current rows visible while background refetch runs (no skeleton flash).
     */
    placeholderData: (previousData) => previousData,
  });
};

export const useShareProfitListing = (slug: string) => {
  return useQuery({
    queryKey: shareProfitListingKeys.detail(slug),
    queryFn: () => shareProfitListingsAPI.get(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateShareProfitListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShareProfitListingData) => shareProfitListingsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shareProfitListingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shareProfitListingKeys.statistics() });
    },
  });
};

export const useUpdateShareProfitListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateShareProfitListingData }) =>
      shareProfitListingsAPI.update(slug, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: shareProfitListingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shareProfitListingKeys.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: shareProfitListingKeys.statistics() });
    },
  });
};

export const useDeleteShareProfitListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => shareProfitListingsAPI.delete(slug),
    onSuccess: (_, slug) => {
      queryClient.removeQueries({ queryKey: shareProfitListingKeys.detail(slug) });
      patchShareProfitListingListCache(queryClient, (listings) =>
        listings.map((item) =>
          item.slug === slug
            ? { ...item, deleted_at: new Date().toISOString() }
            : item
        )
      );
    },
  });
};

export const useRestoreShareProfitListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => shareProfitListingsAPI.restore(slug),
    onSuccess: (response, slug) => {
      const restoredListing = response.data;

      queryClient.setQueryData(shareProfitListingKeys.detail(slug), response);
      patchShareProfitListingListCache(queryClient, (listings) =>
        listings.map((item) =>
          item.slug === slug
            ? {
                ...item,
                ...restoredListing,
                deleted_at: null,
              }
            : item
        )
      );
    },
  });
};

export const useToggleShareProfitListingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => shareProfitListingsAPI.toggleStatus(slug),
    onSuccess: (response, slug) => {
      const toggleData = response.data;

      patchShareProfitListingListCache(queryClient, (listings) =>
        listings.map((item) =>
          item.slug === slug
            ? {
                ...item,
                is_active: toggleData.is_active,
                status: item.status
                  ? {
                      ...item.status,
                      status: toggleData.status as ShareProfitListing['status']['status'],
                    }
                  : item.status,
              }
            : item
        )
      );
    },
  });
};

export const useForceDeleteShareProfitListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => shareProfitListingsAPI.forceDelete(slug),
    onSuccess: (_, slug) => {
      patchShareProfitListingListCache(queryClient, (listings) =>
        listings.filter((item) => item.slug !== slug)
      );
    },
  });
};
