import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load news article category pages
const NewsArticleCategoryListPage = lazy(() => import('@/pages/news-article-categories/NewsArticleCategoryListPage'));
const NewsArticleCategoryCreatePage = lazy(() => import('@/pages/news-article-categories/NewsArticleCategoryCreatePage'));
const NewsArticleCategoryEditPage = lazy(() => import('@/pages/news-article-categories/NewsArticleCategoryEditPage'));

export const newsArticleCategoryRoutes = [
  {
    path: '/news-article-categories',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <NewsArticleCategoryListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/news-article-categories/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <NewsArticleCategoryCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/news-article-categories/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <NewsArticleCategoryEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
