import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/authStore';

// Single source of truth for the backend API
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 40000, // 40 second timeout for all API calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('meddynet_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamless Token Rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry 401s once by attempting a refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('meddynet_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Token rotation call
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.access_token;
        Cookies.set('meddynet_access_token', newAccessToken, { secure: true, sameSite: 'strict', path: '/' });
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Full logout on rotation failure
        Cookies.remove('meddynet_access_token');
        Cookies.remove('meddynet_refresh_token');
        useAuthStore.getState().logout();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
