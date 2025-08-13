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

// Logout mutation with comprehensive cleanup
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        // Attempt to call the logout API
        const response = await authAPI.logout();
        return response;
      } catch (error) {
        // Log the error but don't throw it
        console.warn('Logout API call failed:', error);
        // Return a mock success response to continue with local cleanup
        return {
          success: true,
          message: 'Logged out locally',
          data: null,
        };
      }
    },
    onSuccess: (response) => {
      console.log('Logout successful:', response.message);
      
      // Clear all localStorage items related to authentication
      const authKeys = [
        'admin_token',
        'admin_user',
        'auth-storage', // Zustand persisted state
      ];
      
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove localStorage key ${key}:`, error);
        }
      });
      
      // Clear sessionStorage if any auth data is stored there
      try {
        sessionStorage.clear();
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error);
      }
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Reset any other application state that might persist
      // This ensures a completely clean slate
      
      console.log('All authentication data cleared successfully');
    },
    onError: (error) => {
      console.error('Logout mutation error:', error);
      
      // Even if there's an error, we should still clear local data
      // This ensures the user is logged out locally even if the API fails
      
      // Clear localStorage
      const authKeys = [
        'admin_token',
        'admin_user',
        'auth-storage',
      ];
      
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove localStorage key ${key}:`, error);
        }
      });
      
      // Clear React Query cache
      queryClient.clear();
      
      console.log('Local authentication data cleared despite API error');
    },
  });
};

