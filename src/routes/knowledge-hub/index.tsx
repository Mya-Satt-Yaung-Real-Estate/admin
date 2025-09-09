import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { ProtectedRoute } from '../shared';

// Lazy load Knowledge Hub pages
const KnowledgeHubListPage = lazy(() => import('@/pages/knowledge-hub/KnowledgeHubListPage'));
const KnowledgeHubCreatePage = lazy(() => import('@/pages/knowledge-hub/KnowledgeHubCreatePage'));
const KnowledgeHubDetailPage = lazy(() => import('@/pages/knowledge-hub/KnowledgeHubDetailPage'));
const KnowledgeHubEditPage = lazy(() => import('@/pages/knowledge-hub/KnowledgeHubEditPage'));

export const knowledgeHubRoutes: RouteObject[] = [
  {
    path: '/knowledge-hub',
    element: (
      <ProtectedRoute>
        <KnowledgeHubListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/knowledge-hub/create',
    element: (
      <ProtectedRoute>
        <KnowledgeHubCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/knowledge-hub/:slug',
    element: (
      <ProtectedRoute>
        <KnowledgeHubDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/knowledge-hub/:slug/edit',
    element: (
      <ProtectedRoute>
        <KnowledgeHubEditPage />
      </ProtectedRoute>
    ),
  },
];
