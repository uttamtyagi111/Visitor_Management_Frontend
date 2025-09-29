import { API_BASE_URL } from './config';

// Helper function for making API requests
const apiRequest = async (url, options = {}) => {
  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // Add Content-Type only if not FormData and not explicitly set
  if (!config.headers['Content-Type'] && !(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

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
      // Handle different error response formats
      if (data && typeof data === 'object') {
        // If data contains field-specific errors, throw the entire object
        if (data.current_password || data.new_password || data.new_password2 || data.non_field_errors) {
          const error = new Error('Validation failed');
          error.message = data;
          throw error;
        }
        // Otherwise, use the error message or detail
        throw new Error(data.error || data.detail || data.message || 'Request failed');
      }
      throw new Error(data || 'Request failed');
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

    // Store tokens in localStorage with extended expiration (7 days)
    if (data.access) {
      const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('token_expiration', expirationTime.toString());
      localStorage.setItem('last_activity', Date.now().toString());
      
      // Only store user data if it exists, otherwise it will be fetched later
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
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

    // Update access token and extend expiration
    if (data.access) {
      const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('token_expiration', expirationTime.toString());
      localStorage.setItem('last_activity', Date.now().toString());
    }

    return data;
  },

  // Get current user details
  getUserDetails: async () => {
    const { data } = await apiRequest(`${API_BASE_URL}/auth/me/`);
    return data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const config = {
      method: 'PATCH', // Using PATCH as per backend API
      body: profileData instanceof FormData ? profileData : JSON.stringify(profileData),
    };
    
    // Use /auth/me/ endpoint as per backend UserDetailView
    const { data } = await apiRequest(`${API_BASE_URL}/auth/me/`, config);
    
    // Update stored user data
    if (data) {
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const { data } = await apiRequest(`${API_BASE_URL}/auth/change-password/`, {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
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
      localStorage.removeItem('token_expiration');
      localStorage.removeItem('last_activity');
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

  // Check if user is authenticated and token hasn't expired
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    const expirationTime = localStorage.getItem('token_expiration');
    
    if (!token || !expirationTime) {
      return false;
    }
    
    // Check if token has expired (7 days)
    const now = Date.now();
    const expiration = parseInt(expirationTime);
    
    if (now >= expiration) {
      // Token expired, clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiration');
      localStorage.removeItem('last_activity');
      return false;
    }
    
    // Update last activity
    localStorage.setItem('last_activity', now.toString());
    
    return true;
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

  // Check and clean expired tokens
  checkTokenExpiration: () => {
    const expirationTime = localStorage.getItem('token_expiration');
    
    if (expirationTime) {
      const now = Date.now();
      const expiration = parseInt(expirationTime);
      
      if (now >= expiration) {
        // Token expired, clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expiration');
        localStorage.removeItem('last_activity');
        return false; // Token was expired and cleared
      }
      
      // Update last activity if token is valid
      localStorage.setItem('last_activity', now.toString());
      return true; // Token is still valid
    }
    return false; // No expiration time found
  },

  // Get remaining time until token expires (in milliseconds)
  getTokenTimeRemaining: () => {
    const expirationTime = localStorage.getItem('token_expiration');
    
    if (expirationTime) {
      const now = Date.now();
      const expiration = parseInt(expirationTime);
      const remaining = expiration - now;
      
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  },

  // Check if token needs refresh (refresh if less than 2 days remaining)
  shouldRefreshToken: () => {
    const remaining = authAPI.getTokenTimeRemaining();
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000; // Refresh earlier
    console.log('🔄 Token time remaining:', Math.floor(remaining / (1000 * 60 * 60)), 'hours');
    return remaining > 0 && remaining < twoDaysInMs;
  },

  // Update user activity timestamp
  updateActivity: () => {
    localStorage.setItem('last_activity', Date.now().toString());
  },

  // Get last activity timestamp
  getLastActivity: () => {
    const lastActivity = localStorage.getItem('last_activity');
    return lastActivity ? parseInt(lastActivity) : null;
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