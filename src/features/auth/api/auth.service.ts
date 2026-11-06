import { api } from '../../../services/api';

export interface LoginPayload {
  email?: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export const authService = {
  login: async (credentials: LoginPayload) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (payload: RegisterPayload) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },
  verifyOtp: async (email: string, otp: string) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },
  refreshToken: async (refreshToken: string) => {
    const res = await api.post('/auth/refresh-token', { refreshToken });
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
  }
};

