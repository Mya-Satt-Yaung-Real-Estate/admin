import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './shared';

// Lazy load Contact Us pages
const ContactUsListPage = lazy(() => import('@/pages/contact-us/ContactUsListPage'));
const ContactUsDetailPage = lazy(() => import('@/pages/contact-us/ContactUsDetailPage'));

export const contactUsRoutes: RouteObject[] = [
  {
    path: '/contact-us',
    element: <ProtectedRoute><ContactUsListPage /></ProtectedRoute>,
  },
  {
    path: '/contact-us/:slug',
    element: <ProtectedRoute><ContactUsDetailPage /></ProtectedRoute>,
  },
];
