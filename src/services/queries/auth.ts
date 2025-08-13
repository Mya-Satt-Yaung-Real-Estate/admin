import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, LoginCredentials } from '../api/auth';

// Query keys for authentication
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: (response) => {
      // Check if we have the expected data structure
      if (!response.data?.user || !response.data?.token) {
        return;
      }
      
      // The API response structure is: { success: true, message: string, data: { user, token, token_type } }
      // response is ApiResponse<LoginResponse>, so response.data is LoginResponse
      const { user, token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      // Clear localStorage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      // Clear all queries from cache
      queryClient.clear();
    },
  });
};

