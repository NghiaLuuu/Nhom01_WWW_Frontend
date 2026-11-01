import { api } from './api';

export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityName: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  endpoint: string | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const AuditLogService = {
  getAuditLogs: async (page: number, size: number, entityName?: string, userEmail?: string) => {
    const params: Record<string, string | number> = { page, size };
    if (entityName) {
      params.entityName = entityName;
    }
    if (userEmail) {
      params.userEmail = userEmail;
    }
    const res = await api.get('/audit-logs', { params });
    return res.data;
  },

  getEntityNames: async () => {
    const res = await api.get('/audit-logs/entity-names');
    return res.data;
  },

  searchUserEmails: async (keyword: string) => {
    const res = await api.get('/audit-logs/user-emails', { params: { keyword } });
    return res.data;
  },
};
