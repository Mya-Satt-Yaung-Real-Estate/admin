import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

const MapAccessUserListPage = lazy(
  () => import('@/pages/map-access-users/MapAccessUserListPage')
);

export const mapAccessUserRoutes = [
  {
    path: '/map-access-users',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <MapAccessUserListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  /**
   * Keep old menu/bookmark URL working after feature split from Users.
   */
  {
    path: '/users/map-access',
    element: <Navigate to="/map-access-users" replace />,
  },
];
