import { API_BASE_URL } from './config';

// Helper function for making API requests (copied from authService)
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
        throw new Error(data.error || data.detail || data.message || 'Request failed');
      }
      throw new Error(data || 'Request failed');
    }

    return { data, response };
  } catch (error) {
    throw error;
  }
};

export const qrCodeService = {
  // Generate a new QR code
  generateQRCode: async (qrData) => {
    try {
      const formData = new FormData();
      
      // Add all fields to form data
      Object.keys(qrData).forEach(key => {
        if (key === 'logo' && qrData[key]) {
          formData.append('logo', qrData[key]);
        } else if (qrData[key] !== undefined && qrData[key] !== null) {
          formData.append(key, qrData[key]);
        }
      });

      const { data } = await apiRequest(`${API_BASE_URL}/qr/codes/`, {
        method: 'POST',
        body: formData,
      });
      return data;
    } catch (error) {
      // For development: return mock data if backend is not available
      if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
        console.warn('Backend not available, using client-side QR generation');
        
        // Generate QR code using Google Charts API as fallback
        const size = qrData.size || 256;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData.text)}&bgcolor=${(qrData.background || '#ffffff').replace('#', '')}&color=${(qrData.foreground || '#000000').replace('#', '')}`;
        
        return {
          id: Date.now(),
          image: qrUrl,
          text: qrData.text,
          size: qrData.size || 256,
          error_correction: qrData.error_correction || 'M',
          background: qrData.background || '#ffffff',
          foreground: qrData.foreground || '#000000',
          created_at: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  // Get all QR codes for the current user
  getQRCodes: async () => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/qr/codes/`);
      return data;
    } catch (error) {
      // For development: return empty array if backend is not available
      if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
        console.warn('Backend not available, returning empty QR codes array');
        return [];
      }
      throw error;
    }
  },

  // Get a single QR code by ID
  getQRCode: async (id) => {
    const { data } = await apiRequest(`${API_BASE_URL}/qr/codes/${id}/`, {
      method: 'GET',
    });
    return data;
  },

  // Delete a QR code
  deleteQRCode: async (id) => {
    const { data } = await apiRequest(`${API_BASE_URL}/qr/codes/${id}/`, {
      method: 'DELETE',
    });
    return data;
  }
};
