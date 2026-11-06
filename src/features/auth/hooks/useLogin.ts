import { useState } from 'react';
import { authService, type LoginPayload } from '../api/auth.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { ProfileService } from '../../../services/profile.service';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setTokens, setUser } = useAuthStore();

  const login = async (credentials: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        const { accessToken, refreshToken } = res.data;
        setTokens(accessToken, refreshToken);
        try {
          const profileRes = await ProfileService.getProfile();
          if (profileRes.success && profileRes.data) {
            const currentUser = useAuthStore.getState().user;
            setUser({ ...(currentUser || {}), ...profileRes.data } as any);
          }
        } catch (e) {
          console.error('Failed to fetch profile', e);
        }
        toast.success(res.message || 'Đăng nhập thành công!');
        return res.data;
      } else {
        toast.error(res.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};

