import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load appointment pages
const AppointmentListPage = lazy(() => import('@/pages/appointments/AppointmentListPage'));
const AppointmentDetailPage = lazy(() => import('@/pages/appointments/AppointmentDetailPage'));
const AppointmentCreatePage = lazy(() => import('@/pages/appointments/AppointmentCreatePage'));
const AppointmentEditPage = lazy(() => import('@/pages/appointments/AppointmentEditPage'));

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
    path: '/appointments/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <AppointmentCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointments/:id/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <AppointmentEditPage />
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
