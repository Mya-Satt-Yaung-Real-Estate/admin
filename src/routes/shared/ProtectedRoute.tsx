import { Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import AdminLayout from '@/components/layout/AdminLayout';
import PageLoader from './PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
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

export default ProtectedRoute;
