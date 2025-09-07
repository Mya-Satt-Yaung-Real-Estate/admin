import { lazy, Suspense } from 'react';
import { PageLoader } from '../shared';
import { ProtectedRoute } from '../shared';

// Lazy load event category pages (only the ones that exist)
const EventCategoryListPage = lazy(() => import('../../pages/events/EventCategoryListPage'));
const EventCategoryCreatePage = lazy(() => import('../../pages/events/EventCategoryCreatePage'));
const EventCategoryEditPage = lazy(() => import('../../pages/events/EventCategoryEditPage'));

// Lazy load event pages (only the ones that exist)
const EventListPage = lazy(() => import('../../pages/events/EventListPage'));
const EventDetailPage = lazy(() => import('../../pages/events/EventDetailPage'));
const EventCreatePage = lazy(() => import('../../pages/events/EventCreatePage'));
const EventEditPage = lazy(() => import('../../pages/events/EventEditPage'));

// TODO: Create these pages when needed
// const EventCategoryDetailPage = lazy(() => import('@/pages/events/EventCategoryDetailPage'));

export const eventRoutes = [
  // Event Category Routes (only the ones that exist)
  {
    path: '/events/categories',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EventCategoryListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  
  // Event List Page
  {
    path: '/events',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EventListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  
  // Event Detail Page
  {
    path: '/events/:slug',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EventDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  
  // Event Create Page
  {
    path: '/events/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EventCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  
  // Event Edit Page
  {
    path: '/events/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EventEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  
  // Event Category Create Page
  {
    path: '/events/categories/create',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EventCategoryCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  
  // Event Category Edit Page
  {
    path: '/events/categories/:slug/edit',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EventCategoryEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  
  // TODO: Add these routes when the pages are created
  // {
  //   path: '/events/categories/:slug',
  //   element: (
  //     <ProtectedRoute>
  //       <Suspense fallback={<PageLoader />}>
  //         <EventCategoryDetailPage />
  //       </Suspense>
  //     </ProtectedRoute>
  //   ),
  // },

  // Event Routes (TODO: Add when pages are created)
  // {
  //   path: '/events',
  //   element: (
  //     <ProtectedRoute>
  //       <Suspense fallback={<PageLoader />}>
  //         <EventListPage />
  //       </Suspense>
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/events/create',
  //   element: (
  //     <ProtectedRoute>
  //       <Suspense fallback={<PageLoader />}>
  //         <EventCreatePage />
  //       </Suspense>
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/events/:slug',
  //   element: (
  //     <ProtectedRoute>
  //       <Suspense fallback={<PageLoader />}>
  //         <EventDetailPage />
  //       </Suspense>
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/events/:slug/edit',
  //   element: (
  //     <ProtectedRoute>
  //       <Suspense fallback={<PageLoader />}>
  //         <EventEditPage />
  //       </Suspense>
  //     </ProtectedRoute>
  //   ),
  // },
];

