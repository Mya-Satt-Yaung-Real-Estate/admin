import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import AdminLayout from '../../components/layout/AdminLayout';

const ProjectListPage = lazy(() => import('@/pages/projects/ProjectListPage'));
const ProjectCreatePage = lazy(() => import('@/pages/projects/ProjectCreatePage'));
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'));
const ProjectEditPage = lazy(() => import('@/pages/projects/ProjectEditPage'));

export const projectRoutes = [
  {
    path: '/projects',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <ProjectListPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/projects/create',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <ProjectCreatePage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/projects/:id',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <ProjectDetailPage />
        </Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/projects/:id/edit',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <ProjectEditPage />
        </Suspense>
      </AdminLayout>
    ),
  },
];
