import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactUsAPI } from '../api/contactUs';
import { ContactUsQueryParams } from '@/types/contactUs';

// Query keys for contact us
export const contactUsKeys = {
  all: ['contact-us'] as const,
  lists: () => [...contactUsKeys.all, 'list'] as const,
  list: (params?: ContactUsQueryParams) => [...contactUsKeys.lists(), params] as const,
  details: () => [...contactUsKeys.all, 'detail'] as const,
  detail: (slug: string) => [...contactUsKeys.details(), slug] as const,
};

// Get contact us list
export const useContactUs = (params?: ContactUsQueryParams) => {
  return useQuery({
    queryKey: contactUsKeys.list(params),
    queryFn: () => contactUsAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single contact us record
export const useContactUsDetail = (slug: string) => {
  return useQuery({
    queryKey: contactUsKeys.detail(slug),
    queryFn: () => contactUsAPI.get(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Delete contact us mutation
export const useDeleteContactUs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => contactUsAPI.delete(slug),
    onSuccess: () => {
      // Invalidate and refetch contact us list
      queryClient.invalidateQueries({ queryKey: contactUsKeys.lists() });
    },
  });
};

// Restore contact us mutation
export const useRestoreContactUs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => contactUsAPI.restore(slug),
    onSuccess: () => {
      // Invalidate and refetch contact us list
      queryClient.invalidateQueries({ queryKey: contactUsKeys.lists() });
    },
  });
};

// Force delete contact us mutation
export const useForceDeleteContactUs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => contactUsAPI.forceDelete(slug),
    onSuccess: () => {
      // Invalidate and refetch contact us list
      queryClient.invalidateQueries({ queryKey: contactUsKeys.lists() });
    },
  });
};
