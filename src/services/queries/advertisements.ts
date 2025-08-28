import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advertisementAPI } from '../api/advertisements';
import { AdvertisementFormData, AdvertisementFilters } from '../../types/advertisement';
import { QueryParams } from '../api/base';

// Query keys for advertisements
export const advertisementKeys = {
  all: ['advertisements'] as const,
  lists: () => [...advertisementKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...advertisementKeys.lists(), params] as const,
  details: () => [...advertisementKeys.all, 'detail'] as const,
  detail: (id: number) => [...advertisementKeys.details(), id] as const,
  statistics: () => [...advertisementKeys.all, 'statistics'] as const,
};

// Get list of advertisements
export const useAdvertisements = (params?: AdvertisementFilters) => {
  return useQuery({
    queryKey: advertisementKeys.list(params),
    queryFn: () => advertisementAPI.getAdvertisements(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single advertisement
export const useAdvertisement = (id: number) => {
  return useQuery({
    queryKey: advertisementKeys.detail(id),
    queryFn: () => advertisementAPI.getAdvertisement(id),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get advertisement statistics
export const useAdvertisementStatistics = () => {
  return useQuery({
    queryKey: advertisementKeys.statistics(),
    queryFn: () => advertisementAPI.getStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for statistics)
  });
};

// Create advertisement
export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdvertisementFormData) => advertisementAPI.createAdvertisement(data),
    onSuccess: () => {
      // Invalidate and refetch advertisements lists
      queryClient.invalidateQueries({ queryKey: advertisementKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: advertisementKeys.statistics() });
    },
  });
};

// Update advertisement
export const useUpdateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AdvertisementFormData> }) =>
      advertisementAPI.updateAdvertisement(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch advertisements lists
      queryClient.invalidateQueries({ queryKey: advertisementKeys.lists() });
      // Invalidate the specific advertisement to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: advertisementKeys.detail(variables.id) });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: advertisementKeys.statistics() });
    },
  });
};

// Delete advertisement
export const useDeleteAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => advertisementAPI.deleteAdvertisement(id),
    onSuccess: (_, id) => {
      // Remove the specific advertisement from cache
      queryClient.removeQueries({ queryKey: advertisementKeys.detail(id) });
      // Invalidate and refetch advertisements lists
      queryClient.invalidateQueries({ queryKey: advertisementKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: advertisementKeys.statistics() });
    },
  });
};

// Approve advertisement
export const useApproveAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => advertisementAPI.approveAdvertisement(id),
    onSuccess: (_data, id) => {
      // Invalidate and refetch advertisements lists
      queryClient.invalidateQueries({ queryKey: advertisementKeys.lists() });
      // Invalidate the specific advertisement
      queryClient.invalidateQueries({ queryKey: advertisementKeys.detail(id) });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: advertisementKeys.statistics() });
    },
  });
};

// Reject advertisement
export const useRejectAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      advertisementAPI.rejectAdvertisement(id, reason),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch advertisements lists
      queryClient.invalidateQueries({ queryKey: advertisementKeys.lists() });
      // Invalidate the specific advertisement
      queryClient.invalidateQueries({ queryKey: advertisementKeys.detail(variables.id) });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: advertisementKeys.statistics() });
    },
  });
};



// Renew advertisement
export const useRenewAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => advertisementAPI.renewAdvertisement(id),
    onSuccess: (_data, id) => {
      // Invalidate and refetch advertisements lists
      queryClient.invalidateQueries({ queryKey: advertisementKeys.lists() });
      // Invalidate the specific advertisement
      queryClient.invalidateQueries({ queryKey: advertisementKeys.detail(id) });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: advertisementKeys.statistics() });
    },
  });
};


