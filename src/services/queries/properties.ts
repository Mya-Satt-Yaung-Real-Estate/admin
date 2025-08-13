import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesAPI } from '../api/properties';
import { CreatePropertyData, UpdatePropertyData } from '../../types/property';
import { QueryParams } from '../api/base';

// Query keys for properties
export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...propertyKeys.lists(), params] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: number) => [...propertyKeys.details(), id] as const,
  pending: () => [...propertyKeys.all, 'pending'] as const,
  published: () => [...propertyKeys.all, 'published'] as const,
};

// Get list of properties
export const useProperties = (params?: QueryParams) => {
  return useQuery({
    queryKey: propertyKeys.list(params),
    queryFn: () => propertiesAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get list of pending properties
export const usePendingProperties = (params?: QueryParams) => {
  return useQuery({
    queryKey: [...propertyKeys.pending(), params],
    queryFn: () => propertiesAPI.listPending(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for pending)
  });
};

// Get list of published properties
export const usePublishedProperties = (params?: QueryParams) => {
  return useQuery({
    queryKey: [...propertyKeys.published(), params],
    queryFn: () => propertiesAPI.listPublished(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single property
export const useProperty = (id: number) => {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => propertiesAPI.get(id),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create property
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyData) => propertiesAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch properties lists
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.pending() });
    },
  });
};

// Update property
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePropertyData }) =>
      propertiesAPI.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific property in cache
      queryClient.setQueryData(
        propertyKeys.detail(variables.id),
        data
      );
      // Invalidate and refetch properties lists
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
};

// Delete property
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => propertiesAPI.delete(id),
    onSuccess: (_, id) => {
      // Remove the specific property from cache
      queryClient.removeQueries({ queryKey: propertyKeys.detail(id) });
      // Invalidate and refetch properties lists
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
};

// Approve property
export const useApproveProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => propertiesAPI.approve(id),
    onSuccess: (data, id) => {
      // Update the specific property in cache
      queryClient.setQueryData(
        propertyKeys.detail(id),
        data
      );
      // Invalidate and refetch properties lists
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.pending() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.published() });
    },
  });
};

// Reject property
export const useRejectProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      propertiesAPI.reject(id, reason),
    onSuccess: (data, variables) => {
      // Update the specific property in cache
      queryClient.setQueryData(
        propertyKeys.detail(variables.id),
        data
      );
      // Invalidate and refetch properties lists
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.pending() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.published() });
    },
  });
};
