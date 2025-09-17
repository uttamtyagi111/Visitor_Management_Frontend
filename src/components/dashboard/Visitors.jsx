import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  ThumbsUp, 
  ThumbsDown,
  Download,
  User,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  MoreVertical,
  Save
} from 'lucide-react';

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
  const [showPassModal, setShowPassModal] = useState(false);
  const [passVisitor, setPassVisitor] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Memoized date calculations for better performance
  const dateFilters = useMemo(() => {
    const today = new Date();
    const filters = {};
    
    switch (dateFilter) {
      case 'today':
        filters.created_at_after = today.toISOString().split('T')[0];
        filters.created_at_before = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
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
      default:
        break;
    }
    return filters;
  }, [dateFilter]);

  const fetchVisitors = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = { 
        ...dateFilters,
        page,
        page_size: itemsPerPage,
        ordering: '-created_at' // Most recent first
      };
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const data = await visitorAPI.getVisitorsWithFilters(filters);
      const results = Array.isArray(data) ? data : data.results || data || [];
      
      setVisitors(results);
      setTotalItems(data.count || results.length);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching visitors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilters, itemsPerPage]);

  // Handle page changes
  const handlePageChange = useCallback((page) => {
    fetchVisitors(page);
  }, [fetchVisitors]);

  // Optimized debounce search with useCallback
  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.trim()) {
        handleSearch(term);
      } else {
        fetchVisitors();
      }
    }, 300),
    [statusFilter, dateFilter]
  );

  // Fetch visitors on component mount and when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchVisitors(1);
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearch = useCallback(async (term = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      
      // Combine search with current filters for better results
      const filters = { ...dateFilters };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (term.trim()) {
        filters.search = term.trim();
      }
      
      const data = await visitorAPI.getVisitorsWithFilters(filters);
      setVisitors(Array.isArray(data) ? data : data.results || data || []);
    } catch (err) {
      console.error('Error searching visitors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFilters]);

  const handleStatusUpdate = useCallback(async (visitorId, newStatus) => {
    try {
      setUpdating(true);
      await visitorAPI.updateVisitorStatus(visitorId, newStatus);
      
      // Optimistic update for better UX
      setVisitors(prevVisitors => 
        prevVisitors.map(visitor => 
          visitor.id === visitorId 
            ? { ...visitor, status: newStatus, updated_at: new Date().toISOString() }
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
      // Revert optimistic update on error
      fetchVisitors();
    } finally {
      setUpdating(false);
    }
  }, [selectedVisitor, fetchVisitors]);

  // Edit functionality
  const handleEditVisitor = (visitor) => {
    setEditingVisitor(visitor);
    setEditForm({
      name: visitor.name || '',
      email: visitor.email || '',
      phone: visitor.phone || '',
      // company: visitor.company || '',
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

  const handleGeneratePass = useCallback(async (visitorId) => {
    try {
      setUpdating(true);
      
      // Find the visitor
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor) {
        throw new Error('Visitor not found');
      }
      
      // Set the visitor for pass generation
      setPassVisitor(visitor);
      setShowPassModal(true);
      
      // Update visitor to show pass generated
      setVisitors(prevVisitors => 
        prevVisitors.map(v => 
          v.id === visitorId 
            ? { ...v, pass_generated: true, status: 'checked_in'}
            : v
        )
      );
      await visitorAPI.updateVisitorStatus(visitorId, { status: 'checked_in' });
      // Update selected visitor if it's the same one
      if (selectedVisitor && selectedVisitor.id === visitorId) {
        setSelectedVisitor(prev => ({ ...prev, pass_generated: true }));
      }
    } catch (err) {
      console.error('Error generating pass:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }, [visitors, selectedVisitor]);

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const refreshData = () => {
    fetchVisitors();
  };

  // Pass download functionality
  const handleDownloadPass = useCallback(() => {
    if (!passVisitor) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 600);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#8B5CF6');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);
    
    // Add company header
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VISITOR PASS', 200, 50);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Wish Geeks Techserve', 200, 80);
    
    // Create a function to draw the pass with the image
    const drawPass = (img = null) => {
      // Clear and redraw background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 600);
      
      // Redraw header text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VISITOR PASS', 200, 50);
      
      ctx.font = '16px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Wish Geeks Techserve', 200, 80);
      
      // Draw visitor image if available
      if (img) {
        // Create a circular mask for the image
        ctx.save();
        ctx.beginPath();
        ctx.arc(200, 170, 50, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Draw the image
        ctx.drawImage(img, 150, 120, 100, 100);
        ctx.restore();
        
        // Add white border
        ctx.beginPath();
        ctx.arc(200, 170, 50, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else {
        // Fallback to placeholder if no image
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(200, 170, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Add initial letter
        const initials = (passVisitor.name || passVisitor.firstName || 'V').charAt(0).toUpperCase() + 
                        (passVisitor.lastName || '').charAt(0).toUpperCase();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 200, 170);
      }
      
      // Add visitor details
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(passVisitor.name || `${passVisitor.firstName || ''} ${passVisitor.lastName || ''}`.trim(), 200, 260);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(passVisitor.email || '', 200, 285);
      
      // Add visit details
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Visit Time:', 50, 340);
      ctx.fillStyle = 'white';
      ctx.fillText(new Date().toLocaleString(), 150, 340);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Purpose:', 50, 370);
      ctx.fillStyle = 'white';
      ctx.fillText(passVisitor.purpose || 'General Visit', 150, 370);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Status:', 50, 400);
      ctx.fillStyle = 'white';
      ctx.fillText(passVisitor.status || 'Approved', 150, 400);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('ID:', 50, 430);
      ctx.fillStyle = 'white';
      ctx.fillText(`#${passVisitor.id}`, 150, 430);
      
      // Add footer
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px Arial';
      ctx.fillText('Please wear this pass at all times during your visit', 200, 520);
      ctx.fillText('Generated on: ' + new Date().toLocaleDateString(), 200, 540);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visitor-pass-${passVisitor.name || passVisitor.firstName || 'visitor'}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    
    // Try to load the visitor's image using fetch API
    const loadImageWithFetch = async (url) => {
      try {
        console.log('Attempting to fetch image:', url);
        const response = await fetch(url, {
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const img = new Image();
        
        img.onload = () => {
          console.log('Image loaded successfully via fetch');
          drawPass(img);
          // Clean up the object URL after the image is loaded
          URL.revokeObjectURL(imageUrl);
        };
        
        img.onerror = (e) => {
          console.error('Error creating image from blob:', e);
          drawPass();
          URL.revokeObjectURL(imageUrl);
        };
        
        img.src = imageUrl;
      } catch (error) {
        console.error('Error loading image with fetch:', error);
        // Fallback to regular image loading if fetch fails
        loadImageDirectly(url);
      }
    };
    
    // Fallback method using regular image loading
    const loadImageDirectly = (url) => {
      console.log('Trying direct image load for:', url);
      const img = new Image();
      
      img.onload = () => {
        console.log('Image loaded successfully with direct method');
        drawPass(img);
      };
      
      img.onerror = (e) => {
        console.error('Direct image load failed:', e);
        drawPass();
      };
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const urlWithTimestamp = url.includes('?') 
        ? `${url}&t=${timestamp}` 
        : `${url}?t=${timestamp}`;
      
      img.crossOrigin = 'anonymous';
      img.src = urlWithTimestamp;
    };
    
    // Get the image URL and start loading
    const imageUrl = passVisitor.image || passVisitor.imageUrl || passVisitor.photo;
    console.log('Image URL:', imageUrl);
    
    if (imageUrl) {
      // First try with fetch API, fallback to direct loading
      loadImageWithFetch(imageUrl);
    } else {
      console.log('No image URL available for visitor');
      // No image URL, draw without it
      drawPass();
    }
  }, [passVisitor]);

  // For client-side filtering when search is active
  const filteredVisitors = useMemo(() => {
    return visitors; // Server-side filtering is now handled in API calls
  }, [visitors]);

  // Memoized visitor statistics
  const visitorStats = useMemo(() => {
    const stats = {
      total: filteredVisitors.length,
      checked_in: 0,
      checked_out: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    filteredVisitors.forEach(visitor => {
      const status = visitor.status || 'pending';
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });
    
    return stats;
  }, [filteredVisitors]);

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Visitor Management</h1>
            <p className="text-gray-600 text-base">Track and manage all visitor activities</p>
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
            {/* <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-4 h-4" />
              <span>Add Visitor</span>
            </button> */}
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-4"
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
          {/* <div className="p-6 border-b border-gray-200"> */}
            {/* <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Visitors List</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RefreshCw className="w-4 h-4" />
                <span>{filteredVisitors.length} visitors</span>
              </div>
            </div> */}
          {/* </div> */}

          {/* Desktop and Tablet Table View */}
          <div className="hidden md:block overflow-auto max-h-[600px]">
            <table className="w-full table-auto">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Visitor</th>
                  {/* <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Company</th> */}
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
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 relative">
                            {(visitor.image || visitor.imageUrl || visitor.photo) ? (
                              <img
                                src={visitor.image || visitor.imageUrl || visitor.photo}
                                alt={`${visitor.name || visitor.firstName + ' ' + visitor.lastName}`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentElement.querySelector('.fallback-avatar');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                                onLoad={(e) => {
                                  const fallback = e.target.parentElement.querySelector('.fallback-avatar');
                                  if (fallback) fallback.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`fallback-avatar w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg absolute top-0 left-0 ${(visitor.image || visitor.imageUrl || visitor.photo) ? 'hidden' : 'flex'}`}
                            >
                              {(visitor.name || visitor.firstName || 'V').charAt(0).toUpperCase()}{(visitor.lastName || '').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-gray-900 truncate">
                              {visitor.name || `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim()}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {visitor.email}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {visitor.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.company || 'N/A'}</div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.purpose || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.hostName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="block">
                            {visitor.checkInTime 
                              ? new Date(visitor.checkInTime).toLocaleDateString()
                              : 'Not checked in'
                            }
                          </span>
                          <span className="text-xs text-gray-500">
                            {visitor.checkInTime 
                              ? new Date(visitor.checkInTime).toLocaleTimeString()
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
                          {/* Status Dropdown */}
                          <select
                            value={visitor.status || 'pending'}
                            onChange={(e) => handleStatusUpdate(visitor.id, e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-200 rounded bg-white min-w-[100px]"
                            disabled={updating}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="checked_in">Checked In</option>
                            <option value="checked_out">Checked Out</option>
                          </select>
                          
                          {/* Approve/Reject buttons for pending status */}
                          {visitor.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(visitor.id, 'approved')}
                                disabled={updating}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                                title="Approve"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(visitor.id, 'rejected')}
                                disabled={updating}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                                title="Reject"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {/* Pass generation button for approved status */}
                          {visitor.status === 'approved' && (
                            <button
                              onClick={() => handleGeneratePass(visitor.id)}
                              disabled={updating}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              Generate Pass
                            </button>
                          )}
                          
                          {/* Check mark for pass generated */}
                          {visitor.pass_generated && (
                            <div className="group relative">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                                Pass Generated
                              </span>
                            </div>
                          )}
                          
                          {/* Check In/Out buttons */}
                          {/* {visitor.status === 'approved' && !visitor.pass_generated && (
                            <button
                              onClick={() => handleStatusUpdate(visitor.id, 'checked_in')}
                              disabled={updating}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              Check In
                            </button>
                          )} */}
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            <AnimatePresence>
              {filteredVisitors.map((visitor, index) => (
                <motion.div
                  key={visitor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 relative">
                      {(visitor.image || visitor.imageUrl || visitor.photo) ? (
                        <img
                          src={visitor.image || visitor.imageUrl || visitor.photo}
                          alt={`${visitor.name || visitor.firstName + ' ' + visitor.lastName}`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.fallback-avatar');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            const fallback = e.target.parentElement.querySelector('.fallback-avatar');
                            if (fallback) fallback.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`fallback-avatar w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl absolute top-0 left-0 ${(visitor.image || visitor.imageUrl || visitor.photo) ? 'hidden' : 'flex'}`}
                      >
                        {(visitor.name || visitor.firstName || 'V').charAt(0).toUpperCase()}{(visitor.lastName || '').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {visitor.name || `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim()}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{visitor.email}</p>
                          <p className="text-sm text-gray-500 truncate">{visitor.phone}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(visitor.status)}
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        {/* <div className="flex justify-between">
                          <span className="text-gray-500">Company:</span>
                          <span className="text-gray-900 font-medium">{visitor.company || 'N/A'}</span>
                        </div> */}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Purpose:</span>
                          <span className="text-gray-900 font-medium">{visitor.purpose || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Host:</span>
                          <span className="text-gray-900 font-medium">{visitor.hostName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Check In:</span>
                          <span className="text-gray-900 font-medium">
                            {visitor.checkInTime 
                              ? `${new Date(visitor.checkInTime).toLocaleDateString()} ${new Date(visitor.checkInTime).toLocaleTimeString()}`
                              : 'Not checked in'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between space-x-2">
                        <select
                          value={visitor.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(visitor.id, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                          disabled={updating}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="checked_in">Checked In</option>
                          <option value="checked_out">Checked Out</option>
                        </select>
                        
                        {visitor.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(visitor.id, 'approved')}
                              disabled={updating}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                              title="Approve"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(visitor.id, 'rejected')}
                              disabled={updating}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                              title="Reject"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {visitor.status === 'approved' && !visitor.pass_generated && (
                          <button
                            onClick={() => handleGeneratePass(visitor.id)}
                            disabled={updating}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50"
                          >
                            Generate Pass
                          </button>
                        )}
                        
                        {visitor.pass_generated && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                        
                        <button 
                          onClick={() => setSelectedVisitor(visitor)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalItems > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} visitors
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(totalItems / itemsPerPage)) }, (_, i) => {
                      const totalPages = Math.ceil(totalItems / itemsPerPage);
                      let pageNumber;
                      
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={loading}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalItems / itemsPerPage) || loading}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Pass Generation Modal */}
      <AnimatePresence>
        {showPassModal && passVisitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPassModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Visitor Pass Generated!</h3>
                <p className="text-gray-600">Pass has been created successfully</p>
              </div>

              {/* Pass Preview */}
              <div className="max-w-sm mx-auto mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold">VISITOR PASS</h4>
                    <p className="text-blue-100 text-sm">Wish Geeks Techserve</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20">
                      {(passVisitor.image || passVisitor.imageUrl || passVisitor.photo) ? (
                        <img 
                          src={passVisitor.image || passVisitor.imageUrl || passVisitor.photo} 
                          alt="Visitor" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white/60" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-lg">
                        {passVisitor.name || `${passVisitor.firstName || ''} ${passVisitor.lastName || ''}`.trim()}
                      </h5>
                      <p className="text-blue-100 text-sm">{passVisitor.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-100">Visit Time:</span>
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100">Purpose:</span>
                      <span className="text-right">{passVisitor.purpose || 'General Visit'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100">Status:</span>
                      <span className="text-right">{passVisitor.status || 'Approved'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100">ID:</span>
                      <span className="text-right font-mono text-xs">#{passVisitor.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleDownloadPass}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Pass</span>
                </button>
                <button 
                  onClick={() => setShowPassModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {(selectedVisitor.image || selectedVisitor.imageUrl || selectedVisitor.photo) ? (
                  <img 
                    src={selectedVisitor.image || selectedVisitor.imageUrl || selectedVisitor.photo} 
                    alt={selectedVisitor.name || `${selectedVisitor.firstName || ''} ${selectedVisitor.lastName || ''}`.trim()}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 border-4 border-blue-100 ${(selectedVisitor.image || selectedVisitor.imageUrl || selectedVisitor.photo) ? 'hidden' : 'flex'}`}
                >
                  {(selectedVisitor.name || selectedVisitor.firstName || 'V').charAt(0).toUpperCase()}{(selectedVisitor.lastName || '').charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedVisitor.name || `${selectedVisitor.firstName || ''} ${selectedVisitor.lastName || ''}`.trim()}</h3>
                {/* <p className="text-gray-600">{selectedVisitor.company || 'No company'}</p> */}
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

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => handleFormChange('company', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div> */}

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