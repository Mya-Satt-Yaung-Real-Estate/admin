import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import AdminLayout from '../../components/layout/AdminLayout';

// Lazy load advertisement pages
const AdvertisementListPage = lazy(() => import('@/pages/advertisements/AdvertisementListPage'));
const AdvertisementCreatePage = lazy(() => import('@/pages/advertisements/AdvertisementCreatePage'));
const AdvertisementDetailPage = lazy(() => import('@/pages/advertisements/AdvertisementDetailPage'));
const AdvertisementEditPage = lazy(() => import('@/pages/advertisements/AdvertisementEditPage'));

export const advertisementRoutes = [
  // Advertisement List Page
  {
    path: '/advertisements',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <AdvertisementListPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  // Advertisement Create Page
  {
    path: '/advertisements/create',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <AdvertisementCreatePage />
        </Suspense>
      </AdminLayout>
    ),
  },
  // Advertisement Detail Page
  {
    path: '/advertisements/:id',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <AdvertisementDetailPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  // Advertisement Edit Page
  {
    path: '/advertisements/:id/edit',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <AdvertisementEditPage />
        </Suspense>
      </AdminLayout>
    ),
  },
];
