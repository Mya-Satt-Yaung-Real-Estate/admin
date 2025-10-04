import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load lawyer pages
const LawyerListPage = lazy(() => import('@/pages/lawyers/LawyerListPage'));
const LawyerCreatePage = lazy(() => import('@/pages/lawyers/LawyerCreatePage'));
const LawyerEditPage = lazy(() => import('@/pages/lawyers/LawyerEditPage'));
const LawyerDetailPage = lazy(() => import('@/pages/lawyers/LawyerDetailPage'));

export const lawyerRoutes = [
  {
    path: '/lawyers',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <LawyerListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lawyers/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <LawyerCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lawyers/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <LawyerDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lawyers/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <LawyerEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
