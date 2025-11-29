import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import AdminLayout from '../../components/layout/AdminLayout';

// Lazy load point pages
const PointPackageListPage = lazy(() => import('@/pages/points/PointPackageListPage'));
const PointPackageCreatePage = lazy(() => import('@/pages/points/PointPackageCreatePage'));
const PointPackageEditPage = lazy(() => import('@/pages/points/PointPackageEditPage'));
const PointPackageDetailPage = lazy(() => import('@/pages/points/PointPackageDetailPage'));
const PointPurchaseRequestListPage = lazy(() => import('@/pages/points/PointPurchaseRequestListPage'));
const PointPurchaseRequestDetailPage = lazy(() => import('@/pages/points/PointPurchaseRequestDetailPage'));
const PointPurchaseRequestCreatePage = lazy(() => import('@/pages/points/PointPurchaseRequestCreatePage'));
const PointOrderListPage = lazy(() => import('@/pages/points/PointOrderListPage'));

export const pointRoutes = [
  // Point Packages
  {
    path: '/points/packages',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <PointPackageListPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/points/packages/create',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <PointPackageCreatePage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/points/packages/:slug',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <PointPackageDetailPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/points/packages/:slug/edit',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <PointPackageEditPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  // Point Purchase Requests
  {
    path: '/points/purchase-requests',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <PointPurchaseRequestListPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/points/purchase-requests/create',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <PointPurchaseRequestCreatePage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/points/purchase-requests/:id',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <PointPurchaseRequestDetailPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  // Point Orders (Payment)
  {
    path: '/points/orders',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <PointOrderListPage />
        </Suspense>
      </AdminLayout>
    ),
  },
];
