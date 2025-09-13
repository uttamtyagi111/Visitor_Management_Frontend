import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Plus, 
  Mail, 
  Phone, 
  Building, 
  User, 
  X,
  Send,
  Edit,
  Trash2,
  Users,
  QrCode,
  Camera,
  Download,
  Check,
  ChevronRight,
  Upload,
  AlertCircle
} from 'lucide-react';

// Import the API service
import inviteeAPI, { inviteeHelpers } from '../../api/invite.js';
// Import the invite modal component
import InviteModal from '../invite/InviteModal';

function Invitees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invites, setInvites] = useState([]);
  
  const [inviteFormData, setInviteFormData] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    invited_by: '',
    purpose: '',
    visit_time: '',
    expiry_time: ''
  });


  // Load invites on component mount
  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const data = await inviteeAPI.getInvites();
      setInvites(data);
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredInvitees = invites.filter(invite => {
    const matchesSearch = invite.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.visitor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invite.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmitInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!inviteFormData.visitor_name || !inviteFormData.visitor_email || !inviteFormData.purpose) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      if (!inviteeHelpers.validateEmail(inviteFormData.visitor_email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate phone if provided
      if (inviteFormData.visitor_phone && !inviteeHelpers.validatePhone(inviteFormData.visitor_phone)) {
        throw new Error('Please enter a valid phone number');
      }

      const response = await inviteeAPI.createInvite(inviteFormData);
      
      // Backend returns the invite data with generated invite_code
      if (response && response.invite_code) {
        // Generate email template using backend invite code
        const emailTemplate = inviteeHelpers.generateInviteEmailTemplate(response);
        console.log('Email template generated:', emailTemplate);
        // You can use this emailTemplate to send emails via your backend
      }
      
      setSuccess(`Invitation sent successfully! Invite code: ${response.invite_code || 'Generated'}`);
      setShowInviteForm(false);
      resetForm();
      loadInvites(); // Reload the list
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteInvite = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      setLoading(true);
      await inviteeAPI.deleteInvite(id);
      setSuccess('Invitation deleted successfully');
      loadInvites();
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setLoading(true);
      await inviteeAPI.updateInviteStatus(id, newStatus);
      setSuccess('Status updated successfully');
      loadInvites();
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setInviteFormData({
      visitor_name: '',
      visitor_email: '',
      visitor_phone: '',
      invited_by: '',
      purpose: '',
      visit_time: '',
      expiry_time: ''
    });
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowInviteCodeModal(false);
    resetForm();
  };

  const getStatusBadge = (status) => {
    const colorClass = inviteeHelpers.getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Helper function
  const formatDateTimeLocal = (datetimeString) => {
    if (!datetimeString) return "";
    const date = new Date(datetimeString);
    // Return in YYYY-MM-DDTHH:mm format
    return date.toISOString().slice(0, 16);
  };


  return (
    <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite Management</h1>
            <p className="text-gray-600 text-base">Send invitations and manage upcoming visits</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowInviteCodeModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <QrCode className="w-5 h-5" />
              <span>Invite Code</span>
            </button>
            <button 
              onClick={() => setShowInviteForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Send Invitation</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>{success}</span>
            <button 
              onClick={() => setSuccess('')}
              className="ml-auto p-1 hover:bg-green-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto p-1 hover:bg-red-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search invitees, emails, or purpose..."
                />
              </div>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="all">All Status</option>
                {inviteeHelpers.statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Invitees Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* Desktop and Tablet Table View */}
          <div className="hidden md:block overflow-auto max-h-[600px]">
            <table className="w-full table-auto">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Invitee</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Host</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Invite_code</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Visit Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredInvitees.map((invite, index) => (
                    <motion.tr
                      key={invite.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="hover:bg-white/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{invite.visitor_name}</p>
                          <p className="text-gray-600 text-sm">{invite.visitor_email}</p>
                          {invite.visitor_phone && (
                            <p className="text-gray-500 text-xs">{invite.visitor_phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{invite.invited_by}</p>
                          {invite.created_at && (
                            <p className="text-gray-600 text-sm">
                              {inviteeHelpers.formatDateTime(invite.created_at)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{invite.invite_code || 'N/A'}</p>
                          {invite.status === 'checked_in' && (
                            <div className="group relative">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                                Pass Issued / Checked In
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{invite.purpose}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {inviteeHelpers.formatDateTime(invite.visit_time)}
                        </p>
                        {invite.expiry_time && (
                            <p className="text-gray-600 text-sm">
                              Expires: {inviteeHelpers.formatDateTime(invite.expiry_time)}
                            </p>
                          )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invite.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <select
                            value={invite.status}
                            onChange={(e) => handleStatusUpdate(invite.id, e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-200 rounded bg-white"
                            disabled={loading}
                          >
                            {inviteeHelpers.statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleDeleteInvite(invite.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            <AnimatePresence>
              {filteredInvitees.map((invite, index) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{invite.visitor_name}</h3>
                      <p className="text-sm text-gray-600">{invite.visitor_email}</p>
                      {invite.visitor_phone && (
                        <p className="text-sm text-gray-500">{invite.visitor_phone}</p>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {getStatusBadge(invite.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Host:</span>
                      <span className="text-gray-900 font-medium">{invite.invited_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Invite Code:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-medium font-mono text-xs">{invite.invite_code || 'N/A'}</span>
                        {invite.status === 'checked_in' && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Purpose:</span>
                      <span className="text-gray-900 font-medium text-right">{invite.purpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Visit Time:</span>
                      <span className="text-gray-900 font-medium text-right">
                        {inviteeHelpers.formatDateTime(invite.visit_time)}
                      </span>
                    </div>
                    {invite.expiry_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expires:</span>
                        <span className="text-gray-900 font-medium text-right">
                          {inviteeHelpers.formatDateTime(invite.expiry_time)}
                        </span>
                      </div>
                    )}
                    {invite.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900 font-medium text-right">
                          {inviteeHelpers.formatDateTime(invite.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <select
                      value={invite.status}
                      onChange={(e) => handleStatusUpdate(invite.id, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                      disabled={loading}
                    >
                      {inviteeHelpers.statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleDeleteInvite(invite.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredInvitees.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">No invitees found matching your criteria</p>
            </div>
          )}

          {loading && invites.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invitations...</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Regular Invite Form Modal */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Send Invitation</h3>
                <button 
                  onClick={() => setShowInviteForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmitInvite} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={inviteFormData.visitor_name}
                        onChange={(e) => setInviteFormData({...inviteFormData, visitor_name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={inviteFormData.visitor_email}
                        onChange={(e) => setInviteFormData({...inviteFormData, visitor_email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invited By *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={inviteFormData.invited_by}
                        onChange={(e) => setInviteFormData({...inviteFormData, invited_by: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter who invited the visitor"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={inviteFormData.visitor_phone}
                        onChange={(e) => setInviteFormData({...inviteFormData, visitor_phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visit Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={inviteFormData.visit_time}
                        onChange={(e) => setInviteFormData({...inviteFormData, visit_time: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={inviteFormData.expiry_time}
                      onChange={(e) => setInviteFormData({...inviteFormData, expiry_time: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit *</label>
                  <input
                    type="text"
                    value={inviteFormData.purpose}
                    onChange={(e) => setInviteFormData({...inviteFormData, purpose: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Business meeting, Interview, Product demo"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Code Modal */}
      <InviteModal
        isOpen={showInviteCodeModal}
        onClose={closeModal}
        isAdmin={true}
      />
    </div>
  );
}

export default Invitees;