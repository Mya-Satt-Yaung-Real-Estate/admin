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
  propertyTypes: () => [...propertyKeys.all, 'propertyTypes'] as const,
  listingTypes: () => [...propertyKeys.all, 'listingTypes'] as const,
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

// Get property types
export const usePropertyTypes = (params?: QueryParams) => {
  return useQuery({
    queryKey: [...propertyKeys.propertyTypes(), params],
    queryFn: () => propertiesAPI.getPropertyTypes(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Get property listing types
export const usePropertyListingTypes = (params?: QueryParams) => {
  return useQuery({
    queryKey: [...propertyKeys.listingTypes(), params],
    queryFn: () => propertiesAPI.getPropertyListingTypes(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};



// Get property type by slug
export const usePropertyType = (slug: string) => {
  return useQuery({
    queryKey: [...propertyKeys.propertyTypes(), 'detail', slug],
    queryFn: () => propertiesAPI.getPropertyType(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create property type
export const useCreatePropertyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => propertiesAPI.createPropertyType(data),
    onSuccess: () => {
      // Invalidate and refetch property types
      queryClient.invalidateQueries({ queryKey: propertyKeys.propertyTypes() });
    },
  });
};

// Update property type
export const useUpdatePropertyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      propertiesAPI.updatePropertyType(slug, data),
    onSuccess: (data, variables) => {
      // Update the specific property type in cache
      queryClient.setQueryData(
        [...propertyKeys.propertyTypes(), 'detail', variables.slug],
        data
      );
      // Invalidate and refetch property types
      queryClient.invalidateQueries({ queryKey: propertyKeys.propertyTypes() });
    },
  });
};

// Delete property type
export const useDeletePropertyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => propertiesAPI.deletePropertyType(slug),
    onSuccess: () => {
      // Invalidate and refetch property types
      queryClient.invalidateQueries({ queryKey: propertyKeys.propertyTypes() });
    },
  });
};

// Get property listing type by slug
export const usePropertyListingType = (slug: string) => {
  return useQuery({
    queryKey: [...propertyKeys.listingTypes(), 'detail', slug],
    queryFn: () => propertiesAPI.getPropertyListingType(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create property listing type
export const useCreatePropertyListingType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => propertiesAPI.createPropertyListingType(data),
    onSuccess: () => {
      // Invalidate and refetch listing types
      queryClient.invalidateQueries({ queryKey: propertyKeys.listingTypes() });
    },
  });
};

// Update property listing type
export const useUpdatePropertyListingType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      propertiesAPI.updatePropertyListingType(slug, data),
    onSuccess: (data, variables) => {
      // Update the specific listing type in cache
      queryClient.setQueryData(
        [...propertyKeys.listingTypes(), 'detail', variables.slug],
        data
      );
      // Invalidate and refetch listing types
      queryClient.invalidateQueries({ queryKey: propertyKeys.listingTypes() });
    },
  });
};

// Delete property listing type
export const useDeletePropertyListingType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => propertiesAPI.deletePropertyListingType(slug),
    onSuccess: () => {
      // Invalidate and refetch listing types
      queryClient.invalidateQueries({ queryKey: propertyKeys.listingTypes() });
    },
  });
};
