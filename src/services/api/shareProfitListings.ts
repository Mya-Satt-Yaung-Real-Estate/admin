/**
 * Share Profit Listings Admin API client → V2 backend.
 */
import { apiV2Request, QueryParams } from './base';
import {
  ShareProfitListing,
  CreateShareProfitListingData,
  UpdateShareProfitListingData,
} from '../../types/shareProfitListing';

export interface ShareProfitListingQueryParams extends QueryParams {
  wanted_type?: string;
  verification_status?: string;
  property_type_id?: number;
  prefer_region_id?: number;
  prefer_township_id?: number;
  min_budget?: number;
  max_budget?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  search?: string;
}

export function buildCleanShareProfitListingQueryString(params?: Record<string, any>): string {
  if (!params) return '';

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );

  const queryString =
    Object.keys(filteredParams).length > 0
      ? '?' + new URLSearchParams(filteredParams as Record<string, string>).toString()
      : '';

  return queryString;
}

export const shareProfitListingsAPI = {
  statistics: () => {
    return apiV2Request<{
      total: number;
      published: number;
      draft: number;
      pending: number;
      approved: number;
      rejected: number;
      by_type: {
        buyer: number;
        renter: number;
        seller: number;
        share_profit: number;
      };
    }>('/share-profit-listings/statistics');
  },

  list: (params?: ShareProfitListingQueryParams) => {
    const queryString = buildCleanShareProfitListingQueryString(params);
    return apiV2Request<{ data: ShareProfitListing[]; pagination?: any }>(
      `/share-profit-listings${queryString}`
    );
  },

  get: (slug: string) => apiV2Request<ShareProfitListing>(`/share-profit-listings/${slug}`),

  create: (data: CreateShareProfitListingData) =>
    apiV2Request<ShareProfitListing>('/share-profit-listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (slug: string, data: UpdateShareProfitListingData) =>
    apiV2Request<ShareProfitListing>(`/share-profit-listings/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (slug: string) =>
    apiV2Request(`/share-profit-listings/${slug}`, { method: 'DELETE' }),

  restore: (slug: string) =>
    apiV2Request<ShareProfitListing>(`/share-profit-listings/${slug}/restore`, {
      method: 'POST',
    }),

  toggleStatus: (slug: string) =>
    apiV2Request<{
      id: number;
      slug: string;
      is_active: boolean;
      status: string;
    }>(`/share-profit-listings/${slug}/toggle-status`, {
      method: 'PATCH',
    }),

  forceDelete: (slug: string) =>
    apiV2Request(`/share-profit-listings/${slug}/force`, { method: 'DELETE' }),

  /**
   * Approve listing (Admin verification).
   */
  approve: (slug: string) =>
    apiV2Request<ShareProfitListing>(`/share-profit-listings/${slug}/verification`, {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    }),

  /**
   * Reject listing with required reason (Admin verification).
   */
  reject: (slug: string, reason: string) =>
    apiV2Request<ShareProfitListing>(`/share-profit-listings/${slug}/verification`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', reason }),
    }),

  /**
   * Renew expired listing (extends expires_at by configured renewal days).
   */
  renew: (slug: string) =>
    apiV2Request<{
      listing: ShareProfitListing;
      renewal_info: {
        previous_expiry: string | null;
        new_expiry: string | null;
        duration_days: number;
      };
    }>(`/share-profit-listings/${slug}/renew`, {
      method: 'POST',
    }),
};
