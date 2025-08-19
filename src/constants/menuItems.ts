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
    text: 'Master Data',
    iconName: 'Assessment',
    children: [
      {
        text: 'Locations',
        iconName: 'LocationOn',
        path: '/locations',
      },
      {
        text: 'Property Types',
        iconName: 'Category',
        path: '/property-types',
      },
      {
        text: 'Listing Types',
        iconName: 'List',
        path: '/property-listing-types',
      },
      {
        text: 'Point Packages',
        iconName: 'Star',
        path: '/points/packages',
      },
      {
        text: 'Point Purchase Requests',
        iconName: 'ShoppingCart',
        path: '/points/purchase-requests',
      },
    ],
  },
  // {
  //   text: 'Analytics',
  //   iconName: 'Assessment',
  //   path: '/analytics',
  // },
  {
    text: 'Settings',
    iconName: 'Settings',
    path: '/settings',
  },
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