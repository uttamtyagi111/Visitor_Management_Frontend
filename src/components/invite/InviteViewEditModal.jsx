import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Check,
  AlertCircle,
  Clock as ClockIcon,
  Mail as MailIcon,
  CheckCircle,
  XCircle as XCircleIcon,
  Clock as ClockIcon3,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import { inviteeHelpers } from "../../api/invite.js";

const InviteViewEditModal = ({
  isModalOpen,
  currentInvite,
  closeModal,
  isEditing,
  setIsEditing,
  getStatusBadge,
  timelineLoading,
  timelineData,
  error,
  handleUpdateInvite,
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  handleEditInputChange,
  handlePhoneInput,
  getCurrentDateTime,
  getMinExpiryTimeEdit,
  loading,
}) => {
  return (
    <AnimatePresence>
      {isModalOpen && currentInvite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-4 max-w-5xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Invitation' : 'Invitation Details'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isEditing ? (
              // View Mode with Sidebar Layout
              <div className="flex flex-col lg:flex-row gap-4 h-full">
                {/* Main Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Visitor Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        {currentInvite.image ? (
                          <img
                            key={`view-edit-${currentInvite.id}-${currentInvite.image}`}
                            src={`${currentInvite.image}?t=${Date.now()}`}
                            alt={currentInvite.visitor_name || 'Visitor'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ${
                            currentInvite.image ? 'hidden' : 'flex'
                          }`}
                        >
                          {(currentInvite.visitor_name || 'V').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Status
                        </p>
                        {getStatusBadge(currentInvite.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-3">
                          Invitees Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Full Name
                            </p>
                            <p className="mt-1 text-gray-900 font-medium">
                              {currentInvite.visitor_name || 'N/A'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Email
                            </p>
                            <p className="mt-1 text-blue-600">
                              {currentInvite.visitor_email || 'N/A'}
                            </p>
                          </div>
                          
                          {currentInvite.visitor_phone && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Phone
                              </p>
                              <p className="mt-1 text-gray-900">
                                {currentInvite.visitor_phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-3">
                          Visit Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Purpose
                            </p>
                            <p className="mt-1 text-gray-900">
                              {currentInvite.purpose || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Scheduled Visit Time
                            </p>
                            <p className="mt-1 text-gray-900">
                              {inviteeHelpers.formatDateTime(currentInvite.visit_time) || 'N/A'}
                            </p>
                          </div>
                          
                          {currentInvite.report?.check_in && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Actual Check-in Time
                              </p>
                              <p className="mt-1 text-green-600 font-medium">
                                {inviteeHelpers.formatDateTime(currentInvite.report.check_in)}
                              </p>
                            </div>
                          )}
                          
                          {currentInvite.report?.check_out && currentInvite.status !== "checked_in" && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Actual Check-out Time
                              </p>
                              <p className="mt-1 text-blue-600 font-medium">
                                {inviteeHelpers.formatDateTime(currentInvite.report.check_out)}
                              </p>
                            </div>
                          )}
                          
                          {currentInvite.expiry_time && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Expiry Time
                              </p>
                              <p className="mt-1 text-gray-900">
                                {inviteeHelpers.formatDateTime(currentInvite.expiry_time)}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Invited By
                            </p>
                            <p className="mt-1 text-gray-900">
                              {currentInvite.invited_by || 'N/A'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Invite Code
                            </p>
                            <p className="mt-1 font-mono text-gray-900">
                              {currentInvite.invite_code || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Invitation</span>
                    </button>
                  </div>
                </div>

                {/* Timeline Sidebar */}
                <div className="lg:w-72 lg:border-l lg:border-gray-200 lg:pl-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Timeline
                    </h3>
                    
                    {/* Enhanced Timeline Component with Real API Data */}
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                      {timelineLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="ml-2 text-sm text-gray-600">Loading timeline...</span>
                        </div>
                      ) : (
                        (() => {
                          const getTimelineSteps = () => {
                            // Map status to display information
                            const statusMap = {
                              'created': { title: 'Invitation Created', description: 'Invitation has been created', icon: MailIcon, color: 'blue' },
                              'pending': { title: 'Invitation Pending', description: 'Invitation is pending approval', icon: ClockIcon, color: 'yellow' },
                              'approved': { title: 'Invitation Approved', description: 'Invitation approved by host', icon: CheckCircle, color: 'green' },
                              'rejected': { title: 'Invitation Rejected', description: 'Invitation was rejected', icon: XCircleIcon, color: 'red' },
                              'checked_in': { title: 'Visitor Checked In', description: 'Visitor arrived and checked in', icon: UserCheck, color: 'green' },
                              'checked_out': { title: 'Visitor Checked Out', description: 'Visit completed and checked out', icon: UserX, color: 'green' },
                              'expired': { title: 'Invitation Expired', description: 'Invitation has expired', icon: ClockIcon3, color: 'orange' },
                              'reinvited': { title: 'Invitation Re-Sent', description: 'Invitation re-sent to visitor with updated details', icon: RefreshCw, color: 'blue' }
                            };

                            // Use API timeline data if available, otherwise fallback to current invite data
                            if (timelineData && timelineData.length > 0) {
                              // Sort timeline data in descending order (most recent first) as additional safety
                              const sortedTimelineData = [...timelineData].sort((a, b) => {
                                const timeA = new Date(a.timestamp || a.created_at || a.date || a.time);
                                const timeB = new Date(b.timestamp || b.created_at || b.date || b.time);
                                return timeB - timeA; // Descending order (newest first)
                              });
                              
                              console.log('📅 Timeline sorted for display (newest first):', 
                                sortedTimelineData.map(item => ({
                                  status: item.status,
                                  time: item.timestamp || item.created_at || item.date || item.time
                                }))
                              );
                              
                              // First map the timeline data with actual timestamps
                              const mappedTimelineData = sortedTimelineData.map((timelineItem, index) => {
                                const statusInfo = statusMap[timelineItem.status] || statusMap['pending'];
                                
                                // For check-in/check-out, use actual times from report if available
                                let actualTimestamp = timelineItem.created_at || timelineItem.timestamp;
                                let enhancedDescription = timelineItem.notes || statusInfo.description;
                                
                                if (timelineItem.status === 'checked_in' && currentInvite.report?.check_in) {
                                  actualTimestamp = currentInvite.report.check_in;
                                  enhancedDescription = `Visitor actually checked in at ${new Date(currentInvite.report.check_in).toLocaleString()}`;
                                } else if (timelineItem.status === 'checked_out' && currentInvite.report?.check_out) {
                                  actualTimestamp = currentInvite.report.check_out;
                                  enhancedDescription = `Visitor actually checked out at ${new Date(currentInvite.report.check_out).toLocaleString()}`;
                                }
                                
                                return {
                                  status: timelineItem.status,
                                  title: statusInfo.title,
                                  description: enhancedDescription,
                                  timestamp: actualTimestamp,
                                  icon: statusInfo.icon,
                                  completed: true,
                                  isRejected: timelineItem.status === 'rejected',
                                  isExpired: timelineItem.status === 'expired',
                                  isReinvited: timelineItem.status === 'reinvited',
                                  updatedBy: timelineItem.updated_by,
                                  order: index + 1
                                };
                              });
                              
                              // Then sort by the actual timestamps (newest first)
                              const finalSortedTimeline = mappedTimelineData.sort((a, b) => {
                                const timeA = new Date(a.timestamp);
                                const timeB = new Date(b.timestamp);
                                console.log('🔄 Sorting timeline items:', {
                                  a: { status: a.status, time: a.timestamp, parsed: timeA },
                                  b: { status: b.status, time: b.timestamp, parsed: timeB },
                                  result: timeB - timeA
                                });
                                return timeB - timeA; // Descending order (newest first)
                              });
                              
                              console.log('📅 Final timeline order:', finalSortedTimeline.map(item => ({
                                status: item.status,
                                timestamp: item.timestamp
                              })));
                              
                              return finalSortedTimeline;
                            } else {
                              // Fallback to basic timeline based on current invite status
                              const fallbackSteps = [
                                {
                                  status: 'pending',
                                  title: 'Invitation Pending',
                                  description: 'Invitation is pending approval',
                                  timestamp: currentInvite.created_at,
                                  icon: ClockIcon,
                                  completed: true,
                                  order: 1
                                }
                              ];

                              if (currentInvite.status !== 'pending') {
                                const statusInfo = statusMap[currentInvite.status] || statusMap['pending'];
                                fallbackSteps.push({
                                  status: currentInvite.status,
                                  title: statusInfo.title,
                                  description: statusInfo.description,
                                  timestamp: currentInvite.updated_at || currentInvite.created_at,
                                  icon: statusInfo.icon,
                                  completed: true,
                                  isRejected: currentInvite.status === 'rejected',
                                  isExpired: currentInvite.status === 'expired',
                                  isReinvited: currentInvite.status === 'reinvited',
                                  order: 2
                                });
                              }

                              // Sort fallback steps in descending order (newest first)
                              return fallbackSteps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                            }
                          };

                          const timelineSteps = getTimelineSteps();

                        return timelineSteps.map((step, index) => {
                          const IconComponent = step.icon;
                          const isLast = index === timelineSteps.length - 1;
                          
                          return (
                            <div key={step.status} className="relative pb-6">
                              {/* Vertical Line - extends to next icon */}
                              {!isLast && (
                                <div className={`absolute left-3 top-6 w-0.5 ${
                                  step.completed 
                                    ? step.isRejected 
                                      ? 'bg-red-400'
                                      : step.isExpired
                                      ? 'bg-orange-400'
                                      : step.isReinvited
                                      ? 'bg-blue-400'
                                      : 'bg-green-400'
                                    : 'bg-gray-300'
                                }`} 
                                style={{ 
                                  height: 'calc(100% - 12px)'
                                }} />
                              )}
                              
                              {/* Step Content */}
                              <div className="flex items-start space-x-2">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                  step.completed 
                                    ? step.isRejected 
                                      ? 'bg-red-100 text-red-600' 
                                      : step.isExpired
                                      ? 'bg-orange-100 text-orange-600'
                                      : step.isReinvited
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <IconComponent className="w-3 h-3" />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${
                                      step.completed ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                      {step.title}
                                    </p>
                                    {step.completed && (
                                      <div className={`w-2 h-2 rounded-full ${
                                        step.isRejected 
                                          ? 'bg-red-400' 
                                          : step.isExpired
                                          ? 'bg-orange-400'
                                          : step.isReinvited
                                          ? 'bg-blue-400'
                                          : 'bg-green-400'
                                      }`} />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {step.description}
                                  </p>
                                  {step.timestamp && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {inviteeHelpers.formatDateTime(step.timestamp)}
                                    </p>
                                  )}
                                  {step.updatedBy && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      Updated by: {step.updatedBy}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleUpdateInvite} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="visitor_name"
                      value={formData.visitor_name}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border ${
                        formErrors.visitor_name ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter full name"
                    />
                    {formErrors.visitor_name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.visitor_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="visitor_email"
                      value={formData.visitor_email}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border ${
                        formErrors.visitor_email ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter email address"
                    />
                    {formErrors.visitor_email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.visitor_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="visitor_phone"
                      value={formData.visitor_phone}
                      onChange={(e) => handlePhoneInput(e, 'edit')}
                      onKeyPress={(e) => {
                        // Prevent non-numeric characters on keypress
                        const char = String.fromCharCode(e.which);
                        if (!/[0-9]/.test(char)) {
                          e.preventDefault();
                        }
                      }}
                      maxLength="10"
                      className={`w-full px-3 py-2 border ${
                        formErrors.visitor_phone ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter 10-digit phone number"
                    />
                    {formErrors.visitor_phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.visitor_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invited By
                    </label>
                    <input
                      type="text"
                      name="invited_by"
                      value={formData.invited_by}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                      placeholder="Auto-filled with logged-in user"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visit Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="visit_time"
                      value={formData.visit_time}
                      min={getCurrentDateTime()}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border ${
                        formErrors.visit_time ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {formErrors.visit_time && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.visit_time}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Time
                    </label>
                    <input
                      type="datetime-local"
                      name="expiry_time"
                      value={formData.expiry_time}
                      min={getMinExpiryTimeEdit()}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose *
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border ${
                        formErrors.purpose ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g., Business meeting, Interview, Product demo"
                    />
                    {formErrors.purpose && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.purpose}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="reinvited">Reinvited</option>
                      <option value="checked_in">Checked_in</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                      <option value="checked_out">Checked_out</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data to original values
                      setFormData({
                        visitor_name: currentInvite.visitor_name,
                        visitor_email: currentInvite.visitor_email,
                        visitor_phone: currentInvite.visitor_phone || "",
                        purpose: currentInvite.purpose,
                        visit_time: currentInvite.visit_time
                          ? currentInvite.visit_time.slice(0, 16)
                          : "",
                        expiry_time: currentInvite.expiry_time
                          ? currentInvite.expiry_time.slice(0, 16)
                          : "",
                        invited_by: currentInvite.invited_by || "",
                        status: currentInvite.status,
                      });
                      setFormErrors({});
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteViewEditModal;
