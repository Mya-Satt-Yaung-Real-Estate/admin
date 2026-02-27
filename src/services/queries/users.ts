// Users React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../api/users';
import { QueryParams } from '../../types';


// Query keys for users
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (slug: string) => [...userKeys.details(), slug] as const,
};

// Get users list
export const useUsers = (params?: QueryParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersAPI.getUsers(params),
    staleTime: 30 * 1000, // 30 seconds - data becomes stale quickly
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true, // Always refetch when component mounts (page navigation)
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Get user by slug
export const useUser = (slug: string) => {
  return useQuery({
    queryKey: userKeys.detail(slug),
    queryFn: () => usersAPI.getUser(slug),
    enabled: !!slug,
    staleTime: 30 * 1000, // 30 seconds - data becomes stale quickly
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true, // Always refetch when component mounts (page navigation)
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.createUser,
    onSuccess: (response: any) => {
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // If user was created successfully and has a slug, invalidate specific user detail
      if (response?.data?.user?.slug) {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(response.data.user.slug) });
      }
    },
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      usersAPI.updateUser(slug, data),
    onSuccess: (response, { slug }) => {
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.detail(slug) });
      // Update the user detail cache with the new data
      if (response?.data) {
        queryClient.setQueryData(userKeys.detail(slug), response);
      }
    },
  });
};

// Soft delete user
export const useSoftDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.softDeleteUser,
    onSuccess: () => {
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Restore user
export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.restoreUser,
    onSuccess: (response, slug) => {
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.detail(slug) });
      // Update the user detail cache with the new data
      if (response?.data) {
        queryClient.setQueryData(userKeys.detail(slug), response);
      }
    },
  });
};

// Permanent delete user
export const useForceDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.forceDeleteUser,
    onSuccess: () => {
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Clear biometric data for user
export const useClearBiometricUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.clearBiometric,
    onSuccess: (response, slug) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(slug) });
      if (response?.data) {
        queryClient.setQueryData(userKeys.detail(slug), response);
      }
    },
  });
};
