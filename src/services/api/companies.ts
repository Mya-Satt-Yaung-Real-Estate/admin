// Company Types API functions
import { apiRequest } from './base';
import { 
  CompanyType, 
  CreateCompanyTypeData, 
  UpdateCompanyTypeData 
} from '../../types/company';

export const companiesAPI = {
  // Get all company types
  getCompanyTypes: () => {
    return apiRequest<CompanyType[]>(`/company-types`);
  },

  // Get single company type by slug
  getCompanyType: (slug: string) =>
    apiRequest<CompanyType>(`/company-types/${slug}`),

  // Create new company type
  createCompanyType: (data: CreateCompanyTypeData) =>
    apiRequest<CompanyType>('/company-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update company type
  updateCompanyType: (slug: string, data: UpdateCompanyTypeData) =>
    apiRequest<CompanyType>(`/company-types/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete company type
  deleteCompanyType: (slug: string) =>
    apiRequest(`/company-types/${slug}`, { method: 'DELETE' }),
};
