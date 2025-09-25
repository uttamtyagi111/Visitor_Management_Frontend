import React, { useState, useCallback } from "react";
import { visitorAPI } from "../../api/visitor";
import { useToast } from "../../contexts/ToastContext";
import CameraStep from "./steps/CameraStep";
import FormStep from "./steps/FormStep";
import SuccessStep from "./steps/SuccessStep";
import { validationUtils, debounce } from "../../utils/validation";

const VisitorRegistration = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState("form"); // Start with form step
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    // company: "",
    purpose: "",
    host: "",
  });

  const [capturedImage, setCapturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingVisitor, setExistingVisitor] = useState(null); // Store visitor data from createVisitor API
  const [isExistingVisitor, setIsExistingVisitor] = useState(false); // Track if visitor is returning
  const [isCheckingVisitor, setIsCheckingVisitor] = useState(false); // Loading state for createVisitor API
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed error and success states - using toast notifications instead
  const [validationErrors, setValidationErrors] = useState({});
  const [visitorId, setVisitorId] = useState(null);

  // Handle photo capture from camera step - Step 2: Just capture, don't submit yet
  const handlePhotoCapture = (blob, previewUrl) => {
    setCapturedImage(blob);
    setImagePreview(previewUrl);
    // Don't auto-submit, wait for "Complete Registration" button
  };

  // Handle skip photo - no image captured
  const handleSkipPhoto = () => {
    setCapturedImage(null);
    // Don't auto-submit, wait for "Complete Registration" button
  };

  // Handle using existing photo for returning visitors
  const handleUseExistingPhoto = () => {
    // Keep existing image, don't capture new one
    setCapturedImage(null);
    // Don't auto-submit, wait for "Complete Registration" button
  };

  // Step 2: Complete Registration - Update visitor with image using updateVisitor API
  const handleCompleteRegistration = async () => {
    if (!visitorId || !existingVisitor) {
      toast.error("Visitor record not found. Please start over.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Complete registration for visitor ID:', visitorId);
      console.log('Image blob provided:', !!capturedImage);
      
      // Prepare update data
      const updateData = {
        ...formData,
        // Status will be updated based on image:
        // - If image is provided: status becomes 'pending' 
        // - If no image: keep current status
        status: capturedImage ? 'pending' : existingVisitor.status
      };

      // Call updateVisitor API with image
      const response = await visitorAPI.updateVisitor(visitorId, updateData, capturedImage);
      
      console.log('UpdateVisitor API response:', response);
      
      // Show success message based on visitor type
      if (existingVisitor.status === 'revisit') {
        toast.success("Welcome back! Your visit has been registered successfully.");
      } else {
        toast.success("Registration completed successfully! Welcome to our facility.");
      }
      
      // Move to success step
      setCurrentStep("success");
      
    } catch (err) {
      console.error('Error updating visitor:', err);
      toast.error(err.message || "Failed to complete registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real-time validation with debouncing
  const validateFieldRealTime = useCallback(
    debounce((fieldName, value) => {
      let validation;
      switch (fieldName) {
        case 'name':
          validation = validationUtils.validateName(value);
          break;
        case 'email':
          validation = validationUtils.validateEmail(value);
          break;
        case 'phone':
          validation = validationUtils.validatePhone(value);
          break;
        case 'purpose':
          validation = validationUtils.validatePurpose(value);
          break;
        default:
          return;
      }
      
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: validation.isValid ? "" : validation.message
      }));
    }, 500),
    []
  );

  // Handle form input changes with real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input based on field type
    let sanitizedValue = value;
    if (validationUtils.sanitizeInput[name]) {
      sanitizedValue = validationUtils.sanitizeInput[name](value);
    }
    
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear validation error immediately for better UX
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Perform real-time validation with debouncing
    if (sanitizedValue.trim()) {
      validateFieldRealTime(name, sanitizedValue);
    }
  };

  // Validate form data using validation utilities
  const validateForm = () => {
    const validation = validationUtils.validateForm(formData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  // Step 1: Form submission - Create visitor record using createVisitor API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below and try again.");
      return;
    }

    setIsCheckingVisitor(true);

    try {
      // Call createVisitor API - creates or updates visitor record without image
      console.log('Creating visitor with form data:', formData);
      const response = await visitorAPI.createVisitor(formData);
      
      console.log('CreateVisitor API response:', response);
      
      // Store the visitor data from response
      setExistingVisitor(response);
      setVisitorId(response.id);
      
      // Check if this is a returning visitor (revisit status) or new visitor (created status)
      if (response.status === 'revisit') {
        setIsExistingVisitor(true);
        console.log('Returning visitor detected:', response.name);
      } else {
        setIsExistingVisitor(false);
        console.log('New visitor created:', response.name);
      }
      
      // Set existing image if available from response
      if (response.image) {
        console.log('Setting existing visitor image from API:', response.image);
        setImagePreview(response.image);
      } else {
        console.log('No existing image in API response');
        setImagePreview(null);
      }

      // Move to camera step
      setCurrentStep("camera");
      
    } catch (err) {
      console.error('Error creating visitor:', err);
      toast.error(err.message || "Failed to create visitor record. Please try again.");
    } finally {
      setIsCheckingVisitor(false);
    }
  };

  // Handle back to form from camera step
  const handleBackToForm = () => {
    setCurrentStep("form");
  };

  // Reset form for new registration
  const handleRegisterAnother = () => {
    setCurrentStep("form"); // Start with form step
    setFormData({
      name: "",
      phone: "",
      email: "",
      // company: "",
      purpose: "",
      host: "",
    });
    setCapturedImage(null);
    if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setVisitorId(null);
    setExistingVisitor(null);
    setIsExistingVisitor(false);
    setIsCheckingVisitor(false);
    setValidationErrors({});
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm border border-white/20">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {["form", "camera", "success"].map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  ["form", "camera", "success"].indexOf(currentStep) >= index
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-110"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "form" && (
          <FormStep
            formData={formData}
            validationErrors={validationErrors}
            isSubmitting={isCheckingVisitor}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onBack={null} // No back button in first step
            isCheckingVisitor={isCheckingVisitor}
            existingVisitor={existingVisitor}
            existingImage={imagePreview}
            capturedImage={capturedImage}
          />
        )}
        {currentStep === "camera" && (
          <CameraStep 
            onPhotoCapture={handlePhotoCapture}
            onSkip={handleSkipPhoto}
            onUseExisting={handleUseExistingPhoto}
            onCompleteRegistration={handleCompleteRegistration}
            onBack={handleBackToForm}
            existingVisitor={existingVisitor}
            isExistingVisitor={isExistingVisitor}
            existingImage={imagePreview}
            capturedImage={capturedImage}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStep === "success" && (
          <SuccessStep
            visitorData={{ id: visitorId, status: isExistingVisitor ? "revisit" : "pending" }}
            onRegisterAnother={handleRegisterAnother}
          />
        )}
      </div>
    </div>
  );
};

export default VisitorRegistration;
