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
    
    console.log('Making request to:', url);
    console.log('Request method:', options.method || 'GET');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Log request headers and body
    console.log('Request headers:', config.headers);
    if (options.body) {
      if (options.body instanceof FormData) {
        console.log('Request body is FormData');
        // Log FormData entries
        for (let [key, value] of options.body.entries()) {
          console.log(`FormData[${key}]:`, value);
        }
        delete config.headers['Content-Type']; // Let the browser set the correct boundary
      } else {
        console.log('Request body:', options.body);
      }
    }

    try {
      console.log('Sending request...');
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status, response.statusText);
      
      // Clone the response so we can read it multiple times
      const responseClone = response.clone();
      
      try {
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
          console.error('API error response:', data);
          throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
      } catch (jsonError) {
        // If JSON parsing fails, try to get the response as text
        console.error('Failed to parse JSON response:', jsonError);
        const text = await responseClone.text();
        console.log('Raw response text:', text);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
        }
        
        // If we get here, the response was successful but not valid JSON
        return text;
      }
    } catch (error) {
      console.error('API request failed:', {
        error: error.message,
        url,
        method: options.method || 'GET',
        headers: config.headers,
        body: options.body,
      });
      throw error;
    }
  }

  // Get all invites (Admin usage)
  async getInvites() {
    console.log('API: Getting invites from /invites/');
    const result = await this.makeRequest('/invites/');
    console.log('API: getInvites result:', result);
    return result;
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
  async updateInvite(id, updateData, isFormData = false) {
    const config = {
      method: 'PATCH',
    };

    if (isFormData) {
      // For FormData, let the browser set the Content-Type with boundary
      config.body = updateData;
    } else {
      // For JSON data
      config.body = JSON.stringify(updateData);
    }

    return await this.makeRequest(`/invites/${id}/`, config);
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

  // Update invite status (with optional check-in/check-out times and pass file)
  // Uses backend endpoint: /invites/<int:pk>/status/ (UpdateInviteStatusView)
  async updateInviteStatus(id, status, options = {}, passFile = null) {
    if (passFile) {
      // Use FormData when pass file is included
      const formData = new FormData();
      formData.append('status', status);
      
      // Add optional check-in time (visit_time)
      if (options.visit_time) {
        formData.append('visit_time', options.visit_time);
      }
      
      // Add optional check-out time
      if (options.checked_out) {
        formData.append('checked_out', options.checked_out);
      }
      
      // Clear check-out time when checking in (for new visit session)
      if (options.clearCheckedOut) {
        formData.append('checked_out', '');
      }
      
      // Clear both check-in and check-out times when status changes to created or reinvited
      if (status === 'created' || status === 'reinvited') {
        console.log('🔄 Clearing previous check-in/check-out times for status:', status);
        formData.append('visit_time', '');
        formData.append('checked_out', '');
      }
      
      // Add pass file
      formData.append('pass_file', passFile, 'pass.png');
      
      console.log('🔄 UpdateInviteStatus with pass file - using /status/ endpoint');
      
      return await this.makeRequest(`/invites/${id}/status/`, {
        method: 'PATCH',
        body: formData,
      });
    } else {
      // Use JSON when no file
      const payload = { status };
      
      // Add optional check-in time (visit_time)
      if (options.visit_time) {
        payload.visit_time = options.visit_time;
      }
      
      // Add optional check-out time
      if (options.checked_out) {
        payload.checked_out = options.checked_out;
      }
      
      // Clear check-out time when checking in (for new visit session)
      if (options.clearCheckedOut) {
        payload.checked_out = null;
      }
      
      // Clear both check-in and check-out times when status changes to created or reinvited
      if (status === 'created' || status === 'reinvited') {
        console.log('🔄 Clearing previous check-in/check-out times for status:', status);
        payload.visit_time = null;
        payload.checked_out = null;
      }
      
      console.log('🔄 UpdateInviteStatus payload:', payload);
      
      return await this.makeRequest(`/invites/${id}/status/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
  }

  // Check-in visitor (sets status to checked_in with current time and clears previous check-out)
  async checkInVisitor(id) {
    const currentTime = new Date().toISOString();
    return await this.updateInviteStatus(id, 'checked_in', {
      visit_time: currentTime,
      clearCheckedOut: true  // Clear previous check-out time for new visit session
    });
  }

  // Check-out visitor (sets status to checked_out with current time)
  async checkOutVisitor(id) {
    const currentTime = new Date().toISOString();
    return await this.updateInviteStatus(id, 'checked_out', {
      checked_out: currentTime
    });
  }

  // Verify invite code (No auth required)
  // Uses backend endpoint: /invites/verify/ (VerifyInviteView)
  async verifyInviteCode(inviteCode) {
    return await this.makeRequest('/invites/verify/', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header for public access
      }
    });
  }

  // Alias for backward compatibility
  async verifyInvite(inviteCode) {
    return await this.verifyInviteCode(inviteCode);
  }

  // Capture visitor data (image upload only - NO status change, NO pass file)
  // Uses backend endpoint: /invites/capture/ (CaptureinviteDataView)
  async captureVisitorData(inviteCode, imageFile, imageUrl = null) {
    console.log('captureVisitorData called with:', { inviteCode, hasImageFile: !!imageFile, imageUrl });
    
    const formData = new FormData();
    formData.append('invite_code', inviteCode);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (imageUrl) {
      formData.append('image_url', imageUrl);
    }

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log('captureVisitorData FormData:', key, value);
    }

    try {
      const response = await this.makeRequest('/invites/capture/', {
        method: 'PATCH',
        body: formData,
        headers: {}
      });
      
      console.log('captureVisitorData response:', response);
      return response;
    } catch (error) {
      console.error('Error in captureVisitorData:', error);
      throw error;
    }
  }

  // Get invite timeline data (sorted by most recent first)
  async getInviteTimeline(inviteId) {
    try {
      console.log('API: Getting timeline for invite:', inviteId);
      const result = await this.makeRequest(`/invites/${inviteId}/timeline/`);
      
      // Sort timeline entries by timestamp in descending order (most recent first)
      if (Array.isArray(result)) {
        const sortedTimeline = result.sort((a, b) => {
          // Try different timestamp field names that might be used
          const timeA = new Date(a.timestamp || a.created_at || a.date || a.time);
          const timeB = new Date(b.timestamp || b.created_at || b.date || b.time);
          return timeB - timeA; // Descending order (newest first)
        });
        
        console.log('API: Timeline sorted (newest first):', sortedTimeline.length, 'entries');
        console.log('📅 Timeline order:', sortedTimeline.map(item => ({
          status: item.status || item.action,
          time: item.timestamp || item.created_at || item.date || item.time
        })));
        return sortedTimeline;
      }
      
      return result || [];
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  }

  // Reinvite with updated details
  async reinviteInvite(id, reinviteData) {
    console.log('🔄 API: Reinvite data:', reinviteData);
    console.log('🔄 API: JSON stringified:', JSON.stringify(reinviteData));
    
    return await this.makeRequest(`/invites/${id}/reinvite/`, {
      method: 'POST',
      body: JSON.stringify(reinviteData),
    });
  }
}

// Create and export a singleton instance
const inviteeAPI = new InviteeAPI();

// Helper functions for the frontend
export const inviteeHelpers = {
  // Status options that match your Django choices
  statusOptions: [
    { value: 'created', label: 'Created' },
    { value: 'pending', label: 'Pending' },
    // { value: 'sent', label: 'Sent' },
    { value: 'reinvited', label: 'Re-invited' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'checked_in', label: 'Checked In' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'expired', label: 'Expired' },
    // { value: 'cancelled', label: 'Cancelled' },
  ],

  // Get status color classes
  getStatusColor: (status) => {
    const colors = {
      'created': 'bg-gray-100 text-gray-800 border-gray-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'reinvited': 'bg-purple-100 text-purple-800 border-purple-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'expired': 'bg-red-100 text-red-800 border-red-200',
      'checked_in': 'bg-blue-100 text-blue-800 border-blue-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'checked_out': 'bg-gray-100 text-gray-800 border-gray-200',
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

  // Validate invite code format (6 hex chars from UUID, matches backend)
  validateInviteCode: (code) => {
    const shortCodeRegex = /^[a-f0-9]{6}$/i;
    return shortCodeRegex.test(code);
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

  // Generate email template for invite (uses backend-generated invite_code)
  generateInviteEmailTemplate: (inviteData) => {
    const inviteUrl = inviteeHelpers.generateInviteUrl(inviteData.invite_code);
    return {
      subject: `Invitation to Visit Wish Geeks Techserve - ${inviteData.purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Wish Geeks Techserve</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Visit Details</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Visitor:</strong> ${inviteData.visitor_name}</p>
              <p style="margin: 8px 0;"><strong>Purpose:</strong> ${inviteData.purpose}</p>
              <p style="margin: 8px 0;"><strong>Invited by:</strong> ${inviteData.invited_by}</p>
              <p style="margin: 8px 0;"><strong>Visit Time:</strong> ${inviteeHelpers.formatDateTime(inviteData.visit_time)}</p>
              <p style="margin: 8px 0;"><strong>Valid Until:</strong> ${inviteeHelpers.formatDateTime(inviteData.expiry_time)}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f0f9ff; border: 2px dashed #0ea5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; color: #0c4a6e; font-weight: bold;">Your Invite Code:</p>
                <p style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #0ea5e9; margin: 0; letter-spacing: 2px;">${inviteData.invite_code}</p>
              </div>
              
              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Complete Your Registration</a>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">What to do next:</h3>
              <ol style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Click the link above or visit: <code>${inviteUrl}</code></li>
                <li>Enter your invite code: <strong>${inviteData.invite_code}</strong></li>
                <li>Verify your details</li>
                <li>Take or upload your photo</li>
                <li>You're all set for your visit!</li>
              </ol>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Need help? Contact us at <a href="mailto:reception@wishgeeks.com" style="color: #2563eb;">reception@wishgeeks.com</a></p>
              <p style="margin: 10px 0 0 0;">&copy; 2024 Wish Geeks Techserve. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
      text: `
You're invited to visit Wish Geeks Techserve!

Visit Details:
- Visitor: ${inviteData.visitor_name}
- Purpose: ${inviteData.purpose}
- Invited by: ${inviteData.invited_by}
- Visit Time: ${inviteeHelpers.formatDateTime(inviteData.visit_time)}
- Valid Until: ${inviteeHelpers.formatDateTime(inviteData.expiry_time)}

Your Invite Code: ${inviteData.invite_code}

To complete your registration:
1. Visit: ${inviteUrl}
2. Enter your invite code: ${inviteData.invite_code}
3. Verify your details
4. Take or upload your photo
5. You're all set for your visit!

Need help? Contact us at reception@wishgeeks.com
      `
    };
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