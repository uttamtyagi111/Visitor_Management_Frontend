import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, UserCheck, Clock, Calendar, Eye, Activity, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import {
  getDashboardDataWithFallback,
  transformStatsForComponents,
  transformVisitorTrendsForChart,
  transformHourlyActivityForChart,
  transformStatusDistributionForChart,
  transformRecentActivityForFeed,
} from '../../api/dashboard.js';

// Icon mapping for dynamic icon rendering
const iconMap = {
  Users,
  UserCheck,
  Clock,
  Calendar,
};

function DashboardHome() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await getDashboardDataWithFallback({
        trendDays: 7,
        activityLimit: 10,
      });

      if (result.success || result.fromCache) {
        setDashboardData(result.data);
        setLastUpdated(new Date());
        if (result.fromCache) {
          console.info(`Using cached data (${result.cacheAge} minutes old)`);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Transform API data for components
  const stats = dashboardData ? transformStatsForComponents(dashboardData.stats) : [];
  const visitorData = dashboardData ? transformVisitorTrendsForChart(dashboardData.charts.visitorTrends) : [];
  const dailyTrends = dashboardData ? transformHourlyActivityForChart(dashboardData.charts.todaysActivity) : [];
  const statusData = dashboardData ? transformStatusDistributionForChart(dashboardData.charts.statusDistribution) : [];
  const recentActivities = dashboardData ? transformRecentActivityForFeed(dashboardData.recentActivity) : [];

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Fetching your visitor management analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchDashboardData()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600 text-base">Monitor your visitor management analytics and real-time insights</p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || Users;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    stat.trend === 'up' 
                      ? 'text-green-700 bg-green-100' 
                      : stat.trend === 'down'
                      ? 'text-red-700 bg-red-100'
                      : 'text-gray-700 bg-gray-100'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-1xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-500 font-medium">{stat.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-4">
          {/* Visitor Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="xl:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Visitor Trends</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                <span>Last 7 days</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value, name) => [
                    value,
                    name === 'visitors' ? 'Visitors' : name === 'invites' ? 'Invites' : name
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="visitors" fill="#3B82F6" radius={[4, 4, 0, 0]} name="visitors" />
                <Bar dataKey="invites" fill="#10B981" radius={[4, 4, 0, 0]} name="invites" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Today's Status</h3>
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Daily Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="xl:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Today's Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value) => [value, 'Visitors']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={(props) => {
                    const { cx, cy, payload, index } = props;
                    return (
                      <circle
                        key={`dot-${index}`}
                        cx={cx}
                        cy={cy}
                        r={payload?.isPeak ? 6 : 4}
                        fill={payload?.isCurrentHour ? '#F59E0B' : '#8B5CF6'}
                        strokeWidth={2}
                        stroke="white"
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/50 transition-all duration-200 border border-transparent hover:border-blue-200"
                >
                  <img 
                    src={activity.avatar} 
                    alt={activity.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                    onError={(e) => {
                      // Fallback to generated avatar if image fails to load
                      e.target.src = activity.fallbackAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.name)}&background=6B7280&color=fff&size=100&bold=true`;
                    }}
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-bold truncate">{activity.name}</p>
                    <p className="text-gray-600 text-sm">{activity.action}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-gray-500 text-xs">{activity.time}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      activity.status === 'checkin' ? 'bg-green-500' :
                      activity.status === 'checkout' ? 'bg-gray-400' :
                      activity.status === 'scheduled' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default DashboardHome;