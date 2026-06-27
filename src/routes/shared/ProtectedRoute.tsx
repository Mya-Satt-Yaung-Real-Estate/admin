import { Navigate, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import AdminLayout from '@/components/layout/AdminLayout';
import PageLoader from './PageLoader';
import { isMarketerAllowedPath, isMarketerOnlyAccess } from '@/constants/accessControl';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isMarketerOnlyAccess(user?.email) && !isMarketerAllowedPath(location.pathname)) {
    return <Navigate to="/properties" replace />;
  }
  
  return (
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </AdminLayout>
  );
};

export default ProtectedRoute;
