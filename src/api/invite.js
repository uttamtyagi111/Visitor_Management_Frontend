// invitee.js - API service for Django invitation management backend
import { API_BASE_URL } from "./config";
class InviteeAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication token from localStorage or your auth system
  getAuthToken() {
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  }

  // Helper method to handle API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Remove Content-Type for FormData requests
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all invites (Admin usage)
  async getInvites() {
    return await this.makeRequest('/invites/');
  }

  // Create new invite (Admin usage)
  async createInvite(inviteData) {
    return await this.makeRequest('/invites/', {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  }

  // Get invite details by primary key (Admin usage)
  async getInviteById(id) {
    return await this.makeRequest(`/invites/${id}/`);
  }

  // Update invite by primary key (Admin usage)
  async updateInvite(id, updateData) {
    return await this.makeRequest(`/invites/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete invite by primary key (Admin usage)
  async deleteInvite(id) {
    return await this.makeRequest(`/invites/${id}/`, {
      method: 'DELETE',
    });
  }

  // Get invite details by invite code (No auth required)
  async getInviteByCode(inviteCode) {
    return await this.makeRequest(`/invites/${inviteCode}/`, {
      headers: {} // No auth headers for public access
    });
  }

  // Update invite status
  async updateInviteStatus(id, status) {
    return await this.makeRequest(`/invites/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Verify invite by code
  async verifyInvite(inviteCode) {
    return await this.makeRequest('/invites/verify/', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
      headers: {} // No auth headers for public access
    });
  }

  // Capture visitor data (image upload)
  async captureVisitorData(inviteCode, imageFile) {
    const formData = new FormData();
    formData.append('invite_code', inviteCode);
    formData.append('image', imageFile);

    return await this.makeRequest('/invites/capture/', {
      method: 'POST',
      body: formData,
      headers: {} // No auth headers and no Content-Type (let browser set it for FormData)
    });
  }
}

// Create and export a singleton instance
const inviteeAPI = new InviteeAPI();

// Helper functions for the frontend
export const inviteeHelpers = {
  // Status options that match your Django choices
  statusOptions: [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'sent', label: 'Sent' },
    { value: 'cancelled', label: 'Cancelled' },
  ],

  // Get status color classes
  getStatusColor: (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'sent': 'bg-blue-100 text-blue-800 border-blue-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  // Format date for display
  formatDate: (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format datetime for display
  formatDateTime: (datetimeString) => {
    if (!datetimeString) return '';
    return new Date(datetimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  // Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number format
  validatePhone: (phone) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
  },

  // Validate UUID format for invite codes
  validateInviteCode: (code) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(code);
  },

  // Check if invite is expired
  isExpired: (expiryTime) => {
    if (!expiryTime) return false;
    return new Date(expiryTime) < new Date();
  },

  // Generate public invite URL
  generateInviteUrl: (inviteCode) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite/${inviteCode}`;
  },

  // Handle API errors consistently
  handleApiError: (error) => {
    if (error.message.includes('401')) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return 'Please login to continue';
    }
    
    if (error.message.includes('404')) {
      return 'Invite not found';
    }
    
    if (error.message.includes('400')) {
      return error.message || 'Invalid request';
    }
    
    return error.message || 'Something went wrong. Please try again.';
  }
};

export default inviteeAPI;