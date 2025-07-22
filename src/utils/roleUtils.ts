import { Role } from '../types/role';
import { getStatusColor, getStatusCount } from '../constants/status';

export const filterRoles = (
  roles: Role[],
  searchTerm: string,
  statusFilter: string
) => {
  return roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || role.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
};

export const getPermissionNames = (permissionIds: string[], permissions: any[]) => {
  return permissionIds
    .map(id => permissions.find(p => p.id === id)?.name)
    .filter(Boolean)
    .join(', ');
};

export const getRoleStats = (roles: Role[]) => {
  const totalRoles = roles.length;
  const activeRoles = roles.filter(role => role.status === 'active').length;
  const inactiveRoles = totalRoles - activeRoles;
  
  return {
    totalRoles,
    activeRoles,
    inactiveRoles
  };
};

// Re-export status utilities for convenience
export { getStatusColor, getStatusCount }; 