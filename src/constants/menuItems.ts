export const MENU_ITEMS = [
  {
    text: 'Dashboard',
    iconName: 'Dashboard',
    path: '/',
  },
  {
    text: 'Point Orders',
    iconName: 'ShoppingCart',
    path: '/points/purchase-requests',
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
    text: 'Advertisements',
    iconName: 'Campaign',
    path: '/advertisements',
  },
  {
    text: 'Events',
    iconName: 'Event',
    children: [
      {
        text: 'Event Categories',
        iconName: 'Category',
        path: '/events/categories',
      },
      {
        text: 'Events',
        iconName: 'Event',
        path: '/events',
      },
    ],
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
        text: 'Company Types',
        iconName: 'Business',
        path: '/company-types',
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
    children: [
      {
        text: 'System Configurations',
        iconName: 'Settings',
        path: '/system-configurations',
      },
    ],
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