import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Clock, CheckCircle, XCircle, MoreVertical, Plus, Download, RefreshCw } from 'lucide-react';

const mockVisitors = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@techcorp.com',
    company: 'Tech Corp',
    purpose: 'Business Meeting',
    host: 'Sarah Johnson',
    checkIn: '09:30 AM',
    checkOut: null,
    status: 'checked-in',
    date: '2025-01-15',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria@designstudio.com',
    company: 'Design Studio',
    purpose: 'Project Review',
    host: 'Mike Wilson',
    checkIn: '10:15 AM',
    checkOut: '11:45 AM',
    status: 'checked-out',
    date: '2025-01-15',
    phone: '+1 (555) 987-6543',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david@innovation.io',
    company: 'Innovation Labs',
    purpose: 'Partnership Discussion',
    host: 'Emily Davis',
    checkIn: '02:00 PM',
    checkOut: null,
    status: 'scheduled',
    date: '2025-01-15',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: '4',
    name: 'Sophie Turner',
    email: 'sophie@consulting.com',
    company: 'Strategic Solutions',
    purpose: 'Consultation',
    host: 'Alex Brown',
    checkIn: '11:30 AM',
    checkOut: null,
    status: 'checked-in',
    date: '2025-01-15',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: '5',
    name: 'Michael Johnson',
    email: 'michael@startupco.com',
    company: 'StartupCo',
    purpose: 'Investment Meeting',
    host: 'Lisa Wang',
    checkIn: '03:30 PM',
    checkOut: '04:15 PM',
    status: 'checked-out',
    date: '2025-01-14',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
];

function Visitors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const filteredVisitors = mockVisitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      'checked-in': 'bg-green-100 text-green-800 border-green-200',
      'checked-out': 'bg-gray-100 text-gray-800 border-gray-200',
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const icons = {
      'checked-in': <CheckCircle className="w-4 h-4" />,
      'checked-out': <XCircle className="w-4 h-4" />,
      'scheduled': <Clock className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {icons[status]}
        <span className="capitalize">{status.replace('-', ' ')}</span>
      </span>
    );
  };

  return (
    <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Visitor Management</h1>
            <p className="text-gray-600 text-lg">Track and manage all visitor activities</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/70 border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-4 h-4" />
              <span>Add Visitor</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search visitors, companies, or emails..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Visitors Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Visitors List</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RefreshCw className="w-4 h-4" />
                <span>{filteredVisitors.length} visitors</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Visitor</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Host</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredVisitors.map((visitor, index) => (
                    <motion.tr
                      key={visitor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="hover:bg-white/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={visitor.avatar} 
                            alt={visitor.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{visitor.name}</p>
                            <p className="text-gray-600 text-sm">{visitor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{visitor.company}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{visitor.purpose}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{visitor.host}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{visitor.checkIn}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(visitor.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedVisitor(visitor)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredVisitors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">No visitors found matching your criteria</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Visitor Detail Modal */}
      <AnimatePresence>
        {selectedVisitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedVisitor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <img 
                  src={selectedVisitor.avatar} 
                  alt={selectedVisitor.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100"
                />
                <h3 className="text-2xl font-bold text-gray-900">{selectedVisitor.name}</h3>
                <p className="text-gray-600">{selectedVisitor.company}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900 font-medium">{selectedVisitor.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900 font-medium">{selectedVisitor.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Purpose</label>
                  <p className="text-gray-900 font-medium">{selectedVisitor.purpose}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Host</label>
                  <p className="text-gray-900 font-medium">{selectedVisitor.host}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  {getStatusBadge(selectedVisitor.status)}
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button 
                  onClick={() => setSelectedVisitor(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                  Edit Visitor
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStatusBadge(status) {
  const styles = {
    'checked-in': 'bg-green-100 text-green-800 border-green-200',
    'checked-out': 'bg-gray-100 text-gray-800 border-gray-200',
    'scheduled': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  const icons = {
    'checked-in': <CheckCircle className="w-4 h-4" />,
    'checked-out': <XCircle className="w-4 h-4" />,
    'scheduled': <Clock className="w-4 h-4" />
  };

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
      {icons[status]}
      <span className="capitalize">{status.replace('-', ' ')}</span>
    </span>
  );
}

export default Visitors;