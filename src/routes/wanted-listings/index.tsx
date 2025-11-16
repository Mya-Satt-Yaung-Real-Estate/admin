import { ProtectedRoute, PageLoader } from '../shared';
import { Suspense, lazy } from 'react';

// Lazy load components
const WantingListingListPage = lazy(() => import('@/pages/wanting-listings/WantingListingListPage'));
const WantingListingCreatePage = lazy(() => import('@/pages/wanting-listings/WantingListingCreatePage'));
const WantingListingDetailPage = lazy(() => import('@/pages/wanting-listings/WantingListingDetailPage'));
const WantingListingEditPage = lazy(() => import('@/pages/wanting-listings/WantingListingEditPage'));

export const wantingListRoutes = [
  {
    path: '/wanting-listings',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <WantingListingListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/wanting-listings/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <WantingListingCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/wanting-listings/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <WantingListingDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/wanting-listings/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <WantingListingEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];