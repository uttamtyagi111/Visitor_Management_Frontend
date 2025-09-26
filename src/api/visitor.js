import { API_BASE_URL } from "./config";

// Helper function for making API requests
const apiRequest = async (url, options = {}) => {
  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle JSON body (don't set Content-Type for FormData)
  if (options.body && !(options.body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, config);

    // Handle token refresh on 401
    if (response.status === 401 && token) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem("access_token", refreshData.access);

            // Retry original request with new token
            config.headers.Authorization = `Bearer ${refreshData.access}`;
            return fetch(url, config);
          }
        } catch (refreshError) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          throw new Error("Session expired. Please log in again.");
        }
      }
    }

    // Parse response
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
      throw new Error(
        data?.error ||
          data?.detail ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const visitorAPI = {
  // Get all visitors with filters
  getVisitors: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    const url = `${API_BASE_URL}/visitors/${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return apiRequest(url, { method: "GET" });
  },

  // Get visitors with advanced filters
  getVisitorsWithFilters: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    // Handle date filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    const url = `${API_BASE_URL}/visitors/${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return apiRequest(url, { method: "GET" });
  },

  // Create new visitor (public endpoint for QR registration)
  createVisitor: async (visitorData, imageFile = null) => {
    const body = new FormData();

    Object.entries(visitorData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        body.append(key, value);
      }
    });

    // Add image if provided
    if (imageFile) {
      body.append("image", imageFile);
    }

    return apiRequest(`${API_BASE_URL}/visitor/`, {
      method: "POST",
      body,
    });
  },

  // Get single visitor
  getVisitor: async (visitorId) => {
    return apiRequest(`${API_BASE_URL}/visitors/${visitorId}/`, {
      method: "GET",
    });
  },

  // Update visitor
  updateVisitor: async (
    visitorId,
    visitorData,
    imageFile = null,
    passFile = null
  ) => {
    console.log('🔧 updateVisitor called with:', {
      visitorId,
      visitorData,
      hasImageFile: !!imageFile,
      hasPassFile: !!passFile,
      imageFileDetails: imageFile ? {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        constructor: imageFile.constructor.name,
        isFile: imageFile instanceof File,
        isBlob: imageFile instanceof Blob
      } : null
    });

    let body;
    let headers = {};

    // If image or pass file is present, use FormData
    if (imageFile || passFile) {
      console.log('🔧 Using FormData because image or pass file is present');
      body = new FormData();
      
      // Add visitor data fields
      Object.entries(visitorData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          body.append(key, value);
          console.log(`🔧 Added field to FormData: ${key} = ${value}`);
        }
      });

      if (imageFile) {
        console.log('📷 Adding image to FormData:', {
          size: imageFile.size,
          type: imageFile.type,
          name: imageFile.name || 'captured-image.jpg',
          constructor: imageFile.constructor.name,
          isFile: imageFile instanceof File,
          isBlob: imageFile instanceof Blob
        });
        
        // Ensure we're appending a proper File object
        if (imageFile instanceof File || imageFile instanceof Blob) {
          const fileName = imageFile.name || 'captured-image.jpg';
          body.append("image", imageFile, fileName);
          console.log('📷 ✅ Image successfully appended to FormData with name:', fileName);
        } else {
          console.error('📷 ❌ Invalid image file type:', typeof imageFile, imageFile);
          throw new Error('Invalid image file provided');
        }
      } else {
        console.log('📷 No image file provided - backend will keep existing image');
      }

      if (passFile) {
        console.log('📄 Adding pass file to FormData:', {
          size: passFile.size,
          type: passFile.type,
          name: passFile.name
        });
        body.append("pass_file", passFile);
        console.log('📄 ✅ Pass file successfully appended to FormData');
      }

      // Debug FormData contents
      console.log('📦 FormData entries being sent to backend:');
      for (let [key, value] of body.entries()) {
        if (value instanceof File) {
          console.log(`  📄 ${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type,
            isFile: true
          });
        } else {
          console.log(`  📝 ${key}:`, value);
        }
      }
      console.log('📦 Total FormData entries:', Array.from(body.entries()).length);
    } else {
      console.log('🔧 Using JSON because no files provided');
      // Otherwise, send JSON
      const filteredData = Object.entries(visitorData).reduce(
        (acc, [key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );
      body = JSON.stringify(filteredData);
      headers["Content-Type"] = "application/json";
      console.log('🔧 JSON body:', filteredData);
    }

    console.log('🚀 Making API request to:', `${API_BASE_URL}/visitors/${visitorId}/`);
    console.log('🚀 Request method: PATCH');
    console.log('🚀 Request headers:', headers);
    console.log('🚀 Request body type:', body instanceof FormData ? 'FormData' : 'JSON');

    const response = await apiRequest(`${API_BASE_URL}/visitors/${visitorId}/`, {
      method: "PATCH",
      body,
      headers,
    });

    console.log('✅ updateVisitor API response received:', response);
    return response;
  },

  // Update visitor status
  updateVisitorStatus: async (visitorId, status) => {
    return apiRequest(`${API_BASE_URL}/visitors/${visitorId}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Delete visitor
  deleteVisitor: async (visitorId) => {
    await apiRequest(`${API_BASE_URL}/visitors/${visitorId}/`, {
      method: "DELETE",
    });
    return true;
  },

  // Search visitors
  searchVisitors: async (searchTerm) => {
    return visitorAPI.getVisitorsWithFilters({ search: searchTerm });
  },

  // Convenience methods for status updates
  checkInVisitor: async (visitorId) => {
    return visitorAPI.updateVisitorStatus(visitorId, "checked_in");
  },

  checkOutVisitor: async (visitorId) => {
    return visitorAPI.updateVisitorStatus(visitorId, "checked_out");
  },

  approveVisitor: async (visitorId) => {
    return visitorAPI.updateVisitorStatus(visitorId, "approved");
  },

  rejectVisitor: async (visitorId) => {
    return visitorAPI.updateVisitorStatus(visitorId, "rejected");
  },

  // Get today's visitors
  getTodayVisitors: async () => {
    const today = new Date().toISOString().split("T")[0];
    return visitorAPI.getVisitorsWithFilters({
      created_at_after: today,
      created_at_before: today,
      ordering: "-check_in",
    });
  },

  // Get visitors by status
  getVisitorsByStatus: async (status) => {
    return visitorAPI.getVisitorsWithFilters({
      status,
      ordering: "-created_at",
    });
  },

  // Get visitor timeline
  async getVisitorTimeline(visitorId) {
    const response = await apiRequest(`${API_BASE_URL}/visitors/${visitorId}/timeline/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch visitor timeline');
    }
    
    return await response.json();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem("user");
    return !!(token && user);
  },
};

export default visitorAPI;
