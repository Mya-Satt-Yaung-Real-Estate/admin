import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
];
