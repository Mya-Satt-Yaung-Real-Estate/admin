import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load announcement pages
const AnnouncementListPage = lazy(() => import('@/pages/announcements/AnnouncementListPage'));
const AnnouncementCreatePage = lazy(() => import('@/pages/announcements/AnnouncementCreatePage'));
const AnnouncementDetailPage = lazy(() => import('@/pages/announcements/AnnouncementDetailPage'));

export const announcementRoutes = [
  {
    path: '/announcements',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <AnnouncementListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/announcements/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <AnnouncementCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/announcements/:id',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <AnnouncementDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];

