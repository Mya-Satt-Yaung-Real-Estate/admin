import { apiRequest, ApiResponse } from './base';
import {
  Project,
  ProjectFilters,
  ProjectFormData,
  ProjectStatistics,
} from '../../types/project';

export const projectAPI = {
  getProjects: (params?: ProjectFilters): Promise<ApiResponse<Project[]>> => {
    if (!params) {
      return apiRequest<Project[]>('/projects');
    }

    const queryParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value);
      }
    });

    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `/projects?${queryString}` : '/projects';
    return apiRequest<Project[]>(url);
  },

  getProject: (id: number): Promise<ApiResponse<Project>> =>
    apiRequest<Project>(`/projects/${id}`),

  createProject: (data: ProjectFormData): Promise<ApiResponse<Project>> =>
    apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProject: (id: number, data: Partial<ProjectFormData>): Promise<ApiResponse<Project>> =>
    apiRequest<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: number): Promise<{ success: boolean; message: string; data: null }> =>
    apiRequest(`/projects/${id}`, { method: 'DELETE' }),

  restoreProject: (id: number): Promise<ApiResponse<Project>> =>
    apiRequest<Project>(`/projects/${id}/restore`, { method: 'POST' }),

  getStatistics: (): Promise<ApiResponse<ProjectStatistics>> =>
    apiRequest<ProjectStatistics>('/projects/statistics'),
};
