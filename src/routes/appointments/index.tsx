import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load appointment pages
const AppointmentListPage = lazy(() => import('@/pages/appointments/AppointmentListPage'));
const AppointmentDetailPage = lazy(() => import('@/pages/appointments/AppointmentDetailPage'));

export const appointmentRoutes = [
  {
    path: '/appointments',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <AppointmentListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointments/:id',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <AppointmentDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
