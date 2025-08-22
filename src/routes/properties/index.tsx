import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load property pages
const PropertyListPage = lazy(() => import('@/pages/properties/PropertyListPage'));
const PropertyDetailPage = lazy(() => import('@/pages/properties/PropertyDetailPage'));
const PropertyCreatePage = lazy(() => import('@/pages/properties/PropertyCreatePage'));
const PropertyEditPage = lazy(() => import('@/pages/properties/PropertyEditPage'));

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
    path: '/properties/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyCreatePage />
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
  {
    path: '/properties/:id/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
