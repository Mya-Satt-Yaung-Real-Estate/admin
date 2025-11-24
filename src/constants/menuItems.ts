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
    text: 'Wanting Listings',
    iconName: 'WantingList',
    path: '/wanting-listings',
  },
  {
    text: 'Advertisements',
    iconName: 'Campaign',
    path: '/advertisements',
  },

  {
    text: 'ADs',
    iconName: 'ADS',
    children: [
      {
        text: 'All ADs',
        iconName: 'Campaign',
        path: '/ads',
      },
    ],
  },
      
  {
    text: 'Events',
    iconName: 'EventNote',
    children: [
      {
        text: 'Categories',
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
    text: 'Points',
    iconName: 'Star',
    children: [
      {
        text: 'Orders',
        iconName: 'ShoppingCart',
        path: '/points/purchase-requests',
      },
      {
        text: 'Transactions',
        iconName: 'AccountBalance',
        path: '/point-transactions',
      },
    ],
  },
  // {
  //   text: 'Bookings',
  //   iconName: 'EventNote',
  //   path: '/bookings',
  // },
  {
    text: 'Appointments',
    iconName: 'EventNote',
    children: [
      {
        text: 'Appointments',
        iconName: 'EventNote',
        path: '/appointments',
      },
      {
        text: 'Prefer Times',
        iconName: 'AccessTime',
        path: '/appointment-prefer-times',
      },
    ],
  },
  {
    text: 'Employee',
    iconName: 'People',
    children: [
      {
        text: 'Employees',
        iconName: 'PersonAdd',
        path: '/employees',
      },
      {
        text: 'Referrals',
        iconName: 'HomeWork',
        path: '/property-referrals',
      },
    ],
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
    {
      text: 'Announcements',
      iconName: 'Campaign',
      path: '/announcements',
    },
    {
      text: 'Lawyers',
      iconName: 'Gavel',
      path: '/lawyers',
    },
  
  // HR Line - Second Section End
  {
    text: 'HR_DIVIDER_2',
    iconName: 'Dashboard', // Placeholder
    path: '',
    isDivider: true,
  },
  // Third Section: Location Management
  {
    text: 'Locations',
    iconName: 'LocationOn',
    children: [
      {
        text: 'Regions & Townships',
        iconName: 'LocationOn',
        path: '/locations',
      },
      {
        text: 'Wards',
        iconName: 'LocationOn',
        path: '/wards',
      },
      {
        text: 'Yarpyat Taxes',
        iconName: 'AttachMoney',
        path: '/yarpyat',
      },
    ],
  },
  // Fourth Section: System & Admin Features
  {
    text: 'Master Data',
    iconName: 'Assessment',
    children: [
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
        text: 'Packages',
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
    requiresDeveloperAccess: true,
  },
  {
    text: 'Admins',
    iconName: 'AdminPanelSettings',
    children: [
      {
        text: 'Admins',
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
    text: 'Contact Us',
    iconName: 'ContactMail',
    path: '/contact-us',
  },
  {
    text: 'FAQs',
    iconName: 'QuestionMarkIcon',
    path: '/faqs',
  },
]; 