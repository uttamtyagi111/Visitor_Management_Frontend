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
                
                {/* Timeline Items - Ordered by time */}
                <div className="space-y-6">
                  {(() => {
                    // Create timeline events array
                    const events = [];
                    
                    // Registration event (always first)
                    if (selectedVisitor.created_at) {
                      events.push({
                        type: 'registration',
                        title: 'Registration',
                        description: 'Visitor registration completed',
                        timestamp: selectedVisitor.created_at,
                        icon: <User className="w-4 h-4 text-blue-600" />,
                        bgColor: 'bg-blue-100',
                        textColor: 'text-blue-800',
                        badgeText: 'Created'
                      });
                    }
                    
                    // Pending event (always show)
                    if (selectedVisitor.created_at) {
                      events.push({
                        type: 'pending',
                        title: 'Pending Review',
                        description: 'Visitor request is awaiting approval',
                        timestamp: selectedVisitor.created_at,
                        icon: <Clock className="w-4 h-4 text-yellow-600" />,
                        bgColor: 'bg-yellow-100',
                        textColor: 'text-yellow-800',
                        badgeText: 'Pending'
                      });
                    }
                    
                    // Status change events
                    if (selectedVisitor.status === "approved" && selectedVisitor.updated_at) {
                      events.push({
                        type: 'approved',
                        title: 'Approved',
                        description: 'Visitor request has been approved',
                        timestamp: selectedVisitor.updated_at,
                        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
                        bgColor: 'bg-green-100',
                        textColor: 'text-green-800',
                        badgeText: 'Approved'
                      });
                    }
                    
                    if (selectedVisitor.status === "rejected" && selectedVisitor.updated_at) {
                      events.push({
                        type: 'rejected',
                        title: 'Rejected',
                        description: 'Visitor request has been rejected',
                        timestamp: selectedVisitor.updated_at,
                        icon: <XCircle className="w-4 h-4 text-red-600" />,
                        bgColor: 'bg-red-100',
                        textColor: 'text-red-800',
                        badgeText: 'Rejected'
                      });
                    }
                    
                    // Pass generation event
                    if (selectedVisitor.pass_generated && (selectedVisitor.checkInTime || selectedVisitor.check_in)) {
                      events.push({
                        type: 'pass_generated',
                        title: 'Pass Generated',
                        description: 'Visitor pass has been generated and issued',
                        timestamp: selectedVisitor.checkInTime || selectedVisitor.check_in,
                        icon: <Download className="w-4 h-4 text-purple-600" />,
                        bgColor: 'bg-purple-100',
                        textColor: 'text-purple-800',
                        badgeText: 'Pass Created'
                      });
                    }
                    
                    // Check in event - show if there's a check-in timestamp (regardless of current status)
                    if (selectedVisitor.checkInTime || selectedVisitor.check_in) {
                      events.push({
                        type: 'checked_in',
                        title: 'Checked In',
                        description: 'Visitor has checked in to the facility',
                        timestamp: selectedVisitor.checkInTime || selectedVisitor.check_in,
                        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
                        bgColor: 'bg-green-100',
                        textColor: 'text-green-800',
                        badgeText: 'Checked In',
                        additionalInfo: selectedVisitor.checkedInBy ? `By: ${selectedVisitor.checkedInBy}` : null
                      });
                    }
                    
                    // Check out event - show if there's a check-out timestamp (regardless of current status)
                    if (selectedVisitor.checkOutTime || selectedVisitor.check_out) {
                      events.push({
                        type: 'checked_out',
                        title: 'Checked Out',
                        description: 'Visitor has checked out of the facility',
                        timestamp: selectedVisitor.checkOutTime || selectedVisitor.check_out,
                        icon: <XCircle className="w-4 h-4 text-gray-600" />,
                        bgColor: 'bg-gray-100',
                        textColor: 'text-gray-800',
                        badgeText: 'Checked Out',
                        additionalInfo: selectedVisitor.checkedOutBy ? `By: ${selectedVisitor.checkedOutBy}` : null
                      });
                    }
                    
                    // Sort events by timestamp
                    events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    
                    // Render events
                    return events.map((event, index) => (
                      <div key={`${event.type}-${index}`} className="relative flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 ${event.bgColor} rounded-full flex items-center justify-center relative z-10`}>
                          {event.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${event.bgColor} ${event.textColor}`}>
                              {event.badgeText}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                          {event.additionalInfo && (
                            <p className="text-xs text-gray-500">
                              {event.additionalInfo}
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
                onChange={(e) => handleFormChange("host", e.target.value)}
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
