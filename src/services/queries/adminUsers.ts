import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersAPI } from '../api/adminUsers';
import { CreateAdminUserData, UpdateAdminUserData } from '../../types/admin';
import { QueryParams } from '../api/base';

// Query keys for admin users
export const adminUserKeys = {
  all: ['adminUsers'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...adminUserKeys.lists(), params] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (slug: string) => [...adminUserKeys.details(), slug] as const,
};

// Get list of admin users
export const useAdminUsers = (params?: QueryParams) => {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => adminUsersAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single admin user
export const useAdminUser = (slug: string) => {
  return useQuery({
    queryKey: adminUserKeys.detail(slug),
    queryFn: async () => {
      const response = await adminUsersAPI.get(slug);
      return { data: response.data.user };
    },
    enabled: !!slug, // Only run if slug exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create admin user
export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdminUserData) => {
      const response = await adminUsersAPI.create(data);
      return { data: response.data.user };
    },
    onSuccess: () => {
      // Invalidate and refetch admin users list
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};

// Update admin user
export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: UpdateAdminUserData }) => {
      const response = await adminUsersAPI.update(slug, data);
      return { data: response.data.data };
    },
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(
        adminUserKeys.detail(variables.slug),
        data
      );
      // Invalidate and refetch admin users list
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};

// Delete admin user
export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => adminUsersAPI.delete(slug),
    onSuccess: (_, slug) => {
      // Remove the specific user from cache
      queryClient.removeQueries({ queryKey: adminUserKeys.detail(slug) });
      // Invalidate and refetch admin users list
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};
