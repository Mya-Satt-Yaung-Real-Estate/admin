// Property Referrals API functions
import { apiRequest, QueryParams } from './base';
import { buildCleanQueryString } from './properties';

// Property Referral Types
export interface PropertyReferral {
  id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  property_type: {
    id: number;
    name_en: string;
    name_mm: string;
  };
  listing_type: {
    id: number;
    name_en: string;
    name_mm: string;
  };
  title_en: string;
  title_mm: string;
  description: string;
  property_condition: string;
  location: {
    region: {
      id: number;
      name_en: string;
      name_mm: string;
    };
    township: {
      id: number;
      name_en: string;
      name_mm: string;
    };
    address: string;
    latitude: number;
    longitude: number;
    location_en: string;
    location_mm: string;
  };
  price: number;
  formatted_price: string;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  bank_installment_available: boolean;
  features: string[];
  contact_info: {
    owner_name: string;
    phone_numbers: string[];
    email: string;
  };
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  code: string;
  stats: {
    view_count: number;
    contact_count: number;
    favorite_count: number;
    like_count: number;
    comment_count: number;
  };
  dates: {
    published_at: string;
    expires_at: string;
    created_at: string;
    verified_at: string;
    last_renewed_at: string;
  };
  verification_status: string;
  rejection_reason?: string;
  verified_by?: {
    id: number;
    name: string;
  };
  is_published: boolean;
  is_draft: boolean;
  is_sold: boolean;
  is_rented: boolean;
  is_expired: boolean;
  can_be_published: boolean;
  is_approved: boolean;
  is_pending_approval: boolean;
  is_rejected: boolean;
  is_deleted: boolean;
  renewal_info: {
    renewal_count: number;
    renewal_notes?: string;
  };
  employees: Array<{
    id: number;
    name: string;
    employee_id: string;
    email: string;
    phone: string;
  }>;
}

// Property Referral Query Parameters
export interface PropertyReferralQueryParams extends QueryParams {
  search?: string;
  status?: string;
  verification_status?: string;
  property_type?: string;
  listing_type?: string;
  expired?: string | boolean;
  is_trending?: boolean;
  employee_name?: string;
  deleted?: string | boolean;
}


export const propertyReferralsAPI = {
  // Get property referral statistics
  statistics: () => {
    return apiRequest<{
      total_count: number;
      pending_count: number;
      published_count: number;
      deleted_count: number;
      approved_count: number;
      rejected_count: number;
      active_count: number;
      total_assignments: number;
      active_assignments: number;
      referral_assignments: number;
      handler_assignments: number;
      properties_with_assignments: number;
      employees_with_assignments: number;
    }>('/property-employee-referrals/statistics');
  },

  // Get list of properties with employee assignments
  list: (params?: PropertyReferralQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<PropertyReferral[]>(`/property-employee-referrals${queryString}`);
  },

  // Get single property referral
  get: (id: number) =>
    apiRequest<PropertyReferral>(`/property-employee-referrals/${id}`),

  // Assign employee to property
  assignEmployee: (data: {
    property_id: number;
    employee_id: number;
    assignment_type: 'referral' | 'handler';
    assignment_priority?: number;
    assignment_status?: 'active' | 'inactive' | 'completed';
    assigned_until?: string;
    referral_source?: string;
    referral_notes?: string;
    notes?: string;
  }) =>
    apiRequest<PropertyReferral>('/property-employee-referrals/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Unassign employee from property
  unassignEmployee: (assignmentId: number) =>
    apiRequest(`/property-employee-referrals/unassign/${assignmentId}`, { method: 'DELETE' }),

  // Update assignment
  updateAssignment: (assignmentId: number, data: {
    assignment_priority?: number;
    assignment_status?: 'active' | 'inactive' | 'completed';
    assigned_until?: string;
    referral_notes?: string;
    notes?: string;
  }) =>
    apiRequest<PropertyReferral>(`/property-employee-referrals/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Export all property referrals to Excel
  export: async (params?: PropertyReferralQueryParams) => {
    const queryString = buildCleanQueryString(params);
    const url = `${import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://msy-api.phyozaw.info/api/v1/admin')}/property-employee-referrals/export${queryString}`;
    
    const token = localStorage.getItem('admin_token') || JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return {
      success: true,
      message: 'Export successful',
      data: await response.blob(),
    };
  },

};
