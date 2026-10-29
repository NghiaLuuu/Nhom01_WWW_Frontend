import { api } from '../../../services/api';

export interface Route {
  id: number;
  departureLocation: string;
  arrivalLocation: string;
  basePrice: number;
  distance?: number;
  distanceKm?: number;
  duration?: number;
  durationMinutes?: number;
  status?: boolean;
}

export interface RouteRequest {
  departureLocation: string;
  arrivalLocation: string;
  basePrice: number;
  distance?: number;
  distanceKm?: number;
  duration?: string | number;
  durationMinutes?: number;
}

export const RouteService = {
  getAll: async () => {
    const res = await api.get('/routes');
    return res.data;
  },
  create: async (data: RouteRequest) => {
    const res = await api.post('/routes', data);
    return res.data;
  },
  update: async (id: number, data: RouteRequest) => {
    const res = await api.put(`/routes/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/routes/${id}`);
    return res.data;
  }
};
