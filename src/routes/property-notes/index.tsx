import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

const PropertyNoteListPage = lazy(
  () => import('@/pages/property-notes/PropertyNoteListPage')
);

export const propertyNoteRoutes = [
  {
    path: '/property-notes',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyNoteListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
