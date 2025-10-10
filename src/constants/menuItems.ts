export const MENU_ITEMS = [
  {
    text: 'Dashboard',
    iconName: 'Dashboard',
    path: '/',
    module: 'dashboard-module',
  },
  // First Section: Core Business Features
  {
    text: 'Properties',
    iconName: 'HomeWork',
    path: '/properties',
    module: 'property-module',
  },
  {
    text: 'Advertisements',
    iconName: 'Campaign',
    path: '/advertisements',
    module: 'advertisement-module',
  },
  {
    text: 'Events',
    iconName: 'EventNote',
    // module: 'housing-event-module',
    children: [
      {
        text: 'Categories',
        iconName: 'EventAvailable',
        path: '/events/categories',
        module: 'housing-event-category-module',
      },
      {
        text: 'Events',
        iconName: 'EventNote',
        path: '/events',
        module: 'housing-event-module',
      },
    ],
  },
  {
    text: 'CMS',
    iconName: 'DynamicFeed',
    // module: 'news-and-update-module',
    children: [
      {
        text: 'Categories',
        iconName: 'Category',
        path: '/news-article-categories',
        module: 'news-article-category-module',
      },
      {
        text: 'News & Updates',
        iconName: 'Newspaper',
        path: '/news-and-updates',
        module: 'news-and-update-module',
      },
      {
        text: 'Knowledge Hub',
        iconName: 'School',
        path: '/knowledge-hub',
        module: 'knowledge-hub-module',
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
    // module: 'point-package-module',
    children: [
      {
        text: 'Orders',
        iconName: 'ShoppingCart',
        path: '/points/purchase-requests',
        module: 'point-purchase-request-module',
      },
      {
        text: 'Transactions',
        iconName: 'AccountBalance',
        path: '/point-transactions',
        module: 'point-package-module',
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
    // module: 'appointment-module',
    children: [
      {
        text: 'Appointments',
        iconName: 'EventNote',
        path: '/appointments',
        module: 'appointment-module',
      },
      {
        text: 'Prefer Times',
        iconName: 'AccessTime',
        path: '/appointment-prefer-times',
        module: 'appointment-prefer-time-module',
      },
    ],
  },
  {
    text: 'Employee',
    iconName: 'People',
    // module: 'employee-module',
    children: [
      {
        text: 'Employees',
        iconName: 'PersonAdd',
        path: '/employees',
        module: 'employee-module',
      },
      {
        text: 'Referrals',
        iconName: 'HomeWork',
        path: '/property-referrals',
        module: 'property-employee-referral-module',
      },
    ],
  },
  {
    text: 'Loan Requests',
    iconName: 'RequestQuote',
    path: '/loan-requests',
    module: 'loan-request-module',
  },
  {
    text: 'Users',
    iconName: 'People',
    path: '/users',
    module: 'user-module',
  },
    {
      text: 'Announcements',
      iconName: 'Campaign',
      path: '/announcements',
      module: 'announcement-module',
    },
    {
      text: 'Lawyers',
      iconName: 'Gavel',
      path: '/lawyers',
      module: 'lawyer-module',
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
    // module: 'region-module',
    children: [
      {
        text: 'Locations',
        iconName: 'LocationOn',
        path: '/locations',
        module: 'region-module',
      },
      {
        text: 'Property Types',
        iconName: 'Category',
        path: '/property-types',
        module: 'property-type-module',
      },
      {
        text: 'Listing Types',
        iconName: 'List',
        path: '/property-listing-types',
        module: 'property-listing-type-module',
      },
      {
        text: 'Packages',
        iconName: 'Star',
        path: '/points/packages',
        module: 'point-package-module',
      },
      {
        text: 'Company Types',
        iconName: 'Business',
        path: '/company-types',
        module: 'company-type-module',
      },
    ],
  },
  {
    text: 'Settings',
    iconName: 'Settings',
    module: 'setting-module',
    children: [
      {
        text: 'System Configurations',
        iconName: 'Settings',
        path: '/system-configurations',
        module: 'system-configuration-module',
      },
    ],
    requiresDeveloperAccess: true,
  },
  {
    text: 'Admins',
    iconName: 'AdminPanelSettings',
    // module: 'admin-user-module',
    children: [
      {
        text: 'Admins',
        iconName: 'People',
        path: '/admins',
        module: 'admin-user-module',
      },
      {
        text: 'Roles',
        iconName: 'Security',
        path: '/roles',
        module: 'role-module',
      },
      {
        text: 'Permissions',
        iconName: 'Key',
        path: '/permissions',
        module: 'permission-module',
      },
    ],
  },
  {
    text: 'Feedback',
    iconName: 'Feedback',
    path: '/feedback',
    module: 'feedback-module',
  },
  {
    text: 'FAQs',
    iconName: 'QuestionMarkIcon',
    path: '/faqs',
    module: 'faq-module',
  },
]; 