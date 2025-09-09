import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load news and updates pages
const NewsAndUpdateListPage = lazy(() => import('@/pages/news-and-updates/NewsAndUpdateListPage'));
const NewsAndUpdateCreatePage = lazy(() => import('@/pages/news-and-updates/NewsAndUpdateCreatePage'));
const NewsAndUpdateEditPage = lazy(() => import('@/pages/news-and-updates/NewsAndUpdateEditPage'));
const NewsAndUpdateDetailPage = lazy(() => import('@/pages/news-and-updates/NewsAndUpdateDetailPage'));

export const newsAndUpdateRoutes = [
  {
    path: '/news-and-updates',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <NewsAndUpdateListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/news-and-updates/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <NewsAndUpdateCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/news-and-updates/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <NewsAndUpdateEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/news-and-updates/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <NewsAndUpdateDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
