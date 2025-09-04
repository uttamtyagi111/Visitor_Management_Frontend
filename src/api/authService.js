import { API_BASE_URL } from './config';

// Helper function for making API requests
const apiRequest = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    // Only parse JSON if response has content
    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      throw new Error(data.error || data.detail || 'Request failed');
    }

    return { data, response };
  } catch (error) {
    throw error;
  }
};

export const authAPI = {
  // Register user
  register: async (userData) => {
    const { data } = await apiRequest(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return data;
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const { data } = await apiRequest(`${API_BASE_URL}/auth/verify-otp/`, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    return data;
  },

  // Login user
  login: async (email, password) => {
    const { data } = await apiRequest(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store tokens in localStorage
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const { data } = await apiRequest(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    // Update access token
    if (data.access) {
      localStorage.setItem('access_token', data.access);
    }

    return data;
  },

  // Get current user details
  getUserDetails: async () => {
    const { data } = await apiRequest(`${API_BASE_URL}/auth/me/`);
    return data;
  },

  // Logout user
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      await apiRequest(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const { data } = await apiRequest(`${API_BASE_URL}/auth/password-reset-request/`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data;
  },

  // Confirm password reset
  confirmPasswordReset: async (token, newPassword) => {
    const { data } = await apiRequest(`${API_BASE_URL}/auth/password-reset-confirm/?token=${token}`, {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    return data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user data
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  // Get refresh token
  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },
};

// Axios interceptor alternative for handling token refresh
export const setupAuthInterceptor = () => {
  // This can be used with fetch or axios to automatically handle token refresh
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    if (response.status === 401) {
      try {
        await authAPI.refreshToken();
        // Retry the original request with new token
        const token = authAPI.getAccessToken();
        if (args[1] && args[1].headers) {
          args[1].headers.Authorization = `Bearer ${token}`;
        }
        return originalFetch(...args);
      } catch (error) {
        // Refresh failed, redirect to login
        authAPI.logout();
        window.location.href = '/login';
        throw error;
      }
    }
    
    return response;
  };
};

export default authAPI;