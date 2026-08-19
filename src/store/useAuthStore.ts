import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  fullName?: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setTokens: (accessToken: string, refreshToken: string) => {
        try {
          // Decode JWT to get user roles and info
          const decoded: any = jwtDecode(accessToken);
          
          set((state) => ({
            accessToken,
            refreshToken,
            isAuthenticated: true,
            user: {
              ...(state.user || {}),
              id: decoded.sub || '',
              email: decoded.sub || '',
              roles: decoded.roles || [], // Make sure your backend maps roles here
            } as User,
          }));
        } catch (error) {
          console.error("Failed to decode token", error);
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
);
