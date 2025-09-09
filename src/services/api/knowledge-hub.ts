// Knowledge Hub API functions
import { apiRequest, QueryParams } from './base';
import { KnowledgeHub, CreateKnowledgeHubData, UpdateKnowledgeHubData } from '../../types/knowledgeHub';

export const knowledgeHubAPI = {
  // Get list of knowledge hubs
  list: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<KnowledgeHub[]>(`/knowledges-hubs${queryString}`);
  },

  // Get single knowledge hub by ID
  get: (id: number) =>
    apiRequest<KnowledgeHub>(`/knowledges-hubs/${id}`),

  // Get single knowledge hub by slug
  getBySlug: (slug: string) =>
    apiRequest<KnowledgeHub>(`/knowledges-hubs/${slug}`),

  // Create new knowledge hub
  create: (data: CreateKnowledgeHubData) =>
    apiRequest<KnowledgeHub>('/knowledges-hubs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update knowledge hub
  update: (slug: string, data: UpdateKnowledgeHubData) =>
    apiRequest<KnowledgeHub>(`/knowledges-hubs/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete knowledge hub
  delete: (slug: string) =>
    apiRequest(`/knowledges-hubs/${slug}`, { method: 'DELETE' }),

  // Restore knowledge hub
  restore: (slug: string) =>
    apiRequest<KnowledgeHub>(`/knowledges-hubs/${slug}/restore`, { method: 'POST' }),
};
