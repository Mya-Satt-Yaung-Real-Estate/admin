import { apiRequest } from './base';
import {
  HomeExploreCategory,
  HomeExploreCategoryFormData,
  HomeExploreCategoryQueryParams,
  HomeExploreCategoryReorderItem,
} from '../../types/homeExploreCategory';

function buildCleanQueryString(params?: HomeExploreCategoryQueryParams): string {
  if (!params) return '';

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

  return Object.keys(filteredParams).length > 0
    ? `?${new URLSearchParams(filteredParams as Record<string, string>).toString()}`
    : '';
}

export const homeExploreCategoriesAPI = {
  list: (params?: HomeExploreCategoryQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<HomeExploreCategory[]>(`/home-explore-categories${queryString}`);
  },

  show: (id: number) => {
    return apiRequest<HomeExploreCategory>(`/home-explore-categories/${id}`);
  },

  create: (data: HomeExploreCategoryFormData) => {
    return apiRequest<HomeExploreCategory>('/home-explore-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: number, data: Partial<HomeExploreCategoryFormData>) => {
    return apiRequest<HomeExploreCategory>(`/home-explore-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: number) => {
    return apiRequest(`/home-explore-categories/${id}`, { method: 'DELETE' });
  },

  reorder: (items: HomeExploreCategoryReorderItem[]) => {
    return apiRequest<HomeExploreCategory[]>('/home-explore-categories/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },
};
