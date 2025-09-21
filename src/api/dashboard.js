import { API_BASE_URL } from './config.js';
import { authAPI } from './authService.js';

/**
 * Dashboard API Service
 * Integrates all dashboard-related API endpoints for visitor management system
 */

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to make authenticated API requests with automatic token refresh
const makeAuthenticatedRequest = async (url, options = {}) => {
  const requestOptions = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  let response = await fetch(url, requestOptions);

  // If we get a 401, try to refresh the token and retry once
  if (response.status === 401) {
    try {
      await authAPI.refreshToken();
      // Update headers with new token and retry
      requestOptions.headers = {
        ...getAuthHeaders(),
        ...options.headers,
      };
      response = await fetch(url, requestOptions);
    } catch (refreshError) {
      // If refresh fails, redirect to login
      console.error('Token refresh failed:', refreshError);
      authAPI.logout();
      window.location.href = '/login';
      throw new Error('Authentication failed. Please log in again.');
    }
  }

  return response;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// =====================
// STATS CARDS APIs
// =====================

/**
 * Get Total Visitors Statistics
 * @returns {Promise<Object>} Total visitors data with growth metrics
 */
export const getTotalVisitorsStats = async () => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/reports/stats/total-visitors/`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching total visitors stats:', error);
    throw error;
  }
};

/**
 * Get Active Visits Statistics
 * @returns {Promise<Object>} Active visits data with visitor details
 */
export const getActiveVisitsStats = async () => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/reports/stats/active-visits/`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching active visits stats:', error);
    throw error;
  }
};

/**
 * Get Average Duration Statistics
 * @returns {Promise<Object>} Average duration data with breakdown
 */
export const getAverageDurationStats = async () => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/reports/stats/average-duration/`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching average duration stats:', error);
    throw error;
  }
};

/**
 * Get Today Scheduled Statistics
 * @returns {Promise<Object>} Today's scheduled visits data with growth
 */
export const getTodayScheduledStats = async () => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/reports/stats/today-scheduled/`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching today scheduled stats:', error);
    throw error;
  }
};

/**
 * Get All Dashboard Stats at Once
 * @returns {Promise<Object>} Combined stats data
 */
export const getAllDashboardStats = async () => {
  try {
    const [totalVisitors, activeVisits, avgDuration, todayScheduled] = await Promise.all([
      getTotalVisitorsStats(),
      getActiveVisitsStats(),
      getAverageDurationStats(),
      getTodayScheduledStats(),
    ]);

    return {
      totalVisitors: totalVisitors.data,
      activeVisits: activeVisits.data,
      avgDuration: avgDuration.data,
      todayScheduled: todayScheduled.data,
    };
  } catch (error) {
    console.error('Error fetching all dashboard stats:', error);
    throw error;
  }
};

// =====================
// CHARTS APIs
// =====================

/**
 * Get Visitor Trends Chart Data
 * @param {number} days - Number of days to fetch (default: 7)
 * @returns {Promise<Object>} Visitor trends data for charts
 */
export const getVisitorTrendsChart = async (days = 7) => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/reports/charts/visitor-trends/?days=${days}`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching visitor trends chart:', error);
    throw error;
  }
};

/**
 * Get Today's Activity Chart Data (Hourly breakdown)
 * @returns {Promise<Object>} Hourly activity data for today
 */
export const getTodaysActivityChart = async () => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/reports/charts/todays-activity/`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching today\'s activity chart:', error);
    throw error;
  }
};

/**
 * Get Today's Status Distribution (Pie Chart)
 * @returns {Promise<Object>} Status distribution data for pie chart
 */
export const getTodaysStatusDistribution = async () => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/reports/charts/status-distribution/`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    throw error;
  }
};

/**
 * Get All Chart Data at Once
 * @param {number} trendDays - Number of days for trends (default: 7)
 * @returns {Promise<Object>} Combined chart data
 */
export const getAllChartData = async (trendDays = 7) => {
  try {
    const [visitorTrends, todaysActivity, statusDistribution] = await Promise.all([
      getVisitorTrendsChart(trendDays),
      getTodaysActivityChart(),
      getTodaysStatusDistribution(),
    ]);

    return {
      visitorTrends: visitorTrends.data,
      todaysActivity: todaysActivity.data,
      statusDistribution: statusDistribution.data,
    };
  } catch (error) {
    console.error('Error fetching all chart data:', error);
    throw error;
  }
};

// =====================
// VISITOR MANAGEMENT APIs
// =====================

/**
 * Checkout a visitor
 * @param {string} visitorId - ID of the visitor to checkout
 * @returns {Promise<Object>} Checkout response
 */
export const checkoutVisitor = async (visitorId) => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/visitors/${visitorId}/checkout/`, {
      method: 'POST',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error checking out visitor:', error);
    throw error;
  }
};

/**
 * Get Completed Visits (Checked out visitors)
 * @param {number} limit - Number of completed visits to fetch (default: 20)
 * @param {number} offset - Offset for pagination (default: 0)
 * @returns {Promise<Object>} Completed visits data
 */
export const getCompletedVisits = async (limit = 20, offset = 0) => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/visits/completed/?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching completed visits:', error);
    throw error;
  }
};

// =====================
// RECENT ACTIVITY API
// =====================

/**
 * Get Recent Activity Feed
 * @param {number} limit - Number of recent activities to fetch (default: 10)
 * @returns {Promise<Object>} Recent activities data
 */
export const getRecentActivityFeed = async (limit = 10) => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/reports/activity/recent/?limit=${limit}`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching recent activity feed:', error);
    throw error;
  }
};

// =====================
// COMBINED DASHBOARD DATA
// =====================

/**
 * Get Complete Dashboard Data
 * Fetches all dashboard components in optimized way
 * @param {Object} options - Configuration options
 * @param {number} options.trendDays - Days for trend analysis (default: 7)
 * @param {number} options.activityLimit - Limit for recent activities (default: 10)
 * @returns {Promise<Object>} Complete dashboard data
 */
export const getCompleteDashboardData = async (options = {}) => {
  const { trendDays = 7, activityLimit = 10 } = options;

  try {
    const [stats, charts, recentActivity] = await Promise.all([
      getAllDashboardStats(),
      getAllChartData(trendDays),
      getRecentActivityFeed(activityLimit),
    ]);

    return {
      success: true,
      data: {
        stats,
        charts,
        recentActivity: recentActivity.data,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching complete dashboard data:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

// =====================
// UTILITY FUNCTIONS
// =====================

/**
 * Transform API stats data to match component format
 * @param {Object} apiStats - Raw API stats data
 * @returns {Array} Formatted stats array for components
 */
export const transformStatsForComponents = (apiStats) => {
  if (!apiStats) return [];

  const { totalVisitors, activeVisits, avgDuration, todayScheduled } = apiStats;

  return [
    {
      title: 'Total Visitors',
      value: totalVisitors?.total_visitors?.toLocaleString() || '0',
      change: totalVisitors?.growth || '0%',
      trend: totalVisitors?.growth?.startsWith('+') ? 'up' : totalVisitors?.growth?.startsWith('-') ? 'down' : 'neutral',
      icon: 'Users',
      color: 'from-blue-600 to-blue-700',
      additionalInfo: {
        today: totalVisitors?.today_visitors || 0,
        yesterday: totalVisitors?.yesterday_visitors || 0,
        // Only show count, not visitor details
        showCount: true,
      },
    },
    {
      title: 'Active Visits',
      value: activeVisits?.active_visits?.toString() || '0',
      change: '+0%', // Active visits don't have growth comparison
      trend: 'neutral',
      icon: 'UserCheck',
      color: 'from-green-600 to-green-700',
      additionalInfo: {
        // Only show active visitors (not checked out)
        activeVisitors: activeVisits?.active_visitors?.filter(visitor => 
          visitor.status === 'checked_in' || visitor.status === 'active'
        ) || [],
        showActiveOnly: true,
      },
    },
    {
      title: 'Avg. Duration',
      value: avgDuration?.average_duration || '0m',
      change: '+0%', // Duration doesn't have growth comparison
      trend: 'neutral',
      icon: 'Clock',
      color: 'from-purple-600 to-purple-700',
      additionalInfo: {
        totalMinutes: avgDuration?.total_minutes || 0,
        completedVisits: avgDuration?.completed_visits_count || 0,
      },
    },
    {
      title: 'Today Scheduled',
      value: todayScheduled?.today_scheduled?.toString() || '0',
      change: todayScheduled?.growth || '0%',
      trend: todayScheduled?.growth?.startsWith('+') ? 'up' : todayScheduled?.growth?.startsWith('-') ? 'down' : 'neutral',
      icon: 'Calendar',
      color: 'from-orange-600 to-orange-700',
      additionalInfo: {
        yesterday: todayScheduled?.yesterday_scheduled || 0,
        recentInvites: todayScheduled?.recent_invites || [],
      },
    },
  ];
};

/**
 * Transform visitor trends data for chart components
 * @param {Object} trendsData - Raw API trends data
 * @returns {Array} Formatted data for bar/line charts
 */
export const transformVisitorTrendsForChart = (trendsData) => {
  if (!trendsData?.visitor_trends || !trendsData?.invite_trends) return [];

  return trendsData.visitor_trends.map((visitorDay, index) => ({
    date: visitorDay.date,
    day: visitorDay.display_date,
    dayName: visitorDay.day_name,
    visitors: visitorDay.visitors,
    invites: trendsData.invite_trends[index]?.invites || 0,
    checkedIn: visitorDay.visitors, // Assuming visitors are checked in
  }));
};

/**
 * Transform hourly activity data for line chart
 * @param {Object} activityData - Raw API hourly activity data
 * @returns {Array} Formatted data for line chart
 */
export const transformHourlyActivityForChart = (activityData) => {
  if (!activityData?.hourly_activity) return [];

  return activityData.hourly_activity.map(hour => ({
    time: hour.hour_display,
    hour: hour.hour,
    visitors: hour.activity,
    isCurrentHour: hour.is_current_hour,
    isPeak: hour.is_peak,
  }));
};

/**
 * Transform status distribution for pie chart
 * @param {Object} statusData - Raw API status distribution data
 * @returns {Array} Formatted data for pie chart
 */
export const transformStatusDistributionForChart = (statusData) => {
  if (!statusData?.distribution) return [];

  return statusData.distribution.map(status => ({
    name: status.label,
    value: status.percentage,
    count: status.count,
    color: status.color,
  }));
};

/**
 * Transform recent activity data for activity feed
 * @param {Object} activityData - Raw API recent activity data
 * @returns {Array} Formatted data for activity feed
 */
export const transformRecentActivityForFeed = (activityData) => {
  if (!activityData?.recent_activities) return [];

  return activityData.recent_activities.map(activity => {
    // Generate a consistent avatar URL with proper encoding
    const visitorName = activity.visitor_name || 'Unknown Visitor';
    const encodedName = encodeURIComponent(visitorName);
    
    // Use visitor's actual image if available, otherwise generate avatar
    const avatarUrl = activity.visitor_image 
      ? activity.visitor_image 
      : `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&size=100&bold=true`;

    return {
      id: activity.id,
      name: visitorName,
      action: getActionText(activity.status, activity.action_type),
      time: activity.time_ago,
      exactTime: activity.exact_time,
      status: activity.action_type,
      visitorType: activity.visitor_type,
      durationInfo: activity.duration_info,
      avatar: avatarUrl,
      fallbackAvatar: `https://ui-avatars.com/api/?name=${encodedName}&background=6B7280&color=fff&size=100&bold=true`,
    };
  });
};

/**
 * Helper function to get proper action text based on status
 * @param {string} status - The status from API
 * @param {string} actionType - The action type from API
 * @returns {string} Formatted action text
 */
const getActionText = (status, actionType) => {
  switch (actionType?.toLowerCase()) {
    case 'checkin':
      return 'checked in';
    case 'checkout':
      return 'checked out';
    case 'scheduled':
      return 'scheduled visit';
    case 'cancelled':
      return 'cancelled visit';
    default:
      return status?.toLowerCase() || 'unknown action';
  }
};

// =====================
// ERROR HANDLING & RETRY
// =====================

/**
 * Retry failed API calls with exponential backoff
 * @param {Function} apiCall - The API function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise} Result of the API call
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`API call failed (attempt ${attempt}/${maxRetries}):`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
};

/**
 * Get dashboard data with fallback to cached data
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Dashboard data with fallback
 */
export const getDashboardDataWithFallback = async (options = {}) => {
  const cacheKey = 'dashboard_data_cache';
  const cacheTimeKey = 'dashboard_data_cache_time';
  const cacheValidityMs = 5 * 60 * 1000; // 5 minutes

  try {
    // Try to get fresh data
    const freshData = await getCompleteDashboardData(options);
    
    if (freshData.success) {
      // Cache the fresh data
      localStorage.setItem(cacheKey, JSON.stringify(freshData));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
      return freshData;
    }
    
    throw new Error('API returned unsuccessful response');
  } catch (error) {
    console.warn('Failed to fetch fresh dashboard data, trying cache:', error);
    
    // Try to use cached data
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheTimeKey);
    
    if (cachedData && cacheTime) {
      const cacheAge = Date.now() - parseInt(cacheTime);
      
      if (cacheAge < cacheValidityMs) {
        console.info('Using cached dashboard data');
        const parsedCache = JSON.parse(cachedData);
        return {
          ...parsedCache,
          fromCache: true,
          cacheAge: Math.round(cacheAge / 1000 / 60), // minutes
        };
      }
    }
    
    // Return empty state if no cache available
    console.error('No valid cache available, returning empty state');
    return {
      success: false,
      error: 'Unable to fetch dashboard data and no valid cache available',
      data: {
        stats: {},
        charts: {},
        recentActivity: { recent_activities: [] },
      },
      fromCache: false,
    };
  }
};

export default {
  // Stats APIs
  getTotalVisitorsStats,
  getActiveVisitsStats,
  getAverageDurationStats,
  getTodayScheduledStats,
  getAllDashboardStats,
  
  // Charts APIs
  getVisitorTrendsChart,
  getTodaysActivityChart,
  getTodaysStatusDistribution,
  getAllChartData,
  
  // Visitor Management APIs
  checkoutVisitor,
  getCompletedVisits,
  
  // Activity API
  getRecentActivityFeed,
  
  // Combined APIs
  getCompleteDashboardData,
  getDashboardDataWithFallback,
  
  // Transform utilities
  transformStatsForComponents,
  transformVisitorTrendsForChart,
  transformHourlyActivityForChart,
  transformStatusDistributionForChart,
  transformRecentActivityForFeed,
  
  // Utility functions
  retryApiCall,
};
