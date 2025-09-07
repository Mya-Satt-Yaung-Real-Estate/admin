import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventCategoryAPI, eventAPI } from '../api/events';
import { 
  CreateHousingEventCategoryData, 
  UpdateHousingEventCategoryData,
  HousingEventCategoryFilters,
  CreateHousingEventData,
  UpdateHousingEventData,
  HousingEventFilters
} from '../../types/event';

// Query keys for event categories
export const eventCategoryKeys = {
  all: ['event-categories'] as const,
  lists: () => [...eventCategoryKeys.all, 'list'] as const,
  list: (params?: HousingEventCategoryFilters) => [...eventCategoryKeys.lists(), params] as const,
  details: () => [...eventCategoryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...eventCategoryKeys.details(), slug] as const,
};

// Query keys for events
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params?: HousingEventFilters) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (slug: string) => [...eventKeys.details(), slug] as const,
};

// Event Category Hooks
export const useEventCategories = (params?: HousingEventCategoryFilters) => {
  return useQuery({
    queryKey: eventCategoryKeys.list(params),
    queryFn: () => eventCategoryAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEventCategory = (slug: string) => {
  return useQuery({
    queryKey: eventCategoryKeys.detail(slug),
    queryFn: () => eventCategoryAPI.get(slug),
    enabled: !!slug,
  });
};

export const useCreateEventCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHousingEventCategoryData) => eventCategoryAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch event categories lists
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.lists() });
    },
  });
};

export const useUpdateEventCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateHousingEventCategoryData }) =>
      eventCategoryAPI.update(slug, data),
    onSuccess: (_, { slug }) => {
      // Invalidate and refetch event categories lists and specific detail
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.detail(slug) });
    },
  });
};

export const useDeleteEventCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => eventCategoryAPI.delete(slug),
    onSuccess: () => {
      // Invalidate and refetch event categories lists
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.lists() });
    },
  });
};

export const useRestoreEventCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => eventCategoryAPI.restore(slug),
    onSuccess: (_, slug) => {
      // Invalidate and refetch event categories lists and specific detail
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.detail(slug) });
    },
  });
};

export const useForceDeleteEventCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => eventCategoryAPI.forceDelete(slug),
    onSuccess: () => {
      // Invalidate and refetch event categories lists
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.lists() });
    },
  });
};

// Event Hooks
export const useEvents = (params?: HousingEventFilters) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEvent = (slug: string) => {
  return useQuery({
    queryKey: eventKeys.detail(slug),
    queryFn: () => eventAPI.get(slug),
    enabled: !!slug,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHousingEventData) => eventAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch events lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateHousingEventData }) =>
      eventAPI.update(slug, data),
    onSuccess: (_, { slug }) => {
      // Invalidate and refetch events lists and specific detail
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(slug) });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => eventAPI.delete(slug),
    onSuccess: () => {
      // Invalidate and refetch events lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
};

export const useRestoreEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => eventAPI.restore(slug),
    onSuccess: (_, slug) => {
      // Invalidate and refetch events lists and specific detail
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(slug) });
    },
  });
};

export const useForceDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => eventAPI.forceDelete(slug),
    onSuccess: () => {
      // Invalidate and refetch events lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
};
