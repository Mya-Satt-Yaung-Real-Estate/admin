import { Permission } from '../types/permission';
import { getStatusColor, getStatusCount } from '../constants/status';

export const filterPermissions = (
  permissions: Permission[],
  searchTerm: string,
  statusFilter: string,
  categoryFilter: string
) => {
  return permissions.filter(permission => {
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || permission.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || permission.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
};

export const getPermissionStats = (permissions: Permission[]) => {
  const totalPermissions = permissions.length;
  const activePermissions = permissions.filter(p => p.status === 'active').length;
  const inactivePermissions = totalPermissions - activePermissions;
  const uniqueCategories = [...new Set(permissions.map(p => p.category))].length;
  
  return {
    totalPermissions,
    activePermissions,
    inactivePermissions,
    uniqueCategories
  };
};

export const groupPermissionsByCategory = (permissions: Permission[]) => {
  const grouped: Record<string, Permission[]> = {};
  
  permissions.forEach(permission => {
    if (!grouped[permission.category]) {
      grouped[permission.category] = [];
    }
    grouped[permission.category].push(permission);
  });
  
  return grouped;
};

// Re-export status utilities for convenience
export { getStatusColor, getStatusCount }; 