import { Admin } from '../types/admin';
import { getStatusColor, getStatusCount } from '../constants/status';
import { formatRelativeTime } from '../constants/dateFormats';

export const filterAdmins = (
  admins: Admin[],
  searchTerm: string,
  statusFilter: string,
  roleFilter: string
) => {
  return admins.filter(admin => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.permissions.some(permission => permission.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });
};

export const formatLastLogin = (lastLogin?: string) => {
  if (!lastLogin) return 'Never';
  return formatRelativeTime(lastLogin);
};

export const getFullName = (admin: Admin) => {
  return admin.name;
};

export const getInitials = (admin: Admin) => {
  return admin.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
};

// Re-export status utilities for convenience
export { getStatusColor, getStatusCount }; 