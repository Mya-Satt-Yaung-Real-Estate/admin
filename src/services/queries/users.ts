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
  detail: (id: number) => [...userKeys.details(), id] as const,
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

// Get user by ID
export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersAPI.getUser(id),
    enabled: !!id,
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
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      usersAPI.updateUser(id, data),
    onSuccess: () => {
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.deleteUser,
    onSuccess: (_data, variables) => {
      // Remove the specific user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(variables) });
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
