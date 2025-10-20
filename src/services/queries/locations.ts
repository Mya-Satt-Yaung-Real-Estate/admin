// Location React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsAPI } from '../api/locations';
import { CreateRegionData, UpdateRegionData, CreateTownshipData, UpdateTownshipData, CreateWardData, UpdateWardData, CreateYarpyatTaxData, UpdateYarpyatTaxData } from '../../types/location';
import { QueryParams } from '../api/base';

// Query keys
export const locationKeys = {
  all: ['locations'] as const,
  regions: () => [...locationKeys.all, 'regions'] as const,
  region: (slug: string) => [...locationKeys.regions(), slug] as const,
  townships: () => [...locationKeys.all, 'townships'] as const,
  township: (slug: string) => [...locationKeys.townships(), slug] as const,
  wards: () => [...locationKeys.all, 'wards'] as const,
  ward: (slug: string) => [...locationKeys.wards(), slug] as const,
  yarpyatTaxes: () => [...locationKeys.all, 'yarpyatTaxes'] as const,
  yarpyatTax: (slug: string) => [...locationKeys.yarpyatTaxes(), slug] as const,
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

// Ward hooks
export const useWards = (params?: QueryParams) => {
  return useQuery({
    queryKey: [...locationKeys.wards(), params],
    queryFn: () => locationsAPI.getWards(params),
  });
};

export const useWard = (slug: string) => {
  return useQuery({
    queryKey: locationKeys.ward(slug),
    queryFn: () => locationsAPI.getWard(slug),
    enabled: !!slug,
  });
};

export const useCreateWard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWardData) => locationsAPI.createWard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.wards() });
    },
  });
};

export const useUpdateWard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateWardData }) =>
      locationsAPI.updateWard(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.wards() });
      queryClient.invalidateQueries({ queryKey: locationKeys.ward(slug) });
    },
  });
};

export const useDeleteWard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => locationsAPI.deleteWard(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.wards() });
    },
  });
};

// YarpyatTax hooks
export const useYarpyatTaxes = (params?: QueryParams) => {
  return useQuery({
    queryKey: [...locationKeys.yarpyatTaxes(), params],
    queryFn: () => locationsAPI.getYarpyatTaxes(params),
  });
};

export const useYarpyatTax = (slug: string) => {
  return useQuery({
    queryKey: locationKeys.yarpyatTax(slug),
    queryFn: () => locationsAPI.getYarpyatTax(slug),
    enabled: !!slug,
  });
};

export const useCreateYarpyatTax = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateYarpyatTaxData) => locationsAPI.createYarpyatTax(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.yarpyatTaxes() });
    },
  });
};

export const useUpdateYarpyatTax = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateYarpyatTaxData }) =>
      locationsAPI.updateYarpyatTax(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.yarpyatTaxes() });
      queryClient.invalidateQueries({ queryKey: locationKeys.yarpyatTax(slug) });
    },
  });
};

export const useDeleteYarpyatTax = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => locationsAPI.deleteYarpyatTax(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.yarpyatTaxes() });
    },
  });
};
