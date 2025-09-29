import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from 'react-toastify';
import { inviteeHelpers } from "../../api/invite.js";
import inviteeAPI from "../../api/invite.js";

const PassPreviewModal = ({ showPassPreview, selectedInvite, onClose, onInviteUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  if (!showPassPreview || !selectedInvite) return null;

  // Handle print pass functionality (same as InviteModal step 4)
  const handlePrintPass = async () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);

    try {
      // First, check-in the visitor (only if not already checked in)
      if (selectedInvite.id && !hasCheckedIn && selectedInvite.status !== "checked_in") {
        console.log('🎫 Checking in visitor after print pass...');
        await inviteeAPI.checkInVisitor(selectedInvite.id);
        console.log('✅ Visitor checked in successfully');
        setHasCheckedIn(true);
        
        // Notify parent component of the status update
        if (onInviteUpdated) {
          onInviteUpdated({ ...selectedInvite, status: "checked_in" });
        }
      }
      
      // Then generate and download the pass
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size for the pass
      canvas.width = 400;
      canvas.height = 450;
    
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
        ctx.fillText('Wish Geeks Techserve', canvas.width / 2, 80);
        
        // Add visitor image
        if (img) {
          const imgSize = 120;
          const imgX = (canvas.width - imgSize) / 2;
          const imgY = 100;
          
          // Create circular clipping path
          ctx.save();
          ctx.beginPath();
          ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
          ctx.restore();
          
          // Add border around image
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Draw placeholder circle with initials
          const imgSize = 120;
          const imgX = (canvas.width - imgSize) / 2;
          const imgY = 100;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Add initials
          ctx.fillStyle = 'white';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          const initials = (selectedInvite.visitor_name || 'V').charAt(0).toUpperCase();
          ctx.fillText(initials, imgX + imgSize/2, imgY + imgSize/2 + 15);
        }
        
        // Add visitor details
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(selectedInvite.visitor_name || 'Visitor', canvas.width / 2, 280);
        
        ctx.font = '16px Arial';
        ctx.fillText(selectedInvite.visitor_email || '', canvas.width / 2, 310);
        ctx.fillText(selectedInvite.purpose || 'Business Visit', canvas.width / 2, 340);
        
        // Add visit details
        ctx.font = '14px Arial';
        ctx.fillText(`Visit Time: ${selectedInvite.visit_time ? new Date(selectedInvite.visit_time).toLocaleString() : 'N/A'}`, canvas.width / 2, 380);
        ctx.fillText(`Invited by: ${selectedInvite.invited_by || 'Admin'}`, canvas.width / 2, 410);
        
        // Download the pass
        const link = document.createElement('a');
        link.download = `visitor-pass-${selectedInvite.visitor_name || 'visitor'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      // Load and draw image if available
      if (selectedInvite.image) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => drawPass(img);
        img.onerror = () => {
          console.warn('Failed to load image, drawing pass without image');
          drawPass();
        };
        // Use cache-busted URL to ensure we get the latest image
        img.src = `${selectedInvite.image}?t=${Date.now()}`;
      } else {
        drawPass();
      }

      toast.success('Pass printed successfully!');
    } catch (error) {
      console.error('Error printing pass:', error);
      toast.error('Failed to print pass. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle done button (same as InviteModal step 4)
  const handleDone = async () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);
    
    try {
      // Check-in the visitor (only if not already checked in)
      if (selectedInvite.id && !hasCheckedIn && selectedInvite.status !== "checked_in") {
        console.log('🎫 Checking in visitor on Done button...');
        await inviteeAPI.checkInVisitor(selectedInvite.id);
        console.log('✅ Visitor checked in successfully');
        setHasCheckedIn(true);
        
        // Notify parent component of the status update
        if (onInviteUpdated) {
          onInviteUpdated({ ...selectedInvite, status: "checked_in" });
        }
      }
      
      toast.success('Visitor checked in successfully!');
    } catch (error) {
      console.error('Error updating status on done:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
    
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              🎫 Pass Generated!
            </h3>
            <p className="text-gray-600">Your visitor pass is ready</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Pass Preview - Matches exactly what gets printed */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
          {/* Header - matches canvas */}
          <div className="text-center mb-4">
            <h4 className="text-xl font-bold mb-1">VISITOR PASS</h4>
            <p className="text-blue-100 text-sm">Wish Geeks Techserve</p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            {/* Visitor Image - matches canvas circular design */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
              {selectedInvite.image ? (
                <img
                  key={`preview-${selectedInvite.id}-${selectedInvite.image}`}
                  src={`${selectedInvite.image}?t=${Date.now()}`}
                  alt="Visitor"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {(selectedInvite.visitor_name || 'V').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Visitor Details - matches canvas layout */}
            <div className="text-center space-y-1">
              <h5 className="text-lg font-bold">{selectedInvite.visitor_name || 'Visitor'}</h5>
              <p className="text-blue-100 text-sm">{selectedInvite.visitor_email || ''}</p>
              <p className="text-blue-100 text-sm">{selectedInvite.purpose || 'Business Visit'}</p>
            </div>

            {/* Visit Details - matches canvas format */}
            <div className="text-center space-y-1 text-sm">
              <p className="text-blue-200">
                Visit Time: {selectedInvite.visit_time 
                  ? new Date(selectedInvite.visit_time).toLocaleString() 
                  : 'N/A'
                }
              </p>
              <p className="text-blue-200">
                Invited by: {selectedInvite.invited_by || 'Admin'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={handlePrintPass}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Print Pass'}
          </button>
          <button 
            onClick={handleDone}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Done
          </button>
        </div>

        {/* Success Message */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-green-800 font-medium">Pass Ready!</p>
              <p className="text-green-600 text-sm">You can now print the pass or mark the visitor as checked in.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PassPreviewModal;
