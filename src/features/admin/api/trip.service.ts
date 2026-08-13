import { api } from '../../../services/api';
import { Route } from './route.service';
import { Vehicle } from './vehicle.service';

export interface Trip {
  id: number;
  route: Route;
  vehicle: Vehicle;
  departureTime: string;
  price: number;
  status?: string;
}

export interface TripRequest {
  routeId: number;
  vehicleId: number;
  departureTime: string;
  price: number;
  status?: string;
}

export const TripService = {
  getAll: async () => {
    const res = await api.get('/trips');
    return res.data;
  },
  create: async (data: TripRequest) => {
    const res = await api.post('/trips', data);
    return res.data;
  },
  update: async (id: number, data: TripRequest) => {
    const res = await api.put(`/trips/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/trips/${id}`);
    return res.data;
  }
};
