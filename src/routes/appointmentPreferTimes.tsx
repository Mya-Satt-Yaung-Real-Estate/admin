import { lazy, Suspense } from 'react';
import { PageLoader } from './shared';

// Lazy load pages
const AppointmentPreferTimeRoutes = lazy(() => import('./appointmentPreferTimes/index'));

export const appointmentPreferTimeRoutes = [
  {
    path: '/appointment-prefer-times/*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AppointmentPreferTimeRoutes />
      </Suspense>
    ),
  },
];
