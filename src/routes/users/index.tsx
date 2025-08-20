import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load user pages
const UserListPage = lazy(() => import('@/pages/users/UserListPage'));
const UserDetailPage = lazy(() => import('@/pages/users/UserDetailPage'));
const UserEditPage = lazy(() => import('@/pages/users/UserEditPage'));

export const userRoutes = [
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <UserListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <UserDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <UserEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
