
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '../shared';
import { PageLoader } from '../shared';

// Lazy load FAQ pages
const FaqListPage = lazy(() => import('@/pages/faq/FaqListPage'));
const FaqDetailPage = lazy(() => import('@/pages/faq/FaqDetailPage'));
const FaqFormPage = lazy(() => import('@/pages/faq/FaqFormPage'));

export const faqRoutes = [
  {
    path: '/faqs',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <FaqListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/faqs/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <FaqFormPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/faqs/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <FaqDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/faqs/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <FaqFormPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];