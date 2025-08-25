import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const AdminListPage = lazy(() => import('@/pages/admins/AdminListPage'));
const AdminCreatePage = lazy(() => import('@/pages/admins/AdminCreatePage'));
const AdminDetailPage = lazy(() => import('@/pages/admins/AdminDetailPage'));
const AdminEditPage = lazy(() => import('@/pages/admins/AdminEditPage'));

export const adminUserRoutes: RouteObject[] = [
  {
    path: '/admins',
    element: <ProtectedRoute><AdminListPage /></ProtectedRoute>,
  },
  {
    path: '/admins/create',
    element: <ProtectedRoute><AdminCreatePage /></ProtectedRoute>,
  },
  {
    path: '/admins/:slug',
    element: <ProtectedRoute><AdminDetailPage /></ProtectedRoute>,
  },
  {
    path: '/admins/:slug/edit',
    element: <ProtectedRoute><AdminEditPage /></ProtectedRoute>,
  },
];
