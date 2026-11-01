import { api } from '../../../services/api';

export interface Permission {
  id: number;
  code: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions?: Permission[];
}

export interface RoleRequest {
  name: string;
  description: string;
}

export const RoleService = {
  getAll: async () => {
    const res = await api.get('/admin/roles');
    return res.data;
  },
  create: async (data: RoleRequest) => {
    const res = await api.post('/admin/roles', data);
    return res.data;
  },
  update: async (id: number, data: RoleRequest) => {
    const res = await api.put(`/admin/roles/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/admin/roles/${id}`);
    return res.data;
  }
};
