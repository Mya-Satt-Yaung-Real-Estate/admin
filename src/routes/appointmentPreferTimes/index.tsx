import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../shared';
import { PageLoader } from '../shared';

// Lazy load pages
const AppointmentPreferTimeListPage = lazy(() => import('../../pages/appointmentPreferTimes/AppointmentPreferTimeListPage'));
const AppointmentPreferTimeCreatePage = lazy(() => import('../../pages/appointmentPreferTimes/AppointmentPreferTimeCreatePage'));
const AppointmentPreferTimeEditPage = lazy(() => import('../../pages/appointmentPreferTimes/AppointmentPreferTimeEditPage'));

const AppointmentPreferTimeRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AppointmentPreferTimeListPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AppointmentPreferTimeCreatePage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:id/edit" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AppointmentPreferTimeEditPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      {/* Future routes will be added here */}
      {/* <Route path="/:id" element={<AppointmentPreferTimeDetailPage />} /> */}
    </Routes>
  );
};

export default AppointmentPreferTimeRoutes;
