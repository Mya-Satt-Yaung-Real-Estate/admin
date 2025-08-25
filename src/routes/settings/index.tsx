import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

export const settingsRoutes: RouteObject[] = [
  {
    path: '/settings',
    element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
  },
];
