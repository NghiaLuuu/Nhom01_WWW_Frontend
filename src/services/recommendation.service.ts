import { api } from './api';

export interface RecommendedTrip {
  tripId: number;
  routeId: number;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  price: number;
  vehicleType: string;
  licensePlate: string;
  availableSeats: number;
  matchScore: number;
  reason: string;
  personaCluster: string;
  badgeText: string;
}

export interface PersonaInfo {
  persona: string;
  displayName: string;
  description: string;
}

export const recommendationService = {
  getRecommendations: async (anonymousId?: string, customerId?: string, limit = 5): Promise<RecommendedTrip[]> => {
    const params = new URLSearchParams();
    if (anonymousId) params.append('anonymousId', anonymousId);
    if (customerId) params.append('customerId', customerId);
    params.append('limit', limit.toString());

    const res = await api.get(`/recommendations?${params.toString()}`);
    return res.data?.data || [];
  },

  inferPersona: async (anonymousId?: string, customerId?: string): Promise<PersonaInfo | null> => {
    const params = new URLSearchParams();
    if (anonymousId) params.append('anonymousId', anonymousId);
    if (customerId) params.append('customerId', customerId);

    const res = await api.get(`/recommendations/persona?${params.toString()}`);
    return res.data?.data || null;
  }
};

