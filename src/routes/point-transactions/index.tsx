import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const PointTransactionListPage = lazy(() => import('@/pages/point-transactions/PointTransactionListPage'));

export const pointTransactionRoutes: RouteObject[] = [
  {
    path: '/point-transactions',
    element: <ProtectedRoute><PointTransactionListPage /></ProtectedRoute>,
  },
];

