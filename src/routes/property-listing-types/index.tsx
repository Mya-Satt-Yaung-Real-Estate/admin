import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load property listing type pages
const PropertyListingTypeListPage = lazy(() => import('@/pages/property-listing-types/PropertyListingTypeListPage'));
const PropertyListingTypeCreatePage = lazy(() => import('@/pages/property-listing-types/PropertyListingTypeCreatePage'));
const PropertyListingTypeEditPage = lazy(() => import('@/pages/property-listing-types/PropertyListingTypeEditPage'));

export const propertyListingTypeRoutes = [
  {
    path: '/property-listing-types',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyListingTypeListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/property-listing-types/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyListingTypeCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/property-listing-types/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyListingTypeEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
