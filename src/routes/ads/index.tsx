import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import AdminLayout from '../../components/layout/AdminLayout';

// Lazy load ADs pages
const ADListPage = lazy(() => import('@/pages/ads/ADListPage'));
const ADCreatePage = lazy(() => import('@/pages/ads/ADCreatePage'));
const ADViewPage = lazy(() => import('@/pages/ads/ADViewPage'));
const ADEditPage = lazy(() => import('@/pages/ads/ADEditPage'));

export const adsRoutes = [
  // AD Create Page
  {
    path: '/ads/create',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <ADCreatePage />
        </Suspense>
      </AdminLayout>
    ),
  },
  // All ADs (main list page)
  {
    path: '/ads',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <ADListPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  // AD Detail Page
  {
    path: '/ads/:slug',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <ADViewPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  // AD Edit Page
  {
    path: '/ads/:slug/edit',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <ADEditPage />
        </Suspense>
      </AdminLayout>
    ),
  },
];