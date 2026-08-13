import { api } from '../../../services/api';

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface RoleRequest {
  name: string;
  description: string;
}

export const RoleService = {
  getAll: async () => {
    const res = await api.get('/roles');
    return res.data;
  },
  create: async (data: RoleRequest) => {
    const res = await api.post('/roles', data);
    return res.data;
  },
  update: async (id: number, data: RoleRequest) => {
    const res = await api.put(`/roles/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/roles/${id}`);
    return res.data;
  }
};
