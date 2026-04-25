import axios from 'axios';
import useAuthStore from '../store/authStore';

/**
 * 🌐 API Client - Centralized Axios instance
 * 
 * Features:
 * - Automatic token injection
 * - Error handling and token refresh
 * - Request/response logging
 * - Base URL configuration
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== REQUEST INTERCEPTOR ==========
apiClient.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState();
    const token = state.token;

    if (token) {
      // Add token to headers
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }

    // Log request
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });

    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ========== RESPONSE INTERCEPTOR ==========
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const state = useAuthStore.getState();

    if (error.response?.status === 401) {
      console.error('🔐 Unauthorized - clearing auth');
      // Clear auth on 401 (token expired or invalid)
      useAuthStore.setState({
        user: null,
        token: null,
        userType: null,
        isAuthenticated: false,
      });

      // Redirect to login
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      console.error('❌ Forbidden - access denied');
    }

    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.msg || error.message,
    });

    return Promise.reject(error);
  }
);

export default apiClient;
