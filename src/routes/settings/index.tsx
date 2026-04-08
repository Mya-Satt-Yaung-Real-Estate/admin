import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const SystemMonitoringPage = lazy(() => import('@/pages/settings/SystemMonitoringPage'));
const AppVersionPage = lazy(() => import('@/pages/settings/AppVersionPage'));

export const settingsRoutes: RouteObject[] = [
  {
    path: '/settings',
    element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
  },
  {
    path: '/settings/system-monitoring',
    element: <ProtectedRoute><SystemMonitoringPage /></ProtectedRoute>,
  },
  {
    path: '/settings/app-version',
    element: <ProtectedRoute><AppVersionPage /></ProtectedRoute>,
  },
];
