import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

const PropertyNoteAccessRequestListPage = lazy(
  () => import('@/pages/property-note-access-requests/PropertyNoteAccessRequestListPage')
);

const PropertyNoteAccessRequestDetailPage = lazy(
  () => import('@/pages/property-note-access-requests/PropertyNoteAccessRequestDetailPage')
);

const PropertyNoteAccessGrantPage = lazy(
  () => import('@/pages/property-note-access-requests/PropertyNoteAccessGrantPage')
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
  {
    path: '/property-note-access-requests/:id',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyNoteAccessRequestDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/property-note-access-grant',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <PropertyNoteAccessGrantPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
