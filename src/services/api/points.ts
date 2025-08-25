// Points API functions
import { apiRequest } from './base';
import { 
  PointPackage, 
  CreatePointPackageData, 
  UpdatePointPackageData,
  PointPurchaseRequest,
  CreatePointPurchaseRequestData,
  UpdatePointPurchaseRequestData,
  ApproveRejectRequestData,
  PointPurchaseRequestFilters,
  PointPurchaseRequestsResponse
} from '../../types/point';

export const pointsAPI = {
  // Point Packages
  getPointPackages: () => {
    return apiRequest<PointPackage[]>(`/point-packages`);
  },

  getPointPackage: (slug: string) =>
    apiRequest<PointPackage>(`/point-packages/${slug}`),

  createPointPackage: (data: CreatePointPackageData) =>
    apiRequest<PointPackage>('/point-packages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePointPackage: (slug: string, data: UpdatePointPackageData) =>
    apiRequest<PointPackage>(`/point-packages/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePointPackage: (slug: string, deletion_reason?: string) =>
    apiRequest(`/point-packages/${slug}`, { 
      method: 'DELETE',
      body: deletion_reason ? JSON.stringify({ deletion_reason }) : undefined,
    }),

  restorePointPackage: (slug: string) =>
    apiRequest<PointPackage>(`/point-packages/${slug}/restore`, {
      method: 'POST',
    }),

  forceDeletePointPackage: (slug: string) =>
    apiRequest(`/point-packages/${slug}/force`, { method: 'DELETE' }),

  togglePointPackageStatus: (slug: string) =>
    apiRequest<PointPackage>(`/point-packages/${slug}/toggle-status`, {
      method: 'POST',
    }),

  // Point Purchase Requests
  getPointPurchaseRequests: (params?: PointPurchaseRequestFilters) => {
    if (!params) {
      return apiRequest<PointPurchaseRequestsResponse>('/point-purchase-requests');
    }
    
    // Filter out undefined values and convert numbers to strings
    const queryParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value);
      }
    });
    
    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `/point-purchase-requests?${queryString}` : '/point-purchase-requests';
    
    return apiRequest<PointPurchaseRequestsResponse>(url);
  },

  getPointPurchaseRequest: (id: number) =>
    apiRequest<PointPurchaseRequest>(`/point-purchase-requests/${id}`),

  createPointPurchaseRequest: (data: CreatePointPurchaseRequestData) =>
    apiRequest<PointPurchaseRequest>('/point-purchase-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePointPurchaseRequest: (id: number, data: UpdatePointPurchaseRequestData) =>
    apiRequest<PointPurchaseRequest>(`/point-purchase-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePointPurchaseRequest: (id: number) =>
    apiRequest(`/point-purchase-requests/${id}`, { method: 'DELETE' }),

  // Approve/Reject Point Purchase Request
  approveRejectPointPurchaseRequest: (id: number, data: ApproveRejectRequestData) =>
    apiRequest<PointPurchaseRequest>(`/point-purchase-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
