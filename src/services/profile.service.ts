import { api } from './api';

export const ProfileService = {
  getProfile: async () => {
    const res = await api.get('/me');
    return res.data;
  },
  updatePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const res = await api.put('/me/password', data);
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put('/me/profile', data);
    return res.data;
  }
};
