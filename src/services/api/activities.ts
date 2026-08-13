import { apiV2Request } from './base';
import type {
  Activity,
  ActivityQueryParams,
  ActivityStatistics,
  CreateActivityData,
  UpdateActivityData,
} from '../../types/activity';

function buildActivityQueryString(params?: ActivityQueryParams): string {
  if (!params) return '';

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

  return Object.keys(filteredParams).length > 0
    ? `?${new URLSearchParams(filteredParams as Record<string, string>).toString()}`
    : '';
}

export const activitiesAPI = {
  statistics: () => apiV2Request<ActivityStatistics>('/activities/statistics'),

  list: (params?: ActivityQueryParams) => {
    const queryString = buildActivityQueryString(params);
    return apiV2Request<Activity[]>(`/activities${queryString}`);
  },

  get: (slug: string) => apiV2Request<Activity>(`/activities/${slug}`),

  create: (data: CreateActivityData) =>
    apiV2Request<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (slug: string, data: UpdateActivityData) =>
    apiV2Request<Activity>(`/activities/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (slug: string) =>
    apiV2Request(`/activities/${slug}`, { method: 'DELETE' }),

  restore: (slug: string) =>
    apiV2Request<Activity>(`/activities/${slug}/restore`, { method: 'POST' }),

  forceDelete: (slug: string) =>
    apiV2Request(`/activities/${slug}/force`, { method: 'DELETE' }),

  toggleHomepage: (slug: string) =>
    apiV2Request<Activity>(`/activities/${slug}/toggle-homepage`, { method: 'PATCH' }),
};
