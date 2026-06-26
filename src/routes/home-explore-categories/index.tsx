import { lazy, Suspense } from 'react';
import { PageLoader, ProtectedRoute } from '../shared';

const HomeExploreCategoryListPage = lazy(() => import('@/pages/home-explore-categories/HomeExploreCategoryListPage'));
const HomeExploreCategoryFormPage = lazy(() => import('@/pages/home-explore-categories/HomeExploreCategoryFormPage'));

export const homeExploreCategoryRoutes = [
  {
    path: '/home-explore-categories',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <HomeExploreCategoryListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/home-explore-categories/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <HomeExploreCategoryFormPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/home-explore-categories/:id/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <HomeExploreCategoryFormPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
