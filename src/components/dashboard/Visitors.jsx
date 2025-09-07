import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Clock, CheckCircle, XCircle, MoreVertical, Plus, Download, RefreshCw, Users, Edit2, Save, X } from 'lucide-react';

import { visitorAPI } from '../../api/visitor'; // Import your actual API

function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  // Edit functionality state
  const [isEditing, setIsEditing] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch visitors on component mount and when filters change
  useEffect(() => {
    fetchVisitors();
  }, [statusFilter, dateFilter]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        fetchVisitors();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let filters = {};
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      // Apply date filter
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      switch (dateFilter) {
        case 'today':
          filters.created_at_after = today.toISOString().split('T')[0];
          filters.created_at_before = today.toISOString().split('T')[0];
          break;
        case 'yesterday':
          filters.created_at_after = yesterday.toISOString().split('T')[0];
          filters.created_at_before = yesterday.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filters.created_at_after = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filters.created_at_after = monthAgo.toISOString().split('T')[0];
          break;
      }

      const data = await visitorAPI.getVisitorsWithFilters(filters);
      setVisitors(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error fetching visitors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await visitorAPI.searchVisitors(searchTerm);
      setVisitors(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error searching visitors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (visitorId, newStatus) => {
    try {
      setUpdating(true);
      await visitorAPI.updateVisitorStatus(visitorId, newStatus);
      
      // Update the visitor in the local state
      setVisitors(prevVisitors => 
        prevVisitors.map(visitor => 
          visitor.id === visitorId 
            ? { ...visitor, status: newStatus }
            : visitor
        )
      );
      
      // Update selected visitor if it's the same one
      if (selectedVisitor && selectedVisitor.id === visitorId) {
        setSelectedVisitor(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating visitor status:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Edit functionality
  const handleEditVisitor = (visitor) => {
    setEditingVisitor(visitor);
    setEditForm({
      name: visitor.name || '',
      email: visitor.email || '',
      phone: visitor.phone || '',
      company: visitor.company || '',
      purpose: visitor.purpose || '',
      host: visitor.host || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      setUpdating(true);
      
      // Call API to update visitor
      const updatedVisitor = await visitorAPI.updateVisitor(editingVisitor.id, editForm);
      
      // Update local state
      setVisitors(prevVisitors =>
        prevVisitors.map(visitor =>
          visitor.id === editingVisitor.id
            ? { ...visitor, ...editForm }
            : visitor
        )
      );
      
      // Update selected visitor if it's the same one
      if (selectedVisitor && selectedVisitor.id === editingVisitor.id) {
        setSelectedVisitor(prev => ({ ...prev, ...editForm }));
      }
      
      // Close edit mode
      setIsEditing(false);
      setEditingVisitor(null);
      setEditForm({});
      
    } catch (err) {
      console.error('Error updating visitor:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingVisitor(null);
    setEditForm({});
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const refreshData = () => {
    fetchVisitors();
  };

  const filteredVisitors = visitors.filter(visitor => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      visitor.name?.toLowerCase().includes(searchLower) ||
      visitor.email?.toLowerCase().includes(searchLower) ||
      visitor.company?.toLowerCase().includes(searchLower) ||
      visitor.purpose?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const styles = {
      'checked_in': 'bg-green-100 text-green-800 border-green-200',
      'checked_out': 'bg-gray-100 text-gray-800 border-gray-200',
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    const icons = {
      'checked_in': <CheckCircle className="w-4 h-4" />,
      'checked_out': <XCircle className="w-4 h-4" />,
      'scheduled': <Clock className="w-4 h-4" />,
      'approved': <CheckCircle className="w-4 h-4" />,
      'rejected': <XCircle className="w-4 h-4" />,
      'pending': <Clock className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        <span className="capitalize">{status?.replace('_', ' ') || 'pending'}</span>
      </span>
    );
  };

  if (loading && visitors.length === 0) {
    return (
      <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Visitor Management</h1>
            <p className="text-gray-600 text-lg">Track and manage all visitor activities</p>
            {error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white/70 border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
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
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="scheduled">Scheduled</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
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
                            src={visitor.image || visitor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(visitor.name)}&background=random`} 
                            alt={visitor.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(visitor.name)}&background=random`;
                            }}
                          />
                          <div>
                            <p className="font-bold text-gray-900">{visitor.name}</p>
                            <p className="text-gray-600 text-sm">{visitor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{visitor.company || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{visitor.purpose || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{visitor.host || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            {visitor.check_in 
                              ? new Date(visitor.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Not checked in'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(visitor.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {visitor.status === 'scheduled' && (
                            <button
                              onClick={() => handleStatusUpdate(visitor.id, 'checked_in')}
                              disabled={updating}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              Check In
                            </button>
                          )}
                          {visitor.status === 'checked_in' && (
                            <button
                              onClick={() => handleStatusUpdate(visitor.id, 'checked_out')}
                              disabled={updating}
                              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              Check Out
                            </button>
                          )}
                          <button
                            onClick={() => handleEditVisitor(visitor)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Edit Visitor"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button 
                            onClick={() => setSelectedVisitor(visitor)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredVisitors.length === 0 && !loading && (
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
        {selectedVisitor && !isEditing && (
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
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <img 
                  src={selectedVisitor.image || selectedVisitor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVisitor.name)}&background=random`} 
                  alt={selectedVisitor.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVisitor.name)}&background=random`;
                  }}
                />
                <h3 className="text-2xl font-bold text-gray-900">{selectedVisitor.name}</h3>
                <p className="text-gray-600">{selectedVisitor.company || 'No company'}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900 font-medium">{selectedVisitor.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900 font-medium">{selectedVisitor.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Purpose</label>
                  <p className="text-gray-900 font-medium">{selectedVisitor.purpose || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Host</label>
                  <p className="text-gray-900 font-medium">{selectedVisitor.host || 'N/A'}</p>
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
                <button 
                  onClick={() => {
                    setSelectedVisitor(null);
                    handleEditVisitor(selectedVisitor);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  Edit Visitor
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Visitor Modal */}
      <AnimatePresence>
        {isEditing && editingVisitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleCancelEdit}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Visitor</h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter visitor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => handleFormChange('company', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                  <textarea
                    value={editForm.purpose}
                    onChange={(e) => handleFormChange('purpose', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter visit purpose"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host</label>
                  <input
                    type="text"
                    value={editForm.host}
                    onChange={(e) => handleFormChange('host', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter host name"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updating || !editForm.name || !editForm.email}
                  className="flex items-center justify-center space-x-2 flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Visitors;