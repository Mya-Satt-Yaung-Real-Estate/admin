import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const PermissionListPage = lazy(() => import('@/pages/permissions/PermissionListPage'));
const PermissionCreatePage = lazy(() => import('@/pages/permissions/PermissionCreatePage'));
const PermissionDetailPage = lazy(() => import('@/pages/permissions/PermissionDetailPage'));
const PermissionEditPage = lazy(() => import('@/pages/permissions/PermissionEditPage'));

export const permissionRoutes: RouteObject[] = [
  {
    path: '/permissions',
    element: <ProtectedRoute><PermissionListPage /></ProtectedRoute>,
  },
  {
    path: '/permissions/create',
    element: <ProtectedRoute><PermissionCreatePage /></ProtectedRoute>,
  },
  {
    path: '/permissions/:id',
    element: <ProtectedRoute><PermissionDetailPage /></ProtectedRoute>,
  },
  {
    path: '/permissions/:id/edit',
    element: <ProtectedRoute><PermissionEditPage /></ProtectedRoute>,
  },
];
