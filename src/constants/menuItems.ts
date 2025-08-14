export const MENU_ITEMS = [
  {
    text: 'Dashboard',
    iconName: 'Dashboard',
    path: '/',
  },
  {
    text: 'Users',
    iconName: 'People',
    path: '/users',
  },
  {
    text: 'Properties',
    iconName: 'Home',
    path: '/properties',
  },
  {
    text: 'Location',
    iconName: 'LocationOn',
    path: '/locations',
  },
  // {
  //   text: 'Analytics',
  //   iconName: 'Assessment',
  //   path: '/analytics',
  // },
  // {
  //   text: 'Settings',
  //   iconName: 'Settings',
  //   path: '/settings',
  // },
  {
    text: 'Admins',
    iconName: 'People',
    children: [
      {
        text: 'Admin Users',
        iconName: 'People',
        path: '/admins',
      },
      {
        text: 'Roles',
        iconName: 'People',
        path: '/roles',
      },
      {
        text: 'Permissions',
        iconName: 'People',
        path: '/permissions',
      },
    ],
  },
]; 