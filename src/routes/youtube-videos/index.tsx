import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

const YoutubeVideoListPage = lazy(() => import('@/pages/youtube-videos/YoutubeVideoListPage'));
const YoutubeVideoFormPage = lazy(() => import('@/pages/youtube-videos/YoutubeVideoFormPage'));

export const youtubeVideoRoutes = [
  {
    path: '/youtube-videos',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <YoutubeVideoListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/youtube-videos/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <YoutubeVideoFormPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/youtube-videos/:id/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <YoutubeVideoFormPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
