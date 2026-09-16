import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

const PropertyNoteAccessRequestListPage = lazy(
  () => import('@/pages/property-note-access-requests/PropertyNoteAccessRequestListPage')
);

export const propertyNoteAccessRequestRoutes = [
  {
    path: '/property-note-access-requests',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyNoteAccessRequestListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
