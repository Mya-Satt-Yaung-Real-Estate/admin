import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PublicRoute } from '../shared';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
];
