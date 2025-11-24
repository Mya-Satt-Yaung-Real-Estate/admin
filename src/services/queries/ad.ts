import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adAPI } from '../api/ad';
import { ADFormData, ADFilters } from '../../types/ad';
import { QueryParams } from '../api/base';

// Query keys for ads
export const adKeys = {
  all: ['ads'] as const,
  lists: () => [...adKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...adKeys.lists(), params] as const,
  details: () => [...adKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...adKeys.details(), id] as const,
  statistics: () => [...adKeys.all, 'statistics'] as const,
};

// Get list of ads
export const useADs = (params?: ADFilters) => {
  return useQuery({
    queryKey: adKeys.list(params),
    queryFn: () => adAPI.getADs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single ad by ID
export const useAD = (id: number | string) => {
  return useQuery({
    queryKey: adKeys.detail(id),
    queryFn: () => adAPI.getAD(id),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get ad statistics
export const useADStatistics = () => {
  return useQuery({
    queryKey: adKeys.statistics(),
    queryFn: () => adAPI.getStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for statistics)
  });
};

// Create ad
export const useCreateAD = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ADFormData) => adAPI.createAD(data),
    onSuccess: () => {
      // Invalidate and refetch ads lists
      queryClient.invalidateQueries({ queryKey: adKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: adKeys.statistics() });
    },
  });
};

// Update ad by ID
export const useUpdateAD = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<ADFormData> }) =>
      adAPI.updateAD(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch ads lists
      queryClient.invalidateQueries({ queryKey: adKeys.lists() });
      // Invalidate the specific ad to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: adKeys.detail(variables.id) });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: adKeys.statistics() });
    },
  });
};

// Delete ad
export const useDeleteAD = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => adAPI.deleteAD(id),
    onSuccess: (_, id) => {
      // Remove the specific ad from cache using id
      queryClient.removeQueries({ queryKey: adKeys.detail(id) });
      // Invalidate and refetch ads lists
      queryClient.invalidateQueries({ queryKey: adKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: adKeys.statistics() });
    },
  });
};