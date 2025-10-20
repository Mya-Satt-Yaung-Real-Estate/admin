import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../shared';

const LocationListPage = lazy(() => import('@/pages/locations/LocationListPage'));
const RegionCreatePage = lazy(() => import('@/pages/locations/RegionCreatePage'));
const TownshipCreatePage = lazy(() => import('@/pages/locations/TownshipCreatePage'));
const RegionEditPage = lazy(() => import('@/pages/locations/RegionEditPage'));
const TownshipEditPage = lazy(() => import('@/pages/locations/TownshipEditPage'));
const RegionDetailPage = lazy(() => import('@/pages/locations/RegionDetailPage'));
const TownshipDetailPage = lazy(() => import('@/pages/locations/TownshipDetailPage'));
export const locationRoutes: RouteObject[] = [
  {
    path: '/locations',
    element: <ProtectedRoute><LocationListPage /></ProtectedRoute>,
  },
  {
    path: '/locations/regions/create',
    element: <ProtectedRoute><RegionCreatePage /></ProtectedRoute>,
  },
  {
    path: '/locations/townships/create',
    element: <ProtectedRoute><TownshipCreatePage /></ProtectedRoute>,
  },
  {
    path: '/locations/regions/:slug',
    element: <ProtectedRoute><RegionDetailPage /></ProtectedRoute>,
  },
  {
    path: '/locations/regions/:slug/edit',
    element: <ProtectedRoute><RegionEditPage /></ProtectedRoute>,
  },
  {
    path: '/locations/townships/:slug',
    element: <ProtectedRoute><TownshipDetailPage /></ProtectedRoute>,
  },
  {
    path: '/locations/townships/:slug/edit',
    element: <ProtectedRoute><TownshipEditPage /></ProtectedRoute>,
  },
];
