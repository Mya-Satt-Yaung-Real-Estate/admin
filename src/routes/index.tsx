import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const UserManagementPage = lazy(() => import('@/pages/users/UserManagementPage'));
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

// Route wrapper for admin pages
const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <AdminLayout>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </AdminLayout>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminRoute><DashboardPage /></AdminRoute>,
  },
  {
    path: '/dashboard',
    element: <AdminRoute><DashboardPage /></AdminRoute>,
  },
  {
    path: '/users',
    element: <AdminRoute><UserManagementPage /></AdminRoute>,
  },
  {
    path: '/analytics',
    element: <AdminRoute><AnalyticsPage /></AdminRoute>,
  },
  {
    path: '/settings',
    element: <AdminRoute><SettingsPage /></AdminRoute>,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]); 