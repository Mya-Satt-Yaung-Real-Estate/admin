import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load booking pages
const BookingListPage = lazy(() => import('@/pages/bookings/BookingListPage'));
const BookingDetailPage = lazy(() => import('@/pages/bookings/BookingDetailPage'));
const BookingCreatePage = lazy(() => import('@/pages/bookings/BookingCreatePage'));
const BookingEditPage = lazy(() => import('@/pages/bookings/BookingEditPage'));

export const bookingRoutes = [
  {
    path: '/bookings',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <BookingListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/bookings/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <BookingCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/bookings/:id',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <BookingDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/bookings/:id/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <BookingEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
