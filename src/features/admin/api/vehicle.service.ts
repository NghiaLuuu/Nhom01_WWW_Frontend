import { api } from '../../../services/api';

export interface Vehicle {
  id: number;
  licensePlate: string;
  type?: string;
  capacity: number;
  status?: string;
}

export interface VehicleRequest {
  licensePlate: string;
  type?: string;
  capacity: number;
  status?: string;
}

export const VehicleService = {
  getAll: async () => {
    const res = await api.get('/vehicles');
    return res.data;
  },
  create: async (data: VehicleRequest) => {
    const res = await api.post('/vehicles', data);
    return res.data;
  },
  update: async (id: number, data: VehicleRequest) => {
    const res = await api.put(`/vehicles/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  }
};
