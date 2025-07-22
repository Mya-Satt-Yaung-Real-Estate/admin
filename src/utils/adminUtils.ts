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
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    const matchesRole = roleFilter === 'all' || admin.roleId.toString() === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });
};

export const formatLastLogin = (lastLogin?: string) => {
  if (!lastLogin) return 'Never';
  return formatRelativeTime(lastLogin);
};

export const getFullName = (admin: Admin) => {
  return `${admin.firstName} ${admin.lastName}`;
};

export const getInitials = (admin: Admin) => {
  return `${admin.firstName.charAt(0)}${admin.lastName.charAt(0)}`;
};

// Re-export status utilities for convenience
export { getStatusColor, getStatusCount }; 