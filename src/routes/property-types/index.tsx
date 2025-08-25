import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load property type pages
const PropertyTypeListPage = lazy(() => import('@/pages/property-types/PropertyTypeListPage'));
const PropertyTypeCreatePage = lazy(() => import('@/pages/property-types/PropertyTypeCreatePage'));
const PropertyTypeEditPage = lazy(() => import('@/pages/property-types/PropertyTypeEditPage'));

export const propertyTypeRoutes = [
  {
    path: '/property-types',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyTypeListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/property-types/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyTypeCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/property-types/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyTypeEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
