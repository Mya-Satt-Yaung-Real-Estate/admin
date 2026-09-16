import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

const PropertyNoteListPage = lazy(
  () => import('@/pages/property-notes/PropertyNoteListPage')
);
const PropertyNoteDetailPage = lazy(
  () => import('@/pages/property-notes/PropertyNoteDetailPage')
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
  {
    path: '/property-notes/:id',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyNoteDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
