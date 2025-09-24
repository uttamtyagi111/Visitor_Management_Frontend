import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Clock,
  Calendar,
  Send,
  AlertCircle,
} from "lucide-react";

const InviteFormModal = ({
  showInviteForm,
  setShowInviteForm,
  error,
  handleSubmitInvite,
  inviteFormData,
  handleNameInputCreate,
  handleEmailInputCreate,
  handlePhoneInput,
  setInviteFormData,
  inviteFormErrors,
  setInviteFormErrors,
  user,
  getCurrentDateTime,
  getMinExpiryTime,
  loading,
}) => {
  return (
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
              <h3 className="text-2xl font-bold text-gray-900">
                Send Invitation
              </h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={inviteFormData.visitor_name}
                      onChange={handleNameInputCreate}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                        inviteFormErrors.visitor_name ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  {inviteFormErrors.visitor_name && (
                    <p className="mt-1 text-sm text-red-600">{inviteFormErrors.visitor_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={inviteFormData.visitor_email}
                      onChange={handleEmailInputCreate}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                        inviteFormErrors.visitor_email ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  {inviteFormErrors.visitor_email && (
                    <p className="mt-1 text-sm text-red-600">{inviteFormErrors.visitor_email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invited By *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user?.name || user?.email || ""}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-600"
                      placeholder="Auto-filled with logged-in user"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={inviteFormData.visitor_phone}
                      onChange={(e) => handlePhoneInput(e, 'create')}
                      onKeyPress={(e) => {
                        // Prevent non-numeric characters on keypress
                        const char = String.fromCharCode(e.which);
                        if (!/[0-9]/.test(char)) {
                          e.preventDefault();
                        }
                      }}
                      maxLength="10"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter 10-digit phone number"
                    />
                  </div>
                  {inviteFormErrors.visitor_phone && (
                    <p className="mt-1 text-sm text-red-600">{inviteFormErrors.visitor_phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={inviteFormData.visit_time}
                      min={getCurrentDateTime()}
                      onChange={(e) =>
                        setInviteFormData({
                          ...inviteFormData,
                          visit_time: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={inviteFormData.expiry_time}
                      min={getMinExpiryTime()}
                      onChange={(e) =>
                        setInviteFormData({
                          ...inviteFormData,
                          expiry_time: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Visit *
                </label>
                <input
                  type="text"
                  value={inviteFormData.purpose}
                  onChange={(e) => {
                    setInviteFormData({
                      ...inviteFormData,
                      purpose: e.target.value,
                    });
                    // Clear purpose error if user starts typing
                    if (inviteFormErrors.purpose) {
                      setInviteFormErrors({...inviteFormErrors, purpose: ''});
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border ${
                    inviteFormErrors.purpose ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="e.g., Business meeting, Interview, Product demo"
                  required
                />
                {inviteFormErrors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{inviteFormErrors.purpose}</p>
                )}
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
                  <span>{loading ? "Sending..." : "Send Invitation"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteFormModal;
