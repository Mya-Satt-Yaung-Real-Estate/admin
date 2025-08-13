import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const UserListPage = lazy(() => import('@/pages/users/UserListPage'));
const UserCreatePage = lazy(() => import('@/pages/users/UserCreatePage'));
const UserDetailPage = lazy(() => import('@/pages/users/UserDetailPage'));
const UserEditPage = lazy(() => import('@/pages/users/UserEditPage'));

export const userRoutes: RouteObject[] = [
  {
    path: '/users',
    element: <ProtectedRoute><UserListPage /></ProtectedRoute>,
  },
  {
    path: '/users/create',
    element: <ProtectedRoute><UserCreatePage /></ProtectedRoute>,
  },
  {
    path: '/users/:id',
    element: <ProtectedRoute><UserDetailPage /></ProtectedRoute>,
  },
  {
    path: '/users/:id/edit',
    element: <ProtectedRoute><UserEditPage /></ProtectedRoute>,
  },
];
