// Export all mock data
export * from './mockUsers';
export * from './mockAdmins';
export * from './mockRoles';
export * from './mockPermissions';
export * from './mockLocations';

// Centralized mock data access
export const mockData = {
  users: {
    data: () => import('./mockUsers').then(m => m.mockUsers),
    helpers: {
      getActive: () => import('./mockUsers').then(m => m.getActiveUsers()),
      getInactive: () => import('./mockUsers').then(m => m.getInactiveUsers()),
      getPending: () => import('./mockUsers').then(m => m.getPendingUsers()),
      getById: (id: number) => import('./mockUsers').then(m => m.getUserById(id)),
      search: (term: string) => import('./mockUsers').then(m => m.searchUsers(term)),
      getStats: () => import('./mockUsers').then(m => m.getUserStats()),
    },
  },
  admins: {
    data: () => import('./mockAdmins').then(m => m.mockAdmins),
    helpers: {
      getActive: () => import('./mockAdmins').then(m => m.getActiveAdmins()),
      getInactive: () => import('./mockAdmins').then(m => m.getInactiveAdmins()),
      getById: (id: number) => import('./mockAdmins').then(m => m.getAdminById(id)),
      search: (term: string) => import('./mockAdmins').then(m => m.searchAdmins(term)),
      getStats: () => import('./mockAdmins').then(m => m.getAdminStats()),
    },
  },
  roles: {
    data: () => import('./mockRoles').then(m => m.mockRoles),
    helpers: {
      getActive: () => import('./mockRoles').then(m => m.getActiveRoles()),
      getInactive: () => import('./mockRoles').then(m => m.getInactiveRoles()),
      getById: (id: number) => import('./mockRoles').then(m => m.getRoleById(id)),
      search: (term: string) => import('./mockRoles').then(m => m.searchRoles(term)),
      getStats: () => import('./mockRoles').then(m => m.getRoleStats()),
    },
  },
  permissions: {
    data: () => import('./mockPermissions').then(m => m.mockPermissions),
    helpers: {
      getActive: () => import('./mockPermissions').then(m => m.getActivePermissions()),
      getInactive: () => import('./mockPermissions').then(m => m.getInactivePermissions()),
      getById: (id: number) => import('./mockPermissions').then(m => m.getPermissionById(id)),
      search: (term: string) => import('./mockPermissions').then(m => m.searchPermissions(term)),
      getStats: () => import('./mockPermissions').then(m => m.getPermissionStats()),
    },
  },
  locations: {
    data: () => import('./mockLocations').then(m => m.mockRegions),
    helpers: {
      getRegions: () => import('./mockLocations').then(m => m.mockRegions),
      getTownships: () => import('./mockLocations').then(m => m.getAllTownships()),
      getActiveRegions: () => import('./mockLocations').then(m => m.getActiveRegions()),
      getActiveTownships: () => import('./mockLocations').then(m => m.getActiveTownships()),
      search: (term: string) => import('./mockLocations').then(m => m.searchLocations(term)),
    },
  },
}; 