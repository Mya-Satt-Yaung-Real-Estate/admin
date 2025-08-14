import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load property pages
const PropertyListPage = lazy(() => import('@/pages/properties/PropertyListPage'));

export const propertyRoutes = [
  {
    path: '/properties',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
