import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load company type pages
const CompanyTypeListPage = lazy(() => import('@/pages/company-types/CompanyTypeListPage'));
const CompanyTypeCreatePage = lazy(() => import('@/pages/company-types/CompanyTypeCreatePage'));
const CompanyTypeEditPage = lazy(() => import('@/pages/company-types/CompanyTypeEditPage'));
const CompanyTypeDetailPage = lazy(() => import('@/pages/company-types/CompanyTypeDetailPage'));

export const companyTypeRoutes = [
  {
    path: '/company-types',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <CompanyTypeListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/company-types/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <CompanyTypeCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/company-types/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <CompanyTypeDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/company-types/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <CompanyTypeEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
