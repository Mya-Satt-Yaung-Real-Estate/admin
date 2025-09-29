import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './shared';

// Lazy load pages
const PropertyReferralListPage = lazy(() => import('../pages/property-referrals/PropertyReferralListPage'));
const PropertyReferralDetailPage = lazy(() => import('../pages/property-referrals/PropertyReferralDetailPage'));

export const propertyReferralRoutes: RouteObject[] = [
  {
    path: '/property-referrals',
    element: (
      <ProtectedRoute>
        <PropertyReferralListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/property-referrals/:id',
    element: (
      <ProtectedRoute>
        <PropertyReferralDetailPage />
      </ProtectedRoute>
    ),
  },
];
