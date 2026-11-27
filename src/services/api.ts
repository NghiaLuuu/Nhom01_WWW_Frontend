import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Multiple protected requests can fail at the same time (React Strict Mode, a
// page loading several resources, etc.). The backend rotates refresh tokens,
// so those requests must share one refresh operation rather than refresh in
// parallel and invalidate each other.
let refreshPromise: Promise<string | null> | null = null;

// Request Interceptor to attach Access Token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is 401 and the request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Do not attempt to refresh the refresh-token request itself.
        if (originalRequest.url?.includes('/auth/refresh-token')) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        const { refreshToken, setTokens, logout } = useAuthStore.getState();
        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        refreshPromise ??= axios
          .post(`${API_URL}/auth/refresh-token`, { refreshToken })
          .then((res) => {
            const tokens = res.data?.data;
            if (!tokens?.accessToken || !tokens?.refreshToken) {
              throw new Error('Invalid refresh-token response');
            }
            setTokens(tokens.accessToken, tokens.refreshToken);
            return tokens.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });

        const accessToken = await refreshPromise;
        if (accessToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log the user out completely
        useAuthStore.getState().logout();
      }
      
      // Fallback: Just logout if we can't refresh
      useAuthStore.getState().logout();
    }
    
    return Promise.reject(error);
  }
);
