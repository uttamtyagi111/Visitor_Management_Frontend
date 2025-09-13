import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight
} from 'lucide-react';
import inviteeAPI, { inviteeHelpers } from '../../api/invite.js';
import CameraStep from './CameraStep';

const InviteModal = ({ isOpen, onClose, isAdmin = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inviteCode, setInviteCode] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  
  const [inviteFormData, setInviteFormData] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    invited_by: '',
    purpose: '',
    visit_time: '',
    expiry_time: ''
  });

  // Define steps - step 4 only visible to admin
  const steps = [
    { id: 1, title: 'Enter Code', icon: QrCode },
    { id: 2, title: 'Verify Details', icon: Edit },
    { id: 3, title: 'Capture Image', icon: Camera },
    ...(isAdmin ? [{ id: 4, title: 'Create Pass', icon: User }] : [])
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
    setCapturedImage(null);
    setCurrentStep(1);
    setError('');
    setSuccess('');
    setShowCamera(false);
  };

  const handleClose = () => {
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
      
      setInviteFormData({
        visitor_name: inviteData.visitor_name || '',
        visitor_email: inviteData.visitor_email || '',
        visitor_phone: inviteData.visitor_phone || '',
        purpose: inviteData.purpose || '',
        invited_by: inviteData.invited_by || '',
        visit_time: inviteData.visit_time || '',
        expiry_time: inviteData.expiry_time || '',
        visitor_image: inviteData.visitor_image || null
      });

      // If visitor already uploaded image, set it as captured image for admin
      if (isAdmin && inviteData.visitor_image) {
        setCapturedImage({
          file: null, // No file object since it's already uploaded
          preview: inviteData.visitor_image
        });
      }
      
      setCurrentStep(2);
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCameraPhotoCapture = (imageFile, previewUrl) => {
    setCapturedImage({
      file: imageFile,
      preview: previewUrl
    });
    setShowCamera(false);
    setError('');
  };

  const handleSkipCameraPhoto = () => {
    setShowCamera(false);
  };

  const handleImageCapture = (e) => {
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

      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage({
          file: file,
          preview: e.target.result
        });
        setError('');
      };
      reader.readAsDataURL(file);
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
      await inviteeAPI.captureVisitorData(inviteCode, capturedImage.file);
      
      if (isAdmin) {
        setSuccess('Visitor data captured successfully!');
        setCurrentStep(4);
      } else {
        setSuccess('Image submitted successfully! Please wait for admin approval.');
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPass = () => {
    const passElement = document.getElementById('visitor-pass');
    if (passElement) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Visitor Pass</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: sans-serif; }
        .pass-container { width: 300px; padding: 20px; background: linear-gradient(to bottom right, #2563eb, #7c3aed); color: white; border-radius: 16px; }
        .qr-container { background: white; border-radius: 8px; padding: 8px; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(passElement.outerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatDateTimeLocal = (datetimeString) => {
    if (!datetimeString) return "";
    const date = new Date(datetimeString);
    return date.toISOString().slice(0, 16);
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
                      onChange={(e) => setInviteFormData({...inviteFormData, visitor_name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={inviteFormData.visitor_email}
                      onChange={(e) => setInviteFormData({...inviteFormData, visitor_email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={inviteFormData.visitor_phone}
                      onChange={(e) => setInviteFormData({...inviteFormData, visitor_phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invited By</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={inviteFormData.invited_by}
                      onChange={(e) => setInviteFormData({...inviteFormData, invited_by: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Who invited you"
                      readOnly
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
                  <input
                    type="text"
                    value={inviteFormData.purpose}
                    onChange={(e) => setInviteFormData({...inviteFormData, purpose: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Purpose of visit"
                    readOnly
                  />
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
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Continue
                </button>
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
                    src={capturedImage.preview} 
                    alt="Captured" 
                    className="w-48 h-48 object-cover rounded-2xl mx-auto border-4 border-white shadow-lg"
                  />
                  <div className="mt-4 flex justify-center space-x-4">
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {inviteFormData.visitor_image && isAdmin ? 'Change Photo' : 'Retake Photo'}
                    </button>
                    {inviteFormData.visitor_image && isAdmin && (
                      <span className="px-4 py-2 text-green-600 text-sm bg-green-50 rounded-lg">
                        ✓ Uploaded by visitor
                      </span>
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
                  
                  {/* Only show upload option for logged-in users (admins) */}
                  {isAdmin && (
                    <>
                      <div className="flex items-center my-4">
                        <hr className="flex-1 border-gray-300" />
                        <span className="px-3 text-gray-500 text-sm">OR</span>
                        <hr className="flex-1 border-gray-300" />
                      </div>

                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Upload from device</p>
                        <p className="text-gray-400 text-sm mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    </>
                  )}
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
                {capturedImage && (
                  <button
                    onClick={handleCaptureVisitorData}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : isAdmin ? 'Create Pass' : 'Complete Registration'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="py-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {isAdmin ? 'Visitor Pass Created!' : 'Registration Complete!'}
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
                  <h4 className="text-lg font-bold">VISITOR PASS</h4>
                  <p className="text-blue-100 text-sm">Wish Geeks Techserve</p>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20">
                    {capturedImage ? (
                      <img src={capturedImage.preview} alt="Visitor" className="w-full h-full object-cover" />
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
                  <h4 className="text-xl font-semibold text-gray-900">Thank You!</h4>
                  <p className="text-gray-600">
                    You have successfully reviewed your details and uploaded your image. 
                    Please wait for your visitor pass to be generated by our admin team.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">i</span>
                      </div>
                      <div className="text-left">
                        <p className="text-blue-800 font-medium text-sm">What happens next?</p>
                        <ul className="text-blue-700 text-sm mt-2 space-y-1">
                          <li>• Our admin will review your information</li>
                          <li>• Your visitor pass will be generated</li>
                          <li>• You'll be notified when ready</li>
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
                  existingImage={inviteFormData.visitor_image}
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
