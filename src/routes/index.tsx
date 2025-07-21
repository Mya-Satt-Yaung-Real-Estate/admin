import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/stores/useAuthStore';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const UserListPage = lazy(() => import('@/pages/users/UserListPage'));
const UserCreatePage = lazy(() => import('@/pages/users/UserCreatePage'));
const UserDetailPage = lazy(() => import('@/pages/users/UserDetailPage'));
const UserEditPage = lazy(() => import('@/pages/users/UserEditPage'));
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AdminListPage = lazy(() => import('@/pages/admins/AdminListPage'));
const AdminCreatePage = lazy(() => import('@/pages/admins/AdminCreatePage'));
const AdminDetailPage = lazy(() => import('@/pages/admins/AdminDetailPage'));
const AdminEditPage = lazy(() => import('@/pages/admins/AdminEditPage'));
const RoleListPage = lazy(() => import('@/pages/roles/RoleListPage'));
const RoleCreatePage = lazy(() => import('@/pages/roles/RoleCreatePage'));
const RoleDetailPage = lazy(() => import('@/pages/roles/RoleDetailPage'));
const RoleEditPage = lazy(() => import('@/pages/roles/RoleEditPage'));
const PermissionListPage = lazy(() => import('@/pages/permissions/PermissionListPage'));
const PermissionCreatePage = lazy(() => import('@/pages/permissions/PermissionCreatePage'));
const PermissionDetailPage = lazy(() => import('@/pages/permissions/PermissionDetailPage'));
const PermissionEditPage = lazy(() => import('@/pages/permissions/PermissionEditPage'));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

// Protected route wrapper for admin pages
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </AdminLayout>
  );
};

// Public route wrapper for login page
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/users',
    element: <ProtectedRoute><UserListPage /></ProtectedRoute>,
  },
  {
    path: '/users/create',
    element: <ProtectedRoute><UserCreatePage /></ProtectedRoute>,
  },
  {
    path: '/users/:id',
    element: <ProtectedRoute><UserDetailPage /></ProtectedRoute>,
  },
  {
    path: '/users/:id/edit',
    element: <ProtectedRoute><UserEditPage /></ProtectedRoute>,
  },
  {
    path: '/analytics',
    element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute>,
  },
  {
    path: '/settings',
    element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
  },
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/admins',
    element: <ProtectedRoute><AdminListPage /></ProtectedRoute>,
  },
  {
    path: '/admins/create',
    element: <ProtectedRoute><AdminCreatePage /></ProtectedRoute>,
  },
  {
    path: '/admins/:id',
    element: <ProtectedRoute><AdminDetailPage /></ProtectedRoute>,
  },
  {
    path: '/admins/:id/edit',
    element: <ProtectedRoute><AdminEditPage /></ProtectedRoute>,
  },
  {
    path: '/roles',
    element: <ProtectedRoute><RoleListPage /></ProtectedRoute>,
  },
  {
    path: '/roles/create',
    element: <ProtectedRoute><RoleCreatePage /></ProtectedRoute>,
  },
  {
    path: '/roles/:id',
    element: <ProtectedRoute><RoleDetailPage /></ProtectedRoute>,
  },
  {
    path: '/roles/:id/edit',
    element: <ProtectedRoute><RoleEditPage /></ProtectedRoute>,
  },
  {
    path: '/permissions',
    element: <ProtectedRoute><PermissionListPage /></ProtectedRoute>,
  },
  {
    path: '/permissions/create',
    element: <ProtectedRoute><PermissionCreatePage /></ProtectedRoute>,
  },
  {
    path: '/permissions/:id',
    element: <ProtectedRoute><PermissionDetailPage /></ProtectedRoute>,
  },
  {
    path: '/permissions/:id/edit',
    element: <ProtectedRoute><PermissionEditPage /></ProtectedRoute>,
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