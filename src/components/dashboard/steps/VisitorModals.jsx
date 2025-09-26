import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  User,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { getStatusBadge } from "./VisitorUIComponents";

// Pass Generation Modal Component
export const PassGenerationModal = ({
  showPassModal,
  passVisitor,
  setShowPassModal,
  handleDownloadPass,
}) => (
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Visitor Pass Generated!
            </h3>
            <p className="text-gray-600">
              Pass has been created successfully
            </p>
          </div>

          {/* Pass Preview */}
          <div className="max-w-sm mx-auto mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
              <div className="text-center mb-4">
                <h4 className="text-lg font-bold">VISITOR PASS</h4>
                <p className="text-blue-100 text-sm">
                  Wish Geeks Techserve
                </p>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20">
                  {passVisitor.image ||
                  passVisitor.imageUrl ||
                  passVisitor.photo ? (
                    <img
                      src={
                        passVisitor.image ||
                        passVisitor.imageUrl ||
                        passVisitor.photo
                      }
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
                    {passVisitor.name ||
                      `${passVisitor.firstName || ""} ${
                        passVisitor.lastName || ""
                      }`.trim()}
                  </h5>
                  <p className="text-blue-100 text-sm">
                    {passVisitor.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-100">Visit Time:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Purpose:</span>
                  <span className="text-right">
                    {passVisitor.purpose || "General Visit"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Status:</span>
                  <span className="text-right">
                    {passVisitor.status || "Approved"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">ID:</span>
                  <span className="text-right font-mono text-xs">
                    #{passVisitor.id}
                  </span>
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
);

// Visitor Detail Modal Component
export const VisitorDetailModal = ({
  selectedVisitor,
  setSelectedVisitor,
  handleEditVisitor,
  user,
  isEditing,
}) => (
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
          className="bg-white rounded-2xl p-8 max-w-6xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              {selectedVisitor.image ||
              selectedVisitor.imageUrl ||
              selectedVisitor.photo ? (
                <img
                  src={
                    selectedVisitor.image ||
                    selectedVisitor.imageUrl ||
                    selectedVisitor.photo
                  }
                  alt={
                    selectedVisitor.name ||
                    `${selectedVisitor.firstName || ""} ${
                      selectedVisitor.lastName || ""
                    }`.trim()
                  }
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 border-4 border-blue-100 ${
                  selectedVisitor.image ||
                  selectedVisitor.imageUrl ||
                  selectedVisitor.photo
                    ? "hidden"
                    : "flex"
                }`}
              >
                {(selectedVisitor.name || selectedVisitor.firstName || "V")
                  .charAt(0)
                  .toUpperCase()}
                {(selectedVisitor.lastName || "").charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedVisitor.name ||
                  `${selectedVisitor.firstName || ""} ${
                    selectedVisitor.lastName || ""
                  }`.trim()}
              </h3>
            </div>
            <button
              onClick={() => setSelectedVisitor(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Visitor Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Visitor Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedVisitor.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedVisitor.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Purpose
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedVisitor.purpose || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Host
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedVisitor.host || selectedVisitor.hostName || (selectedVisitor.issued_by == user.id ? user.name || selectedVisitor.user?.name || "N/A" : "N/A")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  {getStatusBadge(selectedVisitor.status)}
                </div>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline Items - Ordered by time - Scrollable */}
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {(() => {
                    // Simple function to format timestamps
                    const formatTimestamp = (timestamp) => {
                      console.log('Formatting timestamp:', timestamp, 'Type:', typeof timestamp);
                      
                      if (!timestamp) return 'No Date';
                      
                      try {
                        let date;
                        
                        // Handle different timestamp formats
                        if (typeof timestamp === 'string') {
                          // Try multiple parsing approaches
                          if (timestamp.includes('T')) {
                            // ISO format: 2025-09-26T08:52:34.264516
                            date = new Date(timestamp);
                          } else if (timestamp.includes('-')) {
                            // Date format: 2025-09-26
                            date = new Date(timestamp);
                          } else {
                            // Try direct parsing
                            date = new Date(timestamp);
                          }
                        } else {
                          date = new Date(timestamp);
                        }
                        
                        console.log('Parsed date:', date, 'Valid:', !isNaN(date.getTime()));
                        
                        if (isNaN(date.getTime())) {
                          return `Invalid: ${timestamp}`;
                        }
                        
                        return date.toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        });
                      } catch (error) {
                        console.error('Date formatting error:', error, timestamp);
                        return `Error: ${timestamp}`;
                      }
                    };

                    // Get simple icon for status
                    const getStatusIcon = (status) => {
                      switch (status?.toLowerCase()) {
                        case 'created': return <User className="w-4 h-4 text-blue-600" />;
                        case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
                        case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
                        case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
                        case 'checked_in': return <CheckCircle className="w-4 h-4 text-green-600" />;
                        case 'checked_out': return <XCircle className="w-4 h-4 text-gray-600" />;
                        case 'revisit': return <RotateCcw className="w-4 h-4 text-purple-600" />;
                        default: return <Clock className="w-4 h-4 text-gray-600" />;
                      }
                    };

                    // Get background color for status
                    const getStatusBgColor = (status) => {
                      switch (status?.toLowerCase()) {
                        case 'created': return 'bg-blue-100';
                        case 'pending': return 'bg-yellow-100';
                        case 'approved': return 'bg-green-100';
                        case 'rejected': return 'bg-red-100';
                        case 'checked_in': return 'bg-green-100';
                        case 'checked_out': return 'bg-gray-100';
                        case 'revisit': return 'bg-purple-100';
                        default: return 'bg-gray-100';
                      }
                    };

                    // Get text color for status
                    const getStatusTextColor = (status) => {
                      switch (status?.toLowerCase()) {
                        case 'created': return 'text-blue-800';
                        case 'pending': return 'text-yellow-800';
                        case 'approved': return 'text-green-800';
                        case 'rejected': return 'text-red-800';
                        case 'checked_in': return 'text-green-800';
                        case 'checked_out': return 'text-gray-800';
                        case 'revisit': return 'text-purple-800';
                        default: return 'text-gray-800';
                      }
                    };

                    console.log('=== FULL SELECTED VISITOR DATA ===');
                    console.log('selectedVisitor:', selectedVisitor);
                    console.log('=== TIMELINE SPECIFIC DATA ===');
                    console.log('selectedVisitor.timeline:', selectedVisitor.timeline);
                    console.log('Timeline type:', typeof selectedVisitor.timeline);
                    console.log('Is timeline array?', Array.isArray(selectedVisitor.timeline));
                    console.log('Timeline length:', selectedVisitor.timeline?.length);
                    console.log('=== ALL POSSIBLE TIMELINE FIELDS ===');
                    Object.keys(selectedVisitor).forEach(key => {
                      if (key.toLowerCase().includes('timeline') || key.toLowerCase().includes('history') || key.toLowerCase().includes('status')) {
                        console.log(`${key}:`, selectedVisitor[key]);
                      }
                    });
                    console.log('=== END DEBUG ===');

                    // Use the timelines array from the backend response
                    const timelineData = selectedVisitor.timelines || selectedVisitor.timeline || [];
                    
                    console.log('Using timeline data:', timelineData);
                    
                    // Check if timeline exists and is array
                    if (!timelineData || !Array.isArray(timelineData) || timelineData.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No timeline data available</p>
                        </div>
                      );
                    }

                    // Remove duplicate timeline entries (same status and similar timestamp)
                    const uniqueTimeline = timelineData.filter((entry, index, array) => {
                      // Keep entry if it's the first occurrence of this status+timestamp combination
                      return array.findIndex(e => {
                        const entryTime = entry.updated_at || entry.created_at || entry.timestamp || entry.date;
                        const eTime = e.updated_at || e.created_at || e.timestamp || e.date;
                        
                        // Consider entries duplicate if they have same status and timestamp within 1 minute
                        const timeDiff = Math.abs(new Date(entryTime) - new Date(eTime));
                        return e.status === entry.status && timeDiff < 60000; // 60 seconds
                      }) === index;
                    });

                    console.log('Original timeline entries:', timelineData.length);
                    console.log('After deduplication:', uniqueTimeline.length);

                    // Sort timeline by any available timestamp field (oldest first - chronological order)
                    const sortedTimeline = [...uniqueTimeline].sort((a, b) => {
                      const timestampA = a.updated_at || a.created_at || a.timestamp || a.date;
                      const timestampB = b.updated_at || b.created_at || b.timestamp || b.date;
                      
                      if (!timestampA && !timestampB) return 0;
                      if (!timestampA) return 1;
                      if (!timestampB) return -1;
                      
                      return new Date(timestampA) - new Date(timestampB);
                    });

                    console.log('Sorted timeline for display:', sortedTimeline);
                    console.log('First timeline entry structure:', sortedTimeline[0]);
                    console.log('Timeline entry keys:', Object.keys(sortedTimeline[0] || {}));

                    // Render timeline entries directly
                    return sortedTimeline.map((entry, index) => (
                      <div key={`timeline-${entry.id}-${index}`} className="relative flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 ${getStatusBgColor(entry.status)} rounded-full flex items-center justify-center relative z-10`}>
                          {getStatusIcon(entry.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="text-sm font-medium text-gray-900">
                              {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1) || 'Status Update'}
                            </h5>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBgColor(entry.status)} ${getStatusTextColor(entry.status)}`}>
                              {entry.status || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Status changed to {entry.status}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(entry.updated_at || entry.created_at || entry.timestamp || entry.date)}
                          </p>
                          {entry.updated_by && (
                            <p className="text-xs text-gray-500">
                              By: {entry.updated_by}
                            </p>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
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
);

// Edit Visitor Modal Component
export const EditVisitorModal = ({
  isEditing,
  editingVisitor,
  editForm,
  editFormErrors,
  handleFormChange,
  handleSaveEdit,
  handleCancelEdit,
  updating,
  actions,
}) => (
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
            <h3 className="text-2xl font-bold text-gray-900">
              Edit Visitor
            </h3>
            <button
              onClick={handleCancelEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className={`w-full px-4 py-3 border ${
                  editFormErrors?.name ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter visitor name"
              />
              {editFormErrors?.name && (
                <p className="mt-1 text-sm text-red-600">{editFormErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                className={`w-full px-4 py-3 border ${
                  editFormErrors?.email ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter email address"
              />
              {editFormErrors?.email && (
                <p className="mt-1 text-sm text-red-600">{editFormErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => {
                  // Remove all non-digit characters and limit to 10 digits
                  const digitsOnly = e.target.value.replace(/\D/g, '');
                  if (digitsOnly.length <= 10) {
                    handleFormChange("phone", digitsOnly);
                  }
                }}
                onKeyPress={(e) => {
                  // Prevent non-numeric characters on keypress
                  const char = String.fromCharCode(e.which);
                  if (!/[0-9]/.test(char)) {
                    e.preventDefault();
                  }
                }}
                maxLength="10"
                className={`w-full px-4 py-3 border ${
                  editFormErrors?.phone ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter 10-digit phone number"
              />
              {editFormErrors?.phone && (
                <p className="mt-1 text-sm text-red-600">{editFormErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose *
              </label>
              <textarea
                value={editForm.purpose}
                onChange={(e) =>
                  handleFormChange("purpose", e.target.value)
                }
                rows={3}
                className={`w-full px-4 py-3 border ${
                  editFormErrors?.purpose ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                placeholder="Enter visit purpose"
              />
              {editFormErrors?.purpose && (
                <p className="mt-1 text-sm text-red-600">{editFormErrors.purpose}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Host
              </label>
              <input
                type="text"
                value={editForm.host}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl cursor-not-allowed text-gray-600"
                placeholder="Auto-assigned host"
              />
              <p className="text-xs text-gray-500 mt-1">
                Host is automatically assigned to the logged-in user
              </p>
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
              disabled={updating || !editForm.name || !editForm.email || !editForm.purpose || Object.keys(editFormErrors || {}).length > 0}
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
);
