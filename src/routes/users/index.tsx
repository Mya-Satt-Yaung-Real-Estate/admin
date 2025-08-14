import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load user pages
const UserListPage = lazy(() => import('@/pages/users/UserListPage'));

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
];
