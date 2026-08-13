import { ProtectedRoute, PageLoader } from '../shared';
import { Suspense, lazy } from 'react';

const ActivityListPage = lazy(() => import('@/pages/activities/ActivityListPage'));
const ActivityCreatePage = lazy(() => import('@/pages/activities/ActivityCreatePage'));
const ActivityDetailPage = lazy(() => import('@/pages/activities/ActivityDetailPage'));
const ActivityEditPage = lazy(() => import('@/pages/activities/ActivityEditPage'));

export const activityRoutes = [
  {
    path: '/activities',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ActivityListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/activities/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ActivityCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/activities/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ActivityDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/activities/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ActivityEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
