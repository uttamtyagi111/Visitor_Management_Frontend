import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { 
  X, 
  QrCode, 
  Edit, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  Calendar,
  Upload,
  AlertCircle,
  Check,
  ChevronRight,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import inviteeAPI, { inviteeHelpers } from '../../api/invite.js';
import CameraStep from './CameraStep';

// Helper function to handle CORS image loading
const loadImageWithCORS = (url, retryCount = 0) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No image URL provided'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.error('Image load error:', e);
      
      // If we've already retried, try with a proxy
      if (retryCount === 0) {
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        console.log('Trying with CORS proxy:', proxyUrl);
        loadImageWithCORS(proxyUrl, 1).then(resolve).catch(reject);
      } else {
        reject(e);
      }
    };
    
    // Add timestamp to prevent caching
    try {
      const finalUrl = new URL(url, window.location.origin);
      finalUrl.searchParams.set('t', Date.now());
      img.src = finalUrl.toString();
    } catch (error) {
      console.error('Error creating image URL:', error);
      // Try with the original URL as a last resort
      img.src = url;
    }
  });
};

const InviteModal = ({ isOpen, onClose, isAdmin = false, initialInviteCode = '', onInviteUpdated }) => {
  const { user } = useAuth(); // Get logged-in user information
  const [currentStep, setCurrentStep] = useState(1);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteId, setInviteId] = useState(null); // Store invite ID for status updates
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [autoVerified, setAutoVerified] = useState(false);
  const [isExistingVisitor, setIsExistingVisitor] = useState(false);
  const [isRetakeMode, setIsRetakeMode] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  
  const [inviteFormData, setInviteFormData] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    invited_by: '',
    purpose: '',
    visit_time: '',
    expiry_time: ''
  });

  // Define steps - admin always has 4th step; public also gets 4th success step
  const steps = [
    { id: 1, title: 'Enter Code', icon: QrCode },
    { id: 2, title: 'Verify Details', icon: Edit },
    { id: 3, title: 'Capture Image', icon: Camera },
    ...(isAdmin
      ? [{ id: 4, title: 'Create Pass', icon: User }]
      : [{ id: 4, title: 'Welcome', icon: User }])
  ];

  const resetForm = () => {
    setInviteFormData({
      visitor_name: '',
      visitor_email: '',
      visitor_phone: '',
      invited_by: '',
      purpose: '',
      visit_time: '',
      expiry_time: ''
    });
    setInviteCode('');
    setInviteId(null); // Reset invite ID
    setCapturedImage(null);
    setCurrentStep(1);
    setError('');
    setSuccess('');
    setShowCamera(false);
    setFormErrors({});
  };

  const handleClose = async () => {
    if (loading) return; // Prevent multiple clicks
    
    // If we're in step 4 (pass created) and user is admin, update status to checked_in (only if not already checked in)
    if (currentStep === 4 && isAdmin && inviteId && !hasCheckedIn) {
      setLoading(true);
      try {
        console.log('🎫 Checking in visitor on Done button...');
        await inviteeAPI.checkInVisitor(inviteId);
        console.log('✅ Visitor checked in successfully');
        setHasCheckedIn(true);
        
        // Notify parent component of the status update
        if (onInviteUpdated) {
          onInviteUpdated({ ...inviteFormData, id: inviteId, status: "checked_in" });
        }
      } catch (error) {
        console.error('Error updating status on close:', error);
        // Don't block the close action if status update fails
      } finally {
        setLoading(false);
      }
    }
    
    resetForm();
    onClose();
  };

  const handleInviteCodeSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (!inviteCode.trim()) {
        throw new Error('Please enter an invite code');
      }

      // Validate invite code format (6 hex chars from UUID)
      if (!inviteeHelpers.validateInviteCode(inviteCode)) {
        throw new Error('Invalid invite code format. Please enter a 6-character code.');
      }

      const inviteData = await inviteeAPI.verifyInvite(inviteCode);
      
      // Store the invite ID for status updates
      setInviteId(inviteData.id);
      
      setInviteFormData({
        visitor_name: inviteData.visitor_name || '',
        visitor_email: inviteData.visitor_email || '',
        visitor_phone: inviteData.visitor_phone || '',
        purpose: inviteData.purpose || '',
        invited_by: inviteData.invited_by || '',
        visit_time: inviteData.visit_time || '',
        expiry_time: inviteData.expiry_time || '',
        image: inviteData.image || null
      });
      setIsExistingVisitor(!!inviteData.image);

      // If visitor already uploaded image, set it as captured image for admin
      if (isAdmin && inviteData.image) {
        setCapturedImage({
          file: null, // No file object since it's already uploaded
          preview: inviteData.image
        });
      }
      
      setCurrentStep(2);
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when invite code is provided via URL (PublicInvitePage)
  useEffect(() => {
    const autoVerify = async () => {
      if (!isOpen || autoVerified) return;
      if (!initialInviteCode || initialInviteCode.length !== 6) return;
      try {
        setLoading(true);
        setError('');
        const inviteData = await inviteeAPI.verifyInvite(initialInviteCode);
        setInviteId(inviteData.id);
        setInviteFormData({
          visitor_name: inviteData.visitor_name || '',
          visitor_email: inviteData.visitor_email || '',
          visitor_phone: inviteData.visitor_phone || '',
          purpose: inviteData.purpose || '',
          invited_by: inviteData.invited_by || '',
          visit_time: inviteData.visit_time || '',
          expiry_time: inviteData.expiry_time || '',
          image: inviteData.image || null
        });
        setInviteCode(initialInviteCode.toLowerCase());
        setIsExistingVisitor(!!inviteData.image);
        if (isAdmin && inviteData.image) {
          setCapturedImage({ file: null, preview: inviteData.image });
        }
        setCurrentStep(2);
        setAutoVerified(true);
      } catch (error) {
        setError(inviteeHelpers.handleApiError(error));
      } finally {
        setLoading(false);
      }
    };
    autoVerify();
  }, [isOpen, initialInviteCode, isAdmin, autoVerified]);

  const handleCameraPhotoCapture = (imageFile, previewUrl) => {
    setCapturedImage({
      file: imageFile,
      preview: previewUrl
    });
    setShowCamera(false);
    setIsRetakeMode(false);
    setError('');
  };

  const handleSkipCameraPhoto = () => {
    setShowCamera(false);
    setIsRetakeMode(false);
  };

  // Edit state for Step 2 (Verify Details)
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const handleStartEditDetails = () => {
    setIsEditingDetails(true);
    setError('');
  };

  const handleSaveDetails = async () => {
    if (!inviteId) return;
    // Validate phone if provided
    if (inviteFormData.visitor_phone && inviteFormData.visitor_phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // For admins, allow saving all key fields; for public, only phone/purpose
      const payload = isAdmin ? {
        visitor_name: inviteFormData.visitor_name || '',
        visitor_email: inviteFormData.visitor_email || '',
        visitor_phone: inviteFormData.visitor_phone || '',
        purpose: inviteFormData.purpose || ''
      } : {
        visitor_phone: inviteFormData.visitor_phone || '',
        purpose: inviteFormData.purpose || ''
      };

      await inviteeAPI.updateInvite(inviteId, payload);
      if (!isAdmin) setIsEditingDetails(false);
      setCurrentStep(3);
    } catch (e) {
      setError(inviteeHelpers.handleApiError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG)');
        return;
      }

      setLoading(true);
      try {
        console.log('🖼️ Starting image update process...');
        console.log('📋 Current inviteId:', inviteId);
        console.log('📋 Current inviteFormData:', inviteFormData);
        
        // Check if we have an invite ID
        if (!inviteId) {
          throw new Error('No invite ID available for image update');
        }

        const formData = new FormData();
        formData.append('image', file);
        
        console.log('📎 Added image file to FormData:', file.name, file.size, 'bytes');
        
        // Add other form data if needed
        Object.entries(inviteFormData).forEach(([key, value]) => {
          if (key !== 'image' && value !== null && value !== undefined) {
            formData.append(key, value);
            console.log(`📎 Added ${key}:`, value);
          }
        });

        console.log('🚀 Calling updateInvite API...');
        // Update the invite with the new image
        const updatedInvite = await inviteeAPI.updateInvite(inviteId, formData, true);
        console.log('✅ API response:', updatedInvite);
        console.log('📸 API returned image URL:', updatedInvite?.image);
        console.log('📋 Full API response structure:', JSON.stringify(updatedInvite, null, 2));
        
        // Update the local state with the new image
        setInviteFormData(prev => ({
          ...prev,
          image: updatedInvite.image
        }));
        
        // Update captured image for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage({
            file: file,
            preview: e.target.result
          });
        };
        reader.readAsDataURL(file);
        
        // If this is an edit, update the parent's state
        console.log('🔄 Updating parent component with updated invite...');
        console.log('📞 onInviteUpdated callback exists:', !!onInviteUpdated);
        console.log('📸 Updated invite data being sent:', updatedInvite);
        if (onInviteUpdated) {
          onInviteUpdated(updatedInvite);
          console.log('✅ onInviteUpdated callback called successfully');
        } else {
          console.warn('⚠️ onInviteUpdated callback not provided');
        }
        
        // Clear the image input field
        const imageInput = document.querySelector('#image-input');
        if (imageInput) {
          imageInput.value = '';
        }
        
        setError('');
        toast.success('Image updated successfully!');
      } catch (err) {
        console.error('Error updating image:', err);
        setError('Failed to update image. Please try again.');
        toast.error('Failed to update image');
      } finally {
        setLoading(false);
      }
    }
  };

  // Use existing server image by converting to a File (no immediate submit)
  const handleUseExistingImage = async () => {
    if (!inviteFormData.image) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(inviteFormData.image, { mode: 'cors' });
      if (!response.ok) {
        throw new Error('Failed to fetch existing image');
      }
      const blob = await response.blob();
      const fileType = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/png';
      const fileName = fileType === 'image/png' ? 'visitor-photo.png' : 'visitor-photo.jpg';
      const file = new File([blob], fileName, { type: fileType, lastModified: Date.now() });

      // Set as captured image so the Complete button appears
      const previewUrl = URL.createObjectURL(blob);
      setCapturedImage({ file, preview: previewUrl });
    } catch (err) {
      setError('Unable to use the existing photo. Please upload or retake your photo.');
    } finally {
      setLoading(false);
    }
  };

  // Admin create pass flow: ensure we have a File, then submit
  const handleAdminCreatePass = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');
    try {
      let fileToUpload = capturedImage?.file || null;
      if (!fileToUpload && inviteFormData.image) {
        // Convert existing image to File directly to avoid double clicks/state timing
        const resp = await fetch(inviteFormData.image, { mode: 'cors' });
        const blob = await resp.blob();
        const type = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/png';
        const name = type === 'image/png' ? 'visitor-photo.png' : 'visitor-photo.jpg';
        fileToUpload = new File([blob], name, { type, lastModified: Date.now() });
      }
      if (!fileToUpload) {
        setError('A photo file is required. Please upload or retake your photo.');
        return;
      }

      const resp = await inviteeAPI.captureVisitorData(inviteCode, fileToUpload);
      // Update UI with latest image URL if returned
      if (resp?.invite?.image) {
        setInviteFormData({ ...inviteFormData, image: resp.invite.image });
      }
      
      setSuccess('Visitor data captured successfully!');
      setCurrentStep(4);
    } catch (e) {
      setError(inviteeHelpers.handleApiError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureVisitorData = async () => {
    if (!capturedImage) {
      setError('Please capture or upload an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!capturedImage?.file) {
        setError('A photo file is required. Please upload or retake your photo.');
        setShowCamera(true);
        return;
      }
      const resp = await inviteeAPI.captureVisitorData(inviteCode, capturedImage.file);
      if (resp?.invite?.image) {
        setInviteFormData({ ...inviteFormData, image: resp.invite.image });
      }

      if (isAdmin) {
        setSuccess('Visitor data captured successfully!');
        setCurrentStep(4);
      } else {
        // For public users, show a friendly completion/welcome step
        setSuccess(isExistingVisitor ? 'Welcome back! Your visit is confirmed.' : 'Thanks! We have your image. Await admin approval.');
        setCurrentStep(4);
      }
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPass = async () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);
    setError('');

    try {
      // First, check-in the visitor (only if not already checked in)
      if (inviteId && !hasCheckedIn) {
        console.log('🎫 Checking in visitor after print pass...');
        await inviteeAPI.checkInVisitor(inviteId);
        console.log('✅ Visitor checked in successfully');
        setHasCheckedIn(true);
        
        // Notify parent component of the status update
        if (onInviteUpdated) {
          onInviteUpdated({ ...inviteFormData, id: inviteId, status: "checked_in" });
        }
      }
      
      // Then generate and download the pass
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size for the pass
      canvas.width = 400;
      canvas.height = 600;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#7c3aed');
    
    // Draw the pass
    const drawPass = (img = null) => {
      // Draw background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add header
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VISITOR PASS', canvas.width / 2, 50);
      
      ctx.font = '16px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Wish Geeks Techserve', canvas.width / 2, 80);
      
      // Add visitor image or placeholder
      if (img) {
        // Draw image with border
        const imgSize = 120;
        const x = (canvas.width - imgSize) / 2;
        const y = 120;
        
        // Draw circular image
        ctx.beginPath();
        ctx.arc(x + imgSize/2, y + imgSize/2, imgSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.save();
        ctx.clip();
        
        // Draw the image
        ctx.drawImage(img, x, y, imgSize, imgSize);
        ctx.restore();
        
        // Add border
        ctx.beginPath();
        ctx.arc(x + imgSize/2, y + imgSize/2, imgSize/2, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else {
        // Draw placeholder
        const x = canvas.width / 2 - 60;
        const y = 120;
        const size = 120;
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        
        // Add user icon
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👤', x + size/2, y + size/2);
      }
      
      // Add visitor name
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(inviteFormData.visitor_name || 'Visitor', canvas.width / 2, 280);
      
      // Add email if available
      if (inviteFormData.visitor_email) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(inviteFormData.visitor_email, canvas.width / 2, 310);
      }
      
      // Add visit details
      ctx.textAlign = 'left';
      ctx.font = '14px Arial';
      
      // Purpose
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Purpose:', 50, 360);
      ctx.fillStyle = 'white';
      ctx.fillText(inviteFormData.purpose || 'General Visit', 150, 360);
      
      // Visit Time
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Visit Time:', 50, 390);
      ctx.fillStyle = 'white';
      ctx.fillText(inviteeHelpers.formatDateTime(inviteFormData.visit_time), 150, 390);
      
      // Invited By
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Invited By:', 50, 420);
      ctx.fillStyle = 'white';
      ctx.fillText(inviteFormData.invited_by || 'Admin', 150, 420);
      
      // Invite Code
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Code:', 50, 450);
      ctx.fillStyle = 'white';
      ctx.font = 'monospace 14px Arial';
      ctx.fillText(inviteCode, 150, 450);
      
      // Add footer
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px Arial';
      ctx.fillText('Please wear this pass at all times during your visit', canvas.width / 2, 520);
      ctx.fillText('Generated on: ' + new Date().toLocaleDateString(), canvas.width / 2, 540);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invite-pass-${inviteFormData.visitor_name || 'visitor'}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    };
    
    // Load image with CORS handling
    const loadAndDrawImage = async () => {
      if (!capturedImage?.preview) {
        drawPass();
        return;
      }

      try {
        const img = await loadImageWithCORS(capturedImage.preview);
        drawPass(img);
      } catch (error) {
        console.error('Failed to load image:', error);
        drawPass();
      }
    };

    loadAndDrawImage();
    
    // Show success message
    setSuccess('Pass generated and downloaded successfully! Visitor status updated to checked-in.');
    
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (datetimeString) => {
    if (!datetimeString) return "";
    const date = new Date(datetimeString);
    return date.toISOString().slice(0, 16);
  };

  // Handle phone number input - only allow exactly 10 digits
  const handlePhoneInput = (e) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits maximum
    if (digitsOnly.length <= 10) {
      setInviteFormData({
        ...inviteFormData,
        visitor_phone: digitsOnly,
      });
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input with validation
  const handleEmailInput = (e) => {
    const value = e.target.value;
    setInviteFormData({
      ...inviteFormData,
      visitor_email: value,
    });

    // Clear previous email error
    if (formErrors.visitor_email) {
      setFormErrors({
        ...formErrors,
        visitor_email: ''
      });
    }

    // Validate email if not empty
    if (value && !validateEmail(value)) {
      setFormErrors({
        ...formErrors,
        visitor_email: 'Please enter a valid email address'
      });
    }
  };

  // Validate form before proceeding to next step
  const validateFormStep2 = () => {
    const errors = {};
    
    if (!inviteFormData.visitor_name.trim()) {
      errors.visitor_name = 'Name is required';
    }
    
    if (!inviteFormData.visitor_email.trim()) {
      errors.visitor_email = 'Email is required';
    } else if (!validateEmail(inviteFormData.visitor_email)) {
      errors.visitor_email = 'Please enter a valid email address';
    }
    
    // Validate phone if provided - must be exactly 10 digits
    if (inviteFormData.visitor_phone) {
      if (inviteFormData.visitor_phone.length !== 10) {
        errors.visitor_phone = 'Phone number must be exactly 10 digits';
      } else if (!/^\d{10}$/.test(inviteFormData.visitor_phone)) {
        errors.visitor_phone = 'Phone number must contain only digits';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Enter Invite Code</h3>
            <p className="text-gray-600 mb-8">Enter your invitation code to proceed</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
                className="w-full px-6 py-4 text-center text-2xl font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 tracking-wider"
                placeholder="abc123"
                maxLength={6}
              />
              
              <button
                onClick={handleInviteCodeSubmit}
                disabled={!inviteCode.trim() || loading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="py-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Verify Your Details</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={inviteFormData.visitor_name}
                      onChange={(e) => {
                        setInviteFormData({...inviteFormData, visitor_name: e.target.value});
                        // Clear name error if user starts typing
                        if (formErrors.visitor_name) {
                          setFormErrors({...formErrors, visitor_name: ''});
                        }
                      }}
                      className={`w-full pl-10 pr-12 py-3 ${(isAdmin || isEditingDetails) ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'} border ${
                        formErrors.visitor_name ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter full name"
                      readOnly={!isAdmin}
                    />
                  </div>
                  {formErrors.visitor_name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.visitor_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={inviteFormData.visitor_email}
                      onChange={handleEmailInput}
                      className={`w-full pl-10 pr-12 py-3 ${(isAdmin || isEditingDetails) ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'} border ${
                        formErrors.visitor_email ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter email address"
                      readOnly={!isAdmin}
                    />
                  </div>
                  {formErrors.visitor_email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.visitor_email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={inviteFormData.visitor_phone}
                      onChange={handlePhoneInput}
                      onKeyPress={(e) => {
                        // Prevent non-numeric characters on keypress
                        const char = String.fromCharCode(e.which);
                        if (!/[0-9]/.test(char)) {
                          e.preventDefault();
                        }
                      }}
                      maxLength="10"
                      className={`w-full pl-10 pr-12 py-3 ${ (isAdmin || isEditingDetails) ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-700'} border ${
                        formErrors.visitor_phone ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter 10-digit phone number"
                      readOnly={!(isAdmin || isEditingDetails)}
                    />
                    {!isAdmin && (
                    <button
                      type="button"
                      onClick={handleStartEditDetails}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-11.03 11.03a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                      </svg>
                    </button>
                    )}
                  </div>
                  {formErrors.visitor_phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.visitor_phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invited By</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={inviteFormData.invited_by || (isAdmin ? (user?.name || user?.email || "") : inviteFormData.invited_by)}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-600"
                      placeholder="Auto-filled from invitation"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visit Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={formatDateTimeLocal(inviteFormData.visit_time)}
                      onChange={(e) => setInviteFormData({...inviteFormData, visit_time: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inviteFormData.purpose}
                      onChange={(e) => setInviteFormData({...inviteFormData, purpose: e.target.value})}
                      className={`w-full pl-4 pr-12 py-3 ${(isAdmin || isEditingDetails) ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-700'} border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Purpose of visit"
                      readOnly={!(isAdmin || isEditingDetails)}
                    />
                    {!isAdmin && (
                    <button
                      type="button"
                      onClick={handleStartEditDetails}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-11.03 11.03a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                      </svg>
                    </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
                {(isAdmin || isEditingDetails) ? (
                  <button
                    type="button"
                    onClick={handleSaveDetails}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : (isAdmin ? 'Save & Continue' : 'Save & Continue')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateFormStep2()) {
                        setCurrentStep(3);
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Continue
                  </button>
                )}
              </div>
            </form>
          </div>
        );

      case 3:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Capture Your Photo</h3>
            <p className="text-gray-600 mb-8">Take a photo or upload an existing one for your visitor pass</p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2 max-w-md mx-auto">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="max-w-md mx-auto">
              {capturedImage ? (
                <div className="mb-6">
                  <img 
                    key={`captured-${inviteId}-${Date.now()}`}
                    src={capturedImage.preview} 
                    alt="Captured" 
                    className="w-48 h-48 object-cover rounded-2xl mx-auto border-4 border-white shadow-lg"
                  />
                  <div className="mt-4 flex justify-center space-x-3">
                    <button
                      onClick={() => { setCapturedImage(null); setIsRetakeMode(true); setShowCamera(true); }}
                      className="p-2 rounded-full bg-white text-blue-600 hover:bg-gray-100 shadow"
                      title="Retake"
                      aria-label="Retake"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow"
                        title="Upload"
                        aria-label="Upload"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : inviteFormData.image ? (
                <div className="mb-6">
                  <img 
                    key={`existing-${inviteId}-${inviteFormData.image}`}
                    src={`${inviteFormData.image}?t=${Date.now()}`}
                    alt="Existing"
                    className="w-48 h-48 object-cover rounded-2xl mx-auto border-4 border-white shadow-lg"
                  />
                  <div className="mt-4 flex justify-center space-x-3">
                    <button
                      onClick={handleUseExistingImage}
                      disabled={loading}
                      className="p-2 rounded-full bg-white text-green-600 hover:bg-gray-100 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Use this image"
                      aria-label="Use this image"
                    >
                      {loading ? (
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" opacity="0.75"/></svg>
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => { setCapturedImage(null); setIsRetakeMode(true); setShowCamera(true); }}
                      className="p-2 rounded-full bg-white text-blue-600 hover:bg-gray-100 shadow"
                      title="Retake"
                      aria-label="Retake"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow"
                        title="Upload"
                        aria-label="Upload"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCamera(true)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo with Camera</span>
                  </button>
                  
                  <div className="flex items-center my-4">
                    <hr className="flex-1 border-gray-300" />
                    <span className="px-3 text-gray-500 text-sm">OR</span>
                    <hr className="flex-1 border-gray-300" />
                  </div>

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                    title="Upload"
                    aria-label="Upload"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="sr-only">Upload from device or gallery</span>
                    <p className="text-gray-400 text-sm">JPG, PNG up to 5MB</p>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageCapture}
                className="hidden"
              />

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
                {isAdmin ? (
                  <button
                    onClick={handleAdminCreatePass}
                    disabled={loading || (!capturedImage?.file && !inviteFormData.image)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Create Pass'}
                  </button>
                ) : (
                  capturedImage?.file && (
                    <button
                      onClick={handleCaptureVisitorData}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : 'Complete Registration'}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="py-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {isAdmin ? 'Invites Pass Created!' : 'Welcome'}
            </h3>
            
            {success && (
              <div className="mb-6 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center justify-center space-x-2">
                <Check className="w-4 h-4" />
                <span className="text-sm">{success}</span>
              </div>
            )}
            
            {/* Show different content for admin vs public users */}
            {isAdmin ? (
              <div className="max-w-sm mx-auto">
                <div id="visitor-pass" className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl pass-container">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold">INVITES PASS</h4>
                  <p className="text-blue-100 text-sm">Wish Geeks Techserve</p>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20">
                    {capturedImage ? (
                      <img 
                        key={`pass-preview-${inviteId}-${capturedImage.preview}`}
                        src={capturedImage.preview} 
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
                    <h5 className="font-bold text-lg">{inviteFormData.visitor_name}</h5>
                    <p className="text-blue-100 text-sm">{inviteFormData.visitor_email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Visit Time:</span>
                    <span>{inviteeHelpers.formatDateTime(inviteFormData.visit_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Purpose:</span>
                    <span className="text-right">{inviteFormData.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Invited By:</span>
                    <span className="text-right">{inviteFormData.invited_by}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Code:</span>
                    <span className="text-right font-mono text-xs">{inviteCode}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button 
                  onClick={handlePrintPass}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                >
                  Print Pass
                </button>
                <button 
                  onClick={handleClose}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Done
                </button>
              </div>
            </div>
            ) : (
              // Success message for non-logged-in users
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-gray-900">Thank you, {inviteFormData.visitor_name || 'Guest'}!</h4>
                  <p className="text-gray-600">Your details and photo have been submitted.</p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">i</span>
                      </div>
                      <div className="text-left">
                        <p className="text-blue-800 font-medium text-sm">What happens next?</p>
                        <ul className="text-blue-700 text-sm mt-2 space-y-1">
                          <>
                            <li>• Our admin will review your information</li>
                            <li>• Your invite pass will be generated</li>
                            <li>• You'll be notified when ready</li>
                          </>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleClose}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {isAdmin ? 'Admin Invite Process' : 'Complete Your Visit'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-300 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {success && !isAdmin && currentStep === 3 && (
              <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center justify-center space-x-2">
                <Check className="w-5 h-5" />
                <span>{success}</span>
              </div>
            )}
            {renderStepContent()}
          </div>
        </motion.div>

        {/* Camera Modal */}
        <AnimatePresence>
          {showCamera && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4"
              onClick={() => setShowCamera(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Camera</h3>
                  <button
                    onClick={() => setShowCamera(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <CameraStep 
                  onPhotoCapture={handleCameraPhotoCapture}
                  onSkip={handleSkipCameraPhoto}
                  isLoggedIn={isAdmin}
                  existingImage={null}
                  autoStart={true}
                  allowUpload={false}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default InviteModal;
