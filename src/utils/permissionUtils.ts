import { Permission } from '../types/permission';
import { getStatusColor, getStatusCount } from '../constants/status';

export const filterPermissions = (
  permissions: Permission[],
  searchTerm: string,
  statusFilter: string,
  moduleFilter: string
) => {
  return permissions.filter(permission => {
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || permission.status === statusFilter;
    const matchesModule = moduleFilter === 'all' || permission.module === moduleFilter;
    
    return matchesSearch && matchesStatus && matchesModule;
  });
};

export const getPermissionStats = (permissions: Permission[]) => {
  const totalPermissions = permissions.length;
  const activePermissions = permissions.filter(p => p.status === 'active').length;
  const inactivePermissions = totalPermissions - activePermissions;
  const totalRoles = permissions.reduce((sum, p) => sum + p.roleCount, 0);
  const uniqueModules = [...new Set(permissions.map(p => p.module))].length;
  
  return {
    totalPermissions,
    activePermissions,
    inactivePermissions,
    totalRoles,
    uniqueModules
  };
};

export const groupPermissionsByModule = (permissions: Permission[]) => {
  const grouped: Record<string, Permission[]> = {};
  
  permissions.forEach(permission => {
    if (!grouped[permission.module]) {
      grouped[permission.module] = [];
    }
    grouped[permission.module].push(permission);
  });
  
  return grouped;
};

// Re-export status utilities for convenience
export { getStatusColor, getStatusCount }; 