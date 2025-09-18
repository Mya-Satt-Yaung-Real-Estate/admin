import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load loan request pages
const LoanRequestListPage = lazy(() => import('@/pages/loan-requests/LoanRequestListPage'));
const LoanRequestDetailPage = lazy(() => import('@/pages/loan-requests/LoanRequestDetailPage'));

export const loanRequestRoutes = [
  {
    path: '/loan-requests',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <LoanRequestListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/loan-requests/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <LoanRequestDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];