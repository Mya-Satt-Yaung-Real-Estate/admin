import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const WardListPage = lazy(() => import('@/pages/locations/WardListPage'));
const WardCreatePage = lazy(() => import('@/pages/locations/WardCreatePage'));
const WardEditPage = lazy(() => import('@/pages/locations/WardEditPage'));

export const wardRoutes: RouteObject[] = [
  {
    path: '/wards',
    element: <ProtectedRoute><WardListPage /></ProtectedRoute>,
  },
  {
    path: '/wards/create',
    element: <ProtectedRoute><WardCreatePage /></ProtectedRoute>,
  },
  {
    path: '/wards/:slug/edit',
    element: <ProtectedRoute><WardEditPage /></ProtectedRoute>,
  },
];
