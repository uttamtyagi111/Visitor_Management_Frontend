import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Clock,
  Calendar,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const ReinviteModal = ({
  isOpen,
  onClose,
  invite,
  onReinvite,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    visit_time: "",
    expiry_time: "",
    purpose: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState("");

  // Initialize form data when invite changes
  useEffect(() => {
    if (invite) {
      setFormData({
        visit_time: invite.visit_time ? invite.visit_time.slice(0, 16) : "",
        expiry_time: invite.expiry_time ? invite.expiry_time.slice(0, 16) : "",
        purpose: invite.purpose || "",
      });
      setFormErrors({});
      setSuccess("");
    }
  }, [invite]);

  // Get current date and time in YYYY-MM-DDTHH:mm format
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  // Get minimum expiry time (current visit time or current time if no visit time)
  const getMinExpiryTime = () => {
    if (formData.visit_time) {
      return formData.visit_time;
    }
    return getCurrentDateTime();
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const now = new Date();
    
    if (!formData.visit_time) {
      errors.visit_time = "Visit time is required";
    } else {
      const visitTime = new Date(formData.visit_time);
      if (visitTime <= now) {
        errors.visit_time = "Visit time must be in the future";
      }
    }

    if (!formData.expiry_time) {
      errors.expiry_time = "Expiry time is required";
    } else if (formData.visit_time) {
      const visitTime = new Date(formData.visit_time);
      const expiryTime = new Date(formData.expiry_time);
      if (expiryTime <= visitTime) {
        errors.expiry_time = "Expiry time must be after visit time";
      }
    }

    if (!formData.purpose.trim()) {
      errors.purpose = "Purpose is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onReinvite(invite.id, formData);
      setSuccess("Invitation reinvited successfully!");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error reinviting:", error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      visit_time: "",
      expiry_time: "",
      purpose: "",
    });
    setFormErrors({});
    setSuccess("");
    onClose();
  };

  if (!invite) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Reinvite Visitor
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Update invitation details and send a new invite
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Visitor Information (Read-only) */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  Visitor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={invite.visitor_name || ""}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={invite.visitor_email || ""}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-600"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    invite.status === 'expired' ? 'bg-red-100 text-red-800 border-red-200' :
                    invite.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                    invite.status === 'checked_out' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {invite.status?.charAt(0).toUpperCase() + invite.status?.slice(1)}
                  </span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Update Visit Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visit Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        name="visit_time"
                        value={formData.visit_time}
                        onChange={handleInputChange}
                        min={getCurrentDateTime()}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          formErrors.visit_time ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                    </div>
                    {formErrors.visit_time && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.visit_time}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Time *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        name="expiry_time"
                        value={formData.expiry_time}
                        onChange={handleInputChange}
                        min={getMinExpiryTime()}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          formErrors.expiry_time ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                    </div>
                    {formErrors.expiry_time && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.expiry_time}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Visit *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        formErrors.purpose ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="e.g., Business meeting, Interview, Product demo"
                      required
                    />
                  </div>
                  {formErrors.purpose && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.purpose}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? "Reinviting..." : "Reinvite Visitor"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReinviteModal;