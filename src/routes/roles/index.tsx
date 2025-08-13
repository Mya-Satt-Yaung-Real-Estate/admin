import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const RoleListPage = lazy(() => import('@/pages/roles/RoleListPage'));
const RoleCreatePage = lazy(() => import('@/pages/roles/RoleCreatePage'));
const RoleDetailPage = lazy(() => import('@/pages/roles/RoleDetailPage'));
const RoleEditPage = lazy(() => import('@/pages/roles/RoleEditPage'));

export const roleRoutes: RouteObject[] = [
  {
    path: '/roles',
    element: <ProtectedRoute><RoleListPage /></ProtectedRoute>,
  },
  {
    path: '/roles/create',
    element: <ProtectedRoute><RoleCreatePage /></ProtectedRoute>,
  },
  {
    path: '/roles/:slug',
    element: <ProtectedRoute><RoleDetailPage /></ProtectedRoute>,
  },
  {
    path: '/roles/:slug/edit',
    element: <ProtectedRoute><RoleEditPage /></ProtectedRoute>,
  },
];
