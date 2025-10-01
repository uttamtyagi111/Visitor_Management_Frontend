import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Shield, CheckCircle } from 'lucide-react';
import InviteModal from './InviteModal';

const PublicInvitePage = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isValidCode, setIsValidCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If invite code is provided in URL, validate it
    if (inviteCode) {
      validateInviteCode(inviteCode);
    } else {
      setLoading(false);
    }
  }, [inviteCode]);

  const validateInviteCode = async (code) => {
    try {
      // You can add validation logic here if needed
      // For now, we'll assume the code format is valid
      if (code && code.length === 6) {
        setIsValidCode(true);
        setShowModal(true);
      } else {
        setIsValidCode(false);
      }
    } catch (error) {
      setIsValidCode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCodeEntry = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (inviteCode) {
      navigate('/invite');
    }
  };

  const handleInviteUpdated = (updatedInvite) => {
    console.log('📱 Public invite page: Invite updated:', updatedInvite);
    
    // Trigger storage event to notify admin dashboard in other tabs
    localStorage.setItem('invite_updated', JSON.stringify({
      inviteId: updatedInvite.id,
      timestamp: Date.now(),
      type: 'image_update'
    }));
    
    // Remove the flag after a short delay to allow other tabs to catch it
    setTimeout(() => {
      localStorage.removeItem('invite_updated');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invite code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Wish Geeks Techserve</h1>
                <p className="text-sm text-gray-600">Visitor Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Secure Visit Process</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Wish Geeks Techserve
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete your visitor registration process to receive your digital pass
          </p>
        </motion.div>

        {/* Status Messages */}
        {inviteCode && isValidCode === false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl flex items-center justify-center space-x-2 max-w-md mx-auto"
          >
            <span>Invalid invite code. Please check your invitation email.</span>
          </motion.div>
        )}

        {inviteCode && isValidCode === true && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-green-100 border border-green-200 text-green-700 rounded-xl flex items-center justify-center space-x-2 max-w-md mx-auto"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Valid invite code detected. Opening registration...</span>
          </motion.div>
        )}

        {/* Process Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Enter Code</h3>
            <p className="text-gray-600 text-sm">
              Enter your 6-digit invitation code from your email
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Verify Details</h3>
            <p className="text-gray-600 text-sm">
              Review and confirm your visit information
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Capture Photo</h3>
            <p className="text-gray-600 text-sm">
              Take or upload your photo for the visit pass
            </p>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          {!inviteCode && (
            <button
              onClick={handleManualCodeEntry}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-2xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              <span>Start Registration Process</span>
            </button>
          )}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-16 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
        >
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Security & Privacy</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your information is securely processed and stored. Photos are used solely for 
                identification purposes during your visit. All data is handled in compliance 
                with privacy regulations and company security policies.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white/80 backdrop-blur-sm border-t border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2024 Wish Geeks Techserve. All rights reserved.</p>
            <p className="mt-2">
              Need help? Contact our reception at{' '}
              <a href="mailto:reception@wishgeeks.com" className="text-blue-600 hover:text-blue-700">
                reception@wishgeeks.com
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onInviteUpdated={handleInviteUpdated}
        isAdmin={false}
        initialInviteCode={inviteCode || ''}
      />
    </div>
  );
};

export default PublicInvitePage;
