import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, UserCheck, Clock, Calendar, Eye, Activity, MapPin } from 'lucide-react';

const visitorData = [
  { month: 'Jan', visitors: 120, checkedIn: 95 },
  { month: 'Feb', visitors: 150, checkedIn: 125 },
  { month: 'Mar', visitors: 180, checkedIn: 160 },
  { month: 'Apr', visitors: 220, checkedIn: 200 },
  { month: 'May', visitors: 280, checkedIn: 250 },
  { month: 'Jun', visitors: 320, checkedIn: 290 },
];

const dailyTrends = [
  { time: '9 AM', visitors: 12 },
  { time: '10 AM', visitors: 28 },
  { time: '11 AM', visitors: 45 },
  { time: '12 PM', visitors: 38 },
  { time: '1 PM', visitors: 52 },
  { time: '2 PM', visitors: 41 },
  { time: '3 PM', visitors: 35 },
  { time: '4 PM', visitors: 29 },
  { time: '5 PM', visitors: 18 },
];

const statusData = [
  { name: 'Checked In', value: 68, color: '#10B981' },
  { name: 'Scheduled', value: 22, color: '#3B82F6' },
  { name: 'Completed', value: 10, color: '#8B5CF6' },
];

const stats = [
  {
    title: 'Total Visitors',
    value: '1,284',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'from-blue-600 to-blue-700'
  },
  {
    title: 'Active Visits',
    value: '47',
    change: '+8%',
    trend: 'up',
    icon: UserCheck,
    color: 'from-green-600 to-green-700'
  },
  {
    title: 'Avg. Duration',
    value: '2.4h',
    change: '-5%',
    trend: 'down',
    icon: Clock,
    color: 'from-purple-600 to-purple-700'
  },
  {
    title: 'Today Scheduled',
    value: '23',
    change: '+15%',
    trend: 'up',
    icon: Calendar,
    color: 'from-orange-600 to-orange-700'
  },
];

const recentActivities = [
  { name: 'Alex Johnson', action: 'checked in', time: '2 min ago', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', status: 'in' },
  { name: 'Maria Garcia', action: 'scheduled visit', time: '15 min ago', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', status: 'scheduled' },
  { name: 'David Chen', action: 'checked out', time: '1 hour ago', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', status: 'out' },
  { name: 'Sophie Turner', action: 'invited guest', time: '2 hours ago', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', status: 'invited' },
];

function DashboardHome() {
  return (
    <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600 text-base">Monitor your visitor management analytics and real-time insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
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
                      : 'text-red-700 bg-red-100'
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
                <span>Last 6 months</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                  }}
                />
                <Bar dataKey="visitors" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="checkedIn" fill="#10B981" radius={[4, 4, 0, 0]} />
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
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
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
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-bold truncate">{activity.name}</p>
                    <p className="text-gray-600 text-sm">{activity.action}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-gray-500 text-xs">{activity.time}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      activity.status === 'in' ? 'bg-green-500' :
                      activity.status === 'scheduled' ? 'bg-blue-500' :
                      activity.status === 'out' ? 'bg-gray-400' : 'bg-purple-500'
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