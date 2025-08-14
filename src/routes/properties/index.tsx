import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load property pages
const PropertyListPage = lazy(() => import('@/pages/properties/PropertyListPage'));
const PropertyDetailPage = lazy(() => import('@/pages/properties/PropertyDetailPage'));

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
  {
    path: '/properties/:id',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
