import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import AdminLayout from '../../components/layout/AdminLayout';

// Lazy load advertisement pages
const AdvertisementListPage = lazy(() => import('@/pages/advertisements/AdvertisementListPage'));

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
];
