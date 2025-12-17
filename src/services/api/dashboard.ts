// Dashboard API functions
import { apiRequest, ApiResponse } from './base';

export interface DashboardStatistics {
  total_company: number;
  total_individual_user: number;
  total_property: number;
  total_wanting_list: number;
  total_appointment: number;
  credited_point: number;
  debit_point: number;
  total_revenue_from_payment: number;
  total_feedback: number;
  total_contactus: number;
  total_covered_location: number;
}

export const dashboardAPI = {
  // Get dashboard statistics
  getStatistics: (): Promise<ApiResponse<DashboardStatistics>> =>
    apiRequest<DashboardStatistics>('/dashboard/statistics'),
};

