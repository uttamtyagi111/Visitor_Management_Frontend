import { API_BASE_URL } from './config';

const REPORTS_API_URL = `${API_BASE_URL}/reports`;

// Helper function for making authenticated API requests
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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Get all reports with optional filters
export const getReports = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    if (filters.date_from) {
      queryParams.append('date_from', filters.date_from);
    }
    if (filters.date_to) {
      queryParams.append('date_to', filters.date_to);
    }

    const url = queryParams.toString() 
      ? `${REPORTS_API_URL}/?${queryParams.toString()}`
      : `${REPORTS_API_URL}/`;

    const data = await apiRequest(url, { method: 'GET' });
    return data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Get a specific report by ID
export const getReportById = async (id) => {
  try {
    const data = await apiRequest(`${REPORTS_API_URL}/${id}/`, { method: 'GET' });
    return data;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
};

// Update a report
export const updateReport = async (id, reportData) => {
  try {
    const data = await apiRequest(`${REPORTS_API_URL}/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(reportData),
    });
    return data;
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

// Delete a report
export const deleteReport = async (id) => {
  try {
    await apiRequest(`${REPORTS_API_URL}/${id}/`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

// Export reports data
export const exportReports = async (format = 'csv', filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${REPORTS_API_URL}/export/?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error exporting reports:', error);
    throw error;
  }
};

// Utility function to format date for display
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Utility function to get status based on check-in/check-out times
export const getReportStatus = (checkIn, checkOut) => {
  if (!checkIn) return 'scheduled';
  if (checkIn && !checkOut) return 'checked-in';
  if (checkIn && checkOut) return 'checked-out';
  return 'unknown';
};
