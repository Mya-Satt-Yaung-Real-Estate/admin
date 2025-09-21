export const MENU_ITEMS = [
  {
    text: 'Dashboard',
    iconName: 'Dashboard',
    path: '/',
  },
  {
    text: 'Point Orders',
    iconName: 'RequestQuote',
    path: '/points/purchase-requests',
  },
  {
    text: 'Users',
    iconName: 'People',
    path: '/users',
  },
  {
    text: 'Properties',
    iconName: 'HomeWork',
    path: '/properties',
  },
  {
    text: 'Advertisements',
    iconName: 'Campaign',
    path: '/advertisements',
  },
  {
    text: 'Bookings',
    iconName: 'EventNote',
    path: '/bookings',
  },
  {
    text: 'Loan Requests',
    iconName: 'RequestQuote',
    path: '/loan-requests',
  },
  {
    text: 'Events',
    iconName: 'EventNote',
    children: [
      {
        text: 'Event Categories',
        iconName: 'EventAvailable',
        path: '/events/categories',
      },
      {
        text: 'Events',
        iconName: 'EventNote',
        path: '/events',
      },
    ],
  },
  {
    text: 'CMS',
    iconName: 'DynamicFeed',
    children: [
      {
        text: 'Categories',
        iconName: 'Category',
        path: '/news-article-categories',
      },
      {
        text: 'News & Updates',
        iconName: 'Newspaper',
        path: '/news-and-updates',
      },
      {
        text: 'Knowledge Hub',
        iconName: 'School',
        path: '/knowledge-hub',
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
    iconName: 'AdminPanelSettings',
    children: [
      {
        text: 'Admin Users',
        iconName: 'People',
        path: '/admins',
      },
      {
        text: 'Roles',
        iconName: 'Security',
        path: '/roles',
      },
      {
        text: 'Permissions',
        iconName: 'Key',
        path: '/permissions',
      },
    ],
  },
  {
    text: 'Feedback',
    iconName: 'Feedback',
    path: '/feedback',
  },
  {
    text: 'FAQs',
    iconName: 'QuestionMarkIcon',
    path: '/faqs',
  },
]; 