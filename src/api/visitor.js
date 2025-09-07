import { API_BASE_URL } from './config';

// Helper function for making API requests (matches your authAPI pattern)
const apiRequest = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available (matches your authAPI)
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData requests
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);
    
    // Handle token refresh on 401 (matches your auth interceptor concept)
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('access_token', refreshData.access);
            
            // Retry original request with new token
            config.headers.Authorization = `Bearer ${refreshData.access}`;
            return fetch(url, config);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          throw new Error('Session expired. Please log in again.');
        }
      }
      throw new Error('Authentication required. Please log in.');
    }

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

export const visitorAPI = {
  // Get all visitors with filters (basic endpoint)
  getVisitors: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = `${API_BASE_URL}/visitors/${queryParams.toString() ? `?${queryParams}` : ''}`;
    const { data } = await apiRequest(url, { method: 'GET' });
    return data;
  },

  // Get visitors with advanced filters (uses the search endpoint)
  getVisitorsWithFilters: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Handle date filters - convert to the format expected by Django
    if (filters.created_at_after && filters.created_at_before) {
      if (filters.created_at_after === filters.created_at_before) {
        // Same day filter
        queryParams.append('created_at_after', filters.created_at_after);
        queryParams.append('created_at_before', filters.created_at_before);
      } else {
        queryParams.append('created_at_after', filters.created_at_after);
        queryParams.append('created_at_before', filters.created_at_before);
      }
    } else if (filters.created_at_after) {
      queryParams.append('created_at_after', filters.created_at_after);
    } else if (filters.created_at_before) {
      queryParams.append('created_at_before', filters.created_at_before);
    }

    // Handle other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && 
          !key.startsWith('created_at_')) {
        queryParams.append(key, value);
      }
    });
    
    const url = `${API_BASE_URL}/visitors/search/${queryParams.toString() ? `?${queryParams}` : ''}`;
    const { data } = await apiRequest(url, { method: 'GET' });
    return data;
  },

  // Create new visitor
  createVisitor: async (visitorData, imageFile = null) => {
    let body;
    let isFormData = false;
    
    if (imageFile) {
      body = new FormData();
      Object.entries(visitorData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          body.append(key, value);
        }
      });
      body.append('image', imageFile);
      isFormData = true;
    } else {
      body = JSON.stringify(visitorData);
    }

    const { data } = await apiRequest(`${API_BASE_URL}/visitors/`, {
      method: 'POST',
      body: body,
      headers: isFormData ? {} : undefined,
    });
    return data;
  },

  // Get single visitor
  getVisitor: async (visitorId) => {
    const { data } = await apiRequest(`${API_BASE_URL}/visitors/${visitorId}/`, {
      method: 'GET',
    });
    return data;
  },

  // Update visitor
  updateVisitor: async (visitorId, visitorData, imageFile = null) => {
    let body;
    let isFormData = false;
    
    if (imageFile) {
      body = new FormData();
      Object.entries(visitorData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          body.append(key, value);
        }
      });
      body.append('image', imageFile);
      isFormData = true;
    } else {
      // Filter out empty values for cleaner updates
      const filteredData = Object.entries(visitorData).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      body = JSON.stringify(filteredData);
    }

    const { data } = await apiRequest(`${API_BASE_URL}/visitors/${visitorId}/`, {
      method: 'PATCH', // Use PATCH for partial updates instead of PUT
      body: body,
      headers: isFormData ? {} : undefined,
    });
    return data;
  },

  // Update visitor status
  updateVisitorStatus: async (visitorId, status) => {
    const { data } = await apiRequest(`${API_BASE_URL}/visitors/${visitorId}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return data;
  },

  // Delete visitor
  deleteVisitor: async (visitorId) => {
    await apiRequest(`${API_BASE_URL}/visitors/${visitorId}/`, {
      method: 'DELETE',
    });
    return true;
  },

  // Get visitor timeline
  getVisitorTimeline: async (visitorId) => {
    const { data } = await apiRequest(`${API_BASE_URL}/visitors/${visitorId}/timeline/`, {
      method: 'GET',
    });
    return data;
  },

  // Convenience methods for status updates
  checkInVisitor: async (visitorId) => {
    return visitorAPI.updateVisitorStatus(visitorId, 'checked_in');
  },

  checkOutVisitor: async (visitorId) => {
    return visitorAPI.updateVisitorStatus(visitorId, 'checked_out');
  },

  approveVisitor: async (visitorId) => {
    return visitorAPI.updateVisitorStatus(visitorId, 'approved');
  },

  rejectVisitor: async (visitorId) => {
    return visitorAPI.updateVisitorStatus(visitorId, 'rejected');
  },

  // Search visitors (uses the search endpoint)
  searchVisitors: async (searchTerm) => {
    return visitorAPI.getVisitorsWithFilters({ search: searchTerm });
  },

  // Get today's visitors
  getTodayVisitors: async () => {
    const today = new Date().toISOString().split('T')[0];
    return visitorAPI.getVisitorsWithFilters({
      created_at_after: today,
      created_at_before: today,
      ordering: '-check_in'
    });
  },

  // Get visitors by status
  getVisitorsByStatus: async (status) => {
    return visitorAPI.getVisitorsWithFilters({ status, ordering: '-created_at' });
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },
};

export default visitorAPI;