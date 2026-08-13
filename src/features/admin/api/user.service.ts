import { api } from '../../../services/api';
import { Role } from './role.service';

export interface User {
  id: string;
  fullName: string;
  email: string;
  status: string;
  role?: Role;
  staffCode?: string;
  position?: string;
  workStation?: string;
}

export interface StaffRequest {
  email: string;
  fullName: string;
  password?: string;
  staffCode?: string;
  position?: string;
  workStation?: string;
  roleId: number;
}

export const UserService = {
  getStaffs: async () => {
    const res = await api.get('/admin/staffs');
    return res.data;
  },
  getCustomers: async () => {
    const res = await api.get('/admin/customers');
    return res.data;
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
  }
};
