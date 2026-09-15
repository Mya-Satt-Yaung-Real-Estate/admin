import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

const UserListPage = lazy(() => import('@/pages/users/UserListPage'));
const MapAccessUserListPage = lazy(() => import('@/pages/users/MapAccessUserListPage'));
const UserCreatePage = lazy(() => import('@/pages/users/UserCreatePage'));
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
  /**
   * Register before /users/:slug so "map-access" is not treated as a slug.
   */
  {
    path: '/users/map-access',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <MapAccessUserListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <UserCreatePage />
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
