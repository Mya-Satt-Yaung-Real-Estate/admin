import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Simple hook to check if user has access to a module
 * @param moduleSlug - The module slug to check (e.g., 'user-module', 'role-module')
 * @returns boolean indicating if user has access to the module
 */
export const useModulePermission = (moduleSlug: string): boolean => {
  const { user } = useAuthStore();
  
  if (!user?.permissions) {
    return false;
  }
  
  return user.permissions.some(permission => permission.slug === moduleSlug);
};


