// Location React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsAPI } from '../api/locations';
import { CreateRegionData, UpdateRegionData, CreateTownshipData, UpdateTownshipData } from '../../types/location';
import { QueryParams } from '../api/base';

// Query keys
export const locationKeys = {
  all: ['locations'] as const,
  regions: () => [...locationKeys.all, 'regions'] as const,
  region: (slug: string) => [...locationKeys.regions(), slug] as const,
  townships: () => [...locationKeys.all, 'townships'] as const,
  township: (slug: string) => [...locationKeys.townships(), slug] as const,
};

// Region hooks
export const useRegions = (params?: QueryParams) => {
  return useQuery({
    queryKey: [...locationKeys.regions(), params],
    queryFn: () => locationsAPI.getRegions(params),
  });
};

export const useRegion = (slug: string) => {
  return useQuery({
    queryKey: locationKeys.region(slug),
    queryFn: () => locationsAPI.getRegion(slug),
    enabled: !!slug,
  });
};

export const useCreateRegion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRegionData) => locationsAPI.createRegion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.regions() });
    },
  });
};

export const useUpdateRegion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateRegionData }) =>
      locationsAPI.updateRegion(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.regions() });
      queryClient.invalidateQueries({ queryKey: locationKeys.region(slug) });
    },
  });
};

export const useDeleteRegion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => locationsAPI.deleteRegion(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.regions() });
    },
  });
};

// Township hooks
export const useTownships = (params?: QueryParams) => {
  return useQuery({
    queryKey: [...locationKeys.townships(), params],
    queryFn: () => locationsAPI.getTownships(params),
  });
};

export const useTownship = (slug: string) => {
  return useQuery({
    queryKey: locationKeys.township(slug),
    queryFn: () => locationsAPI.getTownship(slug),
    enabled: !!slug,
  });
};

export const useCreateTownship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTownshipData) => locationsAPI.createTownship(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.townships() });
    },
  });
};

export const useUpdateTownship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateTownshipData }) =>
      locationsAPI.updateTownship(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.townships() });
      queryClient.invalidateQueries({ queryKey: locationKeys.township(slug) });
    },
  });
};

export const useDeleteTownship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => locationsAPI.deleteTownship(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.townships() });
    },
  });
};
