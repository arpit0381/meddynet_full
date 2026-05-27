import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout for slow serverless cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add JWT token to requests dynamically from store
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle authentication errors and logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get an unauthorized error, we should log out and clear the session
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Use the store logout instead of directly clearing localStorage
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
