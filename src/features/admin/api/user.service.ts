import { api } from '../../../services/api';
import { type Role } from './role.service';

export interface User {
  id: string;
  fullName: string;
  email: string;
  status: string;
  role?: Role;
  staffCode?: string;
  position?: string;
  workStation?: string;
  permissions?: string[];
}

export interface StaffRequest {
  email: string;
  fullName: string;
  password?: string;
  staffCode?: string;
  position?: string;
  workStation?: string;
  roleId?: number;
  permissions?: string[];
}

export interface UserPage {
  content: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface StaffView extends Omit<User, 'role'> {
  roleId: number | null;
  roleName: string | null;
}

const normalizeStaff = (staff: StaffView): User => ({
  ...staff,
  role: staff.roleId == null ? undefined : {
    id: staff.roleId,
    name: staff.roleName || '',
    description: '',
  },
});

export interface UserSearch {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
}

export const UserService = {
  getStaffs: async (params: UserSearch = {}) => {
    const res = await api.get('/admin/staffs', { params });
    return { ...res.data, data: { ...res.data.data, content: res.data.data.content.map(normalizeStaff) } } as {
      success: boolean; data: UserPage;
    };
  },
  getCustomers: async (params: UserSearch = {}) => {
    const res = await api.get('/admin/customers', { params });
    return res.data as { success: boolean; data: UserPage };
  },
  createStaff: async (data: StaffRequest) => {
    const res = await api.post('/admin/staffs', data);
    return res.data;
  },
  updateStaff: async (id: string, data: StaffRequest) => {
    const res = await api.put(`/admin/staffs/${id}`, data);
    return res.data;
  },
  updateStaffStatus: async (id: string, status: string) => {
    const res = await api.patch(`/admin/staffs/${id}/status`, { status });
    return res.data;
  },
  updateCustomerStatus: async (id: string, status: string) => {
    const res = await api.patch(`/admin/customers/${id}/status`, { status });
    return res.data;
  },
  resetStaffPassword: async (id: string, newPassword: string) => {
    const res = await api.patch(`/admin/staffs/${id}/reset-password`, { newPassword });
    return res.data;
  },
  resetCustomerPassword: async (id: string, newPassword: string) => {
    const res = await api.patch(`/admin/customers/${id}/reset-password`, { newPassword });
    return res.data;
  }
};
