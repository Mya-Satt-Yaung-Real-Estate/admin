import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { PageLoader } from './shared';

// Lazy load employee pages
const EmployeeListPage = lazy(() => import('@/pages/employees/EmployeeListPage'));
const EmployeeCreatePage = lazy(() => import('@/pages/employees/EmployeeCreatePage'));
const EmployeeEditPage = lazy(() => import('@/pages/employees/EmployeeEditPage'));

export const employeeRoutes: RouteObject[] = [
  {
    path: '/employees',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <EmployeeListPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/employees/create',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <EmployeeCreatePage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/employees/:id/edit',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <EmployeeEditPage />
        </Suspense>
      </AdminLayout>
    ),
  },
];
