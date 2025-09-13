import React, { useState } from "react";
import { visitorAPI } from "../../api/visitor";
import CameraStep from "./steps/CameraStep";
import FormStep from "./steps/FormStep";
import SuccessStep from "./steps/SuccessStep";

const VisitorRegistration = () => {
  const [currentStep, setCurrentStep] = useState("camera");
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [visitorId, setVisitorId] = useState(null);

  // Handle photo capture from camera step
  const handlePhotoCapture = (blob, previewUrl) => {
    setCapturedImage(blob);
    setImagePreview(previewUrl);
    setCurrentStep("form");
  };

  // Handle skip photo
  const handleSkipPhoto = () => {
    setCurrentStep("form");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!formData.purpose.trim()) {
      errors.purpose = "Purpose of visit is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the errors below and try again.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await visitorAPI.createVisitor(formData, capturedImage);
      setSuccess("Registration completed successfully! Welcome to our facility.");
      setVisitorId(response.id);
      setCurrentStep("success");
    } catch (err) {
      setError(err.message || "Failed to register visitor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back to camera
  const handleBackToCamera = () => {
    setCurrentStep("camera");
  };

  // Reset form for new registration
  const handleRegisterAnother = () => {
    setCurrentStep("camera");
    setFormData({
      name: "",
      phone: "",
      email: "",
      // company: "",
      purpose: "",
      // host: "",
    });
    setCapturedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setVisitorId(null);
    setValidationErrors({});
    setError("");
    setSuccess("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm border border-white/20">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {["camera", "form", "success"].map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  ["camera", "form", "success"].indexOf(currentStep) >= index
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-110"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "camera" && (
          <CameraStep 
            onPhotoCapture={handlePhotoCapture}
            onSkip={handleSkipPhoto}
          />
        )}
        {currentStep === "form" && (
          <FormStep
            formData={formData}
            validationErrors={validationErrors}
            error={error}
            isSubmitting={isSubmitting}
            capturedImage={capturedImage}
            imagePreview={imagePreview}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onBack={handleBackToCamera}
          />
        )}
        {currentStep === "success" && (
          <SuccessStep
            success={success}
            visitorId={visitorId}
            onRegisterAnother={handleRegisterAnother}
          />
        )}
      </div>
    </div>
  );
};

export default VisitorRegistration;
