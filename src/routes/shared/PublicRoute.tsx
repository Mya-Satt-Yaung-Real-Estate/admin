import { Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import PageLoader from './PageLoader';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
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

export default PublicRoute;
