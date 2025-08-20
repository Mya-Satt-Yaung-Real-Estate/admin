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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get user by slug
export const useUser = (slug: string) => {
  return useQuery({
    queryKey: userKeys.detail(slug),
    queryFn: () => usersAPI.getUser(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.createUser,
    onSuccess: () => {
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
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

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.deleteUser,
    onSuccess: () => {
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
