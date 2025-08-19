import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PageLoader } from './shared';

// Import feature routes
import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';
import { adminUserRoutes } from './admin-users';
import { roleRoutes } from './roles';
import { permissionRoutes } from './permissions';
import { locationRoutes } from './locations';
import { propertyRoutes } from './properties';
import { propertyTypeRoutes } from './property-types';
import { propertyListingTypeRoutes } from './property-listing-types';
import { pointRoutes } from './points';
import { userRoutes } from './users';
import { analyticsRoutes } from './analytics';
import { settingsRoutes } from './settings';

// Lazy load NotFoundPage
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  // Feature routes
  ...authRoutes,
  ...dashboardRoutes,
  ...adminUserRoutes,
  ...roleRoutes,
  ...permissionRoutes,
  ...locationRoutes,
  ...propertyRoutes,
  ...propertyTypeRoutes,
  ...propertyListingTypeRoutes,
  ...pointRoutes,
  ...userRoutes,
  ...analyticsRoutes,
  ...settingsRoutes,
  
  // Catch-all route
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]); 