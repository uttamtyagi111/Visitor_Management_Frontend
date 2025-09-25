import React from "react";
import { User, AlertCircle, Loader, ArrowLeft, CheckCircle, Phone, Mail, RotateCcw } from "lucide-react";
import { validationUtils } from "../../../utils/validation";

const FormStep = ({ 
  formData, 
  validationErrors, 
  isSubmitting, 
  onInputChange, 
  onSubmit, 
  onBack,
  isCheckingVisitor,
  existingVisitor,
  existingImage,
  capturedImage
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <User className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-800">Your Information</h2>
        <p className="text-gray-600 text-sm">Please fill in your details</p>
        
        {/* Form Progress Indicator */}
        <div className="mt-4 mb-2">
          <div className="flex justify-center space-x-2">
            {['name', 'phone', 'email', 'purpose'].map((field) => (
              <div
                key={field}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  formData[field] && !validationErrors[field]
                    ? 'bg-green-500 scale-110'
                    : validationErrors[field]
                    ? 'bg-red-500'
                    : formData[field]
                    ? 'bg-yellow-500'
                    : 'bg-gray-300'
                }`}
                title={`${field.charAt(0).toUpperCase() + field.slice(1)} field`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Object.keys(formData).filter(key => formData[key] && !validationErrors[key] && ['name', 'phone', 'email', 'purpose'].includes(key)).length}/4 fields completed
          </p>
        </div>
      </div>

      {/* Existing Visitor Preview */}
      {existingVisitor && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Existing Image Preview */}
            <div className="flex-shrink-0">
              {existingImage ? (
                <img
                  src={existingImage}
                  alt="Your previous photo"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-purple-300 shadow-md"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Failed to load existing visitor image in form:', existingImage);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-200 border-2 border-purple-300 flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
              )}
            </div>
            
            {/* Existing Visitor Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span className="text-purple-800 font-medium text-sm">Returning Visitor</span>
              </div>
              <p className="text-purple-700 text-sm">
                Welcome back, <strong>{existingVisitor.name}</strong>!
              </p>
              <p className="text-purple-600 text-xs">
                We found your previous visit record. You can update your photo in the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              required
              className={`w-full pl-10 pr-10 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                validationErrors.name 
                  ? 'border-red-300 bg-red-50' 
                  : formData.name && !validationErrors.name 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              maxLength="50"
            />
            {formData.name && !validationErrors.name && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone ? validationUtils.formatPhoneNumber(formData.phone) : ''}
              onChange={onInputChange}
              required
              className={`w-full pl-10 pr-10 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                validationErrors.phone 
                  ? 'border-red-300 bg-red-50' 
                  : formData.phone && !validationErrors.phone 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
              }`}
              placeholder="(123) 456-7890"
              maxLength="14"
            />
            {formData.phone && !validationErrors.phone && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {validationErrors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.phone}
            </p>
          )}
          {formData.phone && !validationErrors.phone && (
            <p className="text-green-600 text-sm mt-1">✓ Valid phone number</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              required
              className={`w-full pl-10 pr-10 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                validationErrors.email 
                  ? 'border-red-300 bg-red-50' 
                  : formData.email && !validationErrors.email 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
              autoComplete="email"
            />
            {formData.email && !validationErrors.email && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.email}
            </p>
          )}
          {formData.email && !validationErrors.email && (
            <p className="text-green-600 text-sm mt-1">✓ Valid email address</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose of Visit *
          </label>
          <div className="relative">
            <select
              name="purpose"
              value={formData.purpose}
              onChange={onInputChange}
              required
              className={`w-full px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white ${
                validationErrors.purpose 
                  ? 'border-red-300 bg-red-50' 
                  : formData.purpose && !validationErrors.purpose 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
              }`}
            >
              <option value="">Select purpose of your visit</option>
              <option value="business_meeting">Business Meeting</option>
              <option value="interview">Interview</option>
              <option value="delivery">Delivery</option>
              <option value="maintenance">Maintenance</option>
              <option value="personal">Personal Visit</option>
              <option value="other">Other</option>
            </select>
            {formData.purpose && !validationErrors.purpose && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {validationErrors.purpose && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.purpose}
            </p>
          )}
          {formData.purpose && !validationErrors.purpose && (
            <p className="text-green-600 text-sm mt-1">✓ Purpose selected</p>
          )}
        </div>


        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(validationErrors).some(key => validationErrors[key])}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all transform shadow-lg disabled:cursor-not-allowed w-full ${
              isSubmitting || Object.keys(validationErrors).some(key => validationErrors[key])
                ? 'bg-gray-400 text-gray-200 disabled:opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>{isCheckingVisitor ? "Checking visitor..." : "Registering..."}</span>
              </>
            ) : Object.keys(validationErrors).some(key => validationErrors[key]) ? (
              <span>Please fix errors above</span>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormStep;
