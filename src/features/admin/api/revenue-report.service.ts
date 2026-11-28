import { api } from '../../../services/api';

export interface RevenueReportFilter {
  fromDate?: string;
  toDate?: string;
  groupBy: 'DAY' | 'MONTH';
  scope: 'REAL' | 'DEMO';
}

export interface RevenueReport {
  fromDate: string | null;
  toDate: string | null;
  groupBy: 'DAY' | 'MONTH';
  scope: 'REAL' | 'DEMO';
  timeBasis: string;
  timezone: string;
  totals: {
    successfulAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    refundedPayments: number;
    paymentCount: number;
    bookingCount: number;
    successfulBookingCount: number;
    ticketCount: number;
    customerCount: number;
    tripCount: number;
  };
  trend: Array<{ periodStart: string; amount: number; paymentCount: number }>;
  routes: Array<{ routeId: number | null; departureLocation: string | null; arrivalLocation: string | null; amount: number; paymentCount: number }>;
  methods: Array<{ paymentMethod: string; amount: number; paymentCount: number }>;
  bookingStatuses: Array<{ status: string; count: number }>;
}

export interface RevenueTransaction {
  paymentId: number;
  bookingId: number;
  transactionId: string | null;
  customerName: string | null;
  departureLocation: string | null;
  arrivalLocation: string | null;
  departureTime: string | null;
  ticketCount: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
}

export interface RevenueTransactionPage {
  content: RevenueTransaction[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface RevenueTransactionFilter extends RevenueReportFilter {
  page: number;
  size: number;
  search?: string;
  status?: string;
  bookingStatus?: string;
  sort: 'NEWEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC';
}

export const RevenueReportService = {
  summary: async (filter: RevenueReportFilter, signal?: AbortSignal): Promise<RevenueReport> => {
    const res = await api.get('/admin/revenue-reports', { params: filter, signal });
    if (!res.data?.success || !res.data.data?.totals || !Array.isArray(res.data.data.trend)
      || !Array.isArray(res.data.data.routes) || !Array.isArray(res.data.data.methods) || !Array.isArray(res.data.data.bookingStatuses)) {
      throw new Error(res.data?.message || 'Máy chủ chưa trả về dữ liệu báo cáo hợp lệ.');
    }
    return res.data.data;
  },
  transactions: async (filter: RevenueTransactionFilter, signal?: AbortSignal): Promise<RevenueTransactionPage> => {
    const { groupBy: _groupBy, ...params } = filter;
    const res = await api.get('/admin/revenue-reports/transactions', { params, signal });
    if (!res.data?.success || !Array.isArray(res.data.data?.content) || typeof res.data.data.totalElements !== 'number') {
      throw new Error(res.data?.message || 'Máy chủ chưa trả về danh sách giao dịch hợp lệ.');
    }
    return res.data.data;
  },
};
