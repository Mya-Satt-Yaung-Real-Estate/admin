import { ProtectedRoute, PageLoader } from '../shared';
import { Suspense, lazy } from 'react';

// Lazy load components
const ShareProfitListingListPage = lazy(() => import('@/pages/share-profit-listings/ShareProfitListingListPage'));
const ShareProfitListingCreatePage = lazy(() => import('@/pages/share-profit-listings/ShareProfitListingCreatePage'));
const ShareProfitListingDetailPage = lazy(() => import('@/pages/share-profit-listings/ShareProfitListingDetailPage'));
const ShareProfitListingEditPage = lazy(() => import('@/pages/share-profit-listings/ShareProfitListingEditPage'));

export const shareProfitListingRoutes = [
  {
    path: '/share-profit-listings',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ShareProfitListingListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/share-profit-listings/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ShareProfitListingCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/share-profit-listings/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ShareProfitListingDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/share-profit-listings/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ShareProfitListingEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];