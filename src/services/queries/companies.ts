// Company Types React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesAPI } from '../api/companies';
import { CreateCompanyTypeData, UpdateCompanyTypeData } from '../../types/company';

// Query keys
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: () => [...companyKeys.lists()] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (slug: string) => [...companyKeys.details(), slug] as const,
};

// Get all company types
export const useCompanyTypes = () => {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: () => companiesAPI.getCompanyTypes(),
  });
};

// Get single company type
export const useCompanyType = (slug: string) => {
  return useQuery({
    queryKey: companyKeys.detail(slug),
    queryFn: () => companiesAPI.getCompanyType(slug),
    enabled: !!slug,
  });
};

// Create company type
export const useCreateCompanyType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCompanyTypeData) => companiesAPI.createCompanyType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};

// Update company type
export const useUpdateCompanyType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateCompanyTypeData }) =>
      companiesAPI.updateCompanyType(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(slug) });
    },
  });
};

// Delete company type
export const useDeleteCompanyType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => companiesAPI.deleteCompanyType(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};
