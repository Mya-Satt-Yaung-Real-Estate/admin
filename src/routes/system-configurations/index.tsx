import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import AdminLayout from '../../components/layout/AdminLayout';

// Lazy load system configuration page
const SystemConfigurationPage = lazy(() => import('@/pages/system-configurations/SystemConfigurationPage'));

export const systemConfigurationRoutes = [
  // Main System Configurations Page (Unified with Sidebar)
  {
    path: '/system-configurations',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <SystemConfigurationPage />
        </Suspense>
      </AdminLayout>
    ),
  },
];
