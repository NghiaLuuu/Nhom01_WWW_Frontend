import { api } from '../../../services/api';

export type RevenueGroupBy = 'DAY' | 'MONTH';

export interface RevenueFilters {
  from: string;
  to: string;
  groupBy: RevenueGroupBy;
}

export interface RevenueReport extends RevenueFilters {
  currency: string;
  grossRevenue: number;
  successfulPayments: number;
  cancelledBookingReceipts: number;
  series: { period: string; revenue: number; paymentCount: number }[];
  byPaymentMethod: { paymentMethod: string; revenue: number; paymentCount: number }[];
}

export const ReportService = {
  getRevenue: async (filters: RevenueFilters, signal?: AbortSignal): Promise<RevenueReport> => {
    const response = await api.get('/admin/statistics/revenue', { params: filters, signal });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Không thể tải báo cáo doanh thu');
    }
    return response.data.data;
  },
};
