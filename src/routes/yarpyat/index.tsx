import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const YarpyatListPage = lazy(() => import('@/pages/locations/YarpyatListPage'));
const YarpyatCreatePage = lazy(() => import('@/pages/locations/YarpyatCreatePage'));
const YarpyatEditPage = lazy(() => import('@/pages/locations/YarpyatEditPage'));

export const yarpyatRoutes: RouteObject[] = [
  {
    path: '/yarpyat',
    element: <ProtectedRoute><YarpyatListPage /></ProtectedRoute>,
  },
  {
    path: '/yarpyat/create',
    element: <ProtectedRoute><YarpyatCreatePage /></ProtectedRoute>,
  },
  {
    path: '/yarpyat/:slug/edit',
    element: <ProtectedRoute><YarpyatEditPage /></ProtectedRoute>,
  },
];
