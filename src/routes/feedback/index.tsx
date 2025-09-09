import { lazy } from 'react';
import { ProtectedRoute } from '../shared';

// Lazy load feedback pages
const FeedbackListPage = lazy(() => import('@/pages/feedback/FeedbackListPage'));
const FeedbackDetailPage = lazy(() => import('@/pages/feedback/FeedbackDetailPage'));

export const feedbackRoutes = [
  {
    path: '/feedback',
    element: (
      <ProtectedRoute>
        <FeedbackListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/feedback/:slug',
    element: (
      <ProtectedRoute>
        <FeedbackDetailPage />
      </ProtectedRoute>
    ),
  },
];
