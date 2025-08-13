import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));

export const analyticsRoutes: RouteObject[] = [
  {
    path: '/analytics',
    element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute>,
  },
];
