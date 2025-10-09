import React, { useState, useCallback, useEffect } from "react";
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

  // Monitor capturedImage state changes
  useEffect(() => {
    console.log('🔍 CapturedImage state changed:', {
      hasCapturedImage: !!capturedImage,
      capturedImageDetails: capturedImage ? {
        size: capturedImage.size,
        type: capturedImage.type,
        name: capturedImage.name,
        constructor: capturedImage.constructor.name
      } : null
    });
  }, [capturedImage]);

  // Handle photo capture from camera step - Step 2: Just capture, don't submit yet
  const handlePhotoCapture = (imageFile, previewUrl) => {
    console.log('📸 Photo captured in VisitorRegistration:', {
      hasFile: !!imageFile,
      fileSize: imageFile?.size,
      fileType: imageFile?.type,
      fileName: imageFile?.name,
      fileConstructor: imageFile?.constructor?.name,
      previewUrl: previewUrl
    });
    
    if (imageFile) {
      setCapturedImage(imageFile);
      setImagePreview(previewUrl);
      console.log('📸 Image state updated successfully');
    } else {
      console.log('📸 Clearing captured image');
      setCapturedImage(null);
      setImagePreview(null);
    }
    // Don't auto-submit, wait for "Complete Registration" button
  };

  // // Handle skip photo - no image captured
  // const handleSkipPhoto = () => {
  //   setCapturedImage(null);
  //   // Don't auto-submit, wait for "Complete Registration" button
  // };

  // Handle using existing photo for returning visitors
  const handleUseExistingPhoto = () => {
    console.log('📸 Using existing photo for returning visitor');
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
      console.log('🚀 Complete registration for visitor ID:', visitorId);
      console.log('🚀 Current visitor status:', existingVisitor.status);
      console.log('🚀 Captured image available:', !!capturedImage);
      
      // Debug image details
      if (capturedImage) {
        console.log('🖼️ Image details:', {
          size: capturedImage.size,
          type: capturedImage.type,
          name: capturedImage.name || 'captured-image.png',
          constructor: capturedImage.constructor.name,
          isFile: capturedImage instanceof File,
          isBlob: capturedImage instanceof Blob
        });
      } else {
        console.log('🖼️ No captured image - will use existing image or skip');
      }
      
      // Prepare update data - Smart status update logic to avoid duplicates
      let updateData;
      let successMessage;
      
      if (existingVisitor.status === 'revisit') {
        // For returning visitors
        if (capturedImage) {
          // Scenario: Returning + new image
          // Backend already set status to 'pending' when image was uploaded, don't override
          updateData = {
            ...formData
            // Don't set status - backend already updated it to 'pending' when image was uploaded
          };
          successMessage = "Welcome back! Your visit has been registered and is pending approval.";
        } else {
          // Scenario: Returning + existing image  
          // Backend made no status change, frontend needs to set status to 'pending'
          updateData = {
            ...formData,
            status: 'pending' // Frontend sets status to 'pending' for approval workflow
          };
          successMessage = "Welcome back! Your visit has been registered and is pending approval.";
        }
      } else {
        // Scenario: New visitor
        // Frontend always sets status from 'created' to 'pending'
        updateData = {
          ...formData,
          status: 'pending' // Change from 'created' to 'pending' for new visitors
        };
        successMessage = "Registration completed successfully! Your visit is pending approval.";
      }

      // Debug status update logic
      console.log('🔄 Smart Status Update Logic:', {
        currentStatus: existingVisitor.status,
        hasNewImage: !!capturedImage,
        willUpdateStatus: !!updateData.status,
        scenario: existingVisitor.status === 'revisit' 
          ? (capturedImage ? 'Returning + new image (Backend handled status)' : 'Returning + existing image (Frontend handles status)')
          : 'New visitor (Frontend handles status)',
        statusInPayload: updateData.status || 'NOT_SET (Backend already updated)',
        expectedResult: 'Single timeline entry'
      });

      // Debug what we're sending to API
      console.log('🚀 About to call updateVisitor API with:', {
        visitorId: visitorId,
        updateData: updateData,
        capturedImageExists: !!capturedImage,
        statusInPayload: updateData.status || 'NOT_SET',
        capturedImageDetails: capturedImage ? {
          size: capturedImage.size,
          type: capturedImage.type,
          name: capturedImage.name,
          constructor: capturedImage.constructor.name,
          isFile: capturedImage instanceof File,
          isBlob: capturedImage instanceof Blob
        } : null
      });

      // ✅ CRITICAL FIX: Always pass the captured image to updateVisitor API
      // If no image was captured, pass null and backend will keep existing image
      const imageToSend = capturedImage || null;
      
      console.log('🚀 Calling updateVisitor API with:', {
        visitorId,
        updateData,
        imageToSend: imageToSend ? {
          name: imageToSend.name,
          size: imageToSend.size,
          type: imageToSend.type,
          constructor: imageToSend.constructor.name,
          isFile: imageToSend instanceof File,
          isBlob: imageToSend instanceof Blob
        } : 'null (will keep existing image)'
      });
      
      // Call updateVisitor API with image (or null)
      const response = await visitorAPI.updateVisitor(visitorId, updateData, imageToSend);
      
      console.log('✅ UpdateVisitor API response:', response);
      console.log('✅ Final visitor status:', response.status);
      console.log('✅ Image URL in response:', response.image);
      console.log('✅ Image URL type:', typeof response.image);
      console.log('✅ Has image URL:', !!response.image);
      console.log('✅ Full response object:', JSON.stringify(response, null, 2));
      
      // Update stored visitor data with response
      setExistingVisitor(response);
      
      // Set flag to refresh visitor list when user navigates back
      localStorage.setItem('visitor_registered', Date.now().toString());
      console.log('✅ Set visitor_registered flag for list refresh');
      
      // Show success message
      toast.success(successMessage);
      
      // Move to success step
      setCurrentStep("success");
      
    } catch (err) {
      console.error('❌ Error updating visitor:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        visitorId,
        capturedImage: !!capturedImage
      });
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
      
      // ✅ For new visitors: use 'created' status in Step 1 (creates timeline entry)
      // ✅ For returning visitors: backend will return 'revisit' status
      const visitorDataWithStatus = {
        ...formData,
        status: 'created' // This will create timeline entry for new visitors
      };
      
      const response = await visitorAPI.createVisitor(visitorDataWithStatus);
      
      console.log('CreateVisitor API response:', response);
      
      // Store the visitor data from response
      setExistingVisitor(response);
      setVisitorId(response.id);
      
      // Check if this is a returning visitor (revisit status) or new visitor (created status)
      if (response.status === 'revisit') {
        setIsExistingVisitor(true);
        console.log('Returning visitor detected:', response.name);
        toast.success(`Welcome back, ${response.name}!`);
      } else {
        setIsExistingVisitor(false);
        console.log('New visitor created with status:', response.status);
        toast.success("Visitor record created successfully!");
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
            // onSkip={handleSkipPhoto}
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
            visitorData={existingVisitor || { id: visitorId, status: isExistingVisitor ? "revisit" : "pending" }}
            onRegisterAnother={handleRegisterAnother}
          />
        )}
      </div>
    </div>
  );
};

export default VisitorRegistration;
