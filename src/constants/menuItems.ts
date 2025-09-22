export const MENU_ITEMS = [
  {
    text: 'Dashboard',
    iconName: 'Dashboard',
    path: '/',
  },
  // First Section: Core Business Features
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
  // HR Line - First Section End
  {
    text: 'HR_DIVIDER_1',
    iconName: 'Dashboard', // Placeholder
    path: '',
    isDivider: true,
  },
  // Second Section: User & Transaction Features
  {
    text: 'Point Orders',
    iconName: 'RequestQuote',
    path: '/points/purchase-requests',
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
    text: 'Users',
    iconName: 'People',
    path: '/users',
  },
  // HR Line - Second Section End
  {
    text: 'HR_DIVIDER_2',
    iconName: 'Dashboard', // Placeholder
    path: '',
    isDivider: true,
  },
  // Third Section: System & Admin Features
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