import { Admin } from '../types/admin';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusCount = (admins: Admin[], status: string) => {
  return admins.filter(admin => admin.status === status).length;
};

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
  
  const date = new Date(lastLogin);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};

export const getFullName = (admin: Admin) => {
  return `${admin.firstName} ${admin.lastName}`;
}; 