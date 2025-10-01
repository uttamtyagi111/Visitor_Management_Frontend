import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import inviteeAPI from "../../api/invite.js";

const useInviteActions = (invites = [], refreshCallback = null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Generate professional visitor pass with image and proper formatting
  const generatePassAsImage = async (invite) => {
    console.log('🎫 NEW PROFESSIONAL PASS GENERATION STARTED for:', invite.visitor_name);
    console.log('🖼️ Invite image URL:', invite.image);
    try {
      // Create canvas for the pass
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size for professional pass (ID card size ratio)
      canvas.width = 600;
      canvas.height = 900;
      
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      
      // Header section with company branding
      const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 120);
      headerGradient.addColorStop(0, '#1e40af');
      headerGradient.addColorStop(1, '#3b82f6');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(20, 20, canvas.width - 40, 120);
      
      // Company name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VISITOR PASS', canvas.width / 2, 70);
      
      ctx.font = '20px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('Wish Geeks Techserve', canvas.width / 2, 110);
      
      // Load and draw visitor image if available
      let imageLoaded = false;
      if (invite.image) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Draw circular image
              const imgSize = 150;
              const imgX = (canvas.width - imgSize) / 2;
              const imgY = 170;
              
              // Create circular clipping path
              ctx.save();
              ctx.beginPath();
              ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
              ctx.clip();
              
              // Draw image
              ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
              ctx.restore();
              
              // Add border around image
              ctx.strokeStyle = '#d1d5db';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
              ctx.stroke();
              
              imageLoaded = true;
              resolve();
            };
            img.onerror = () => {
              console.warn('Failed to load visitor image');
              resolve(); // Continue without image
            };
            img.src = invite.image.includes('?') ? invite.image : `${invite.image}?t=${Date.now()}`;
          });
        } catch (error) {
          console.warn('Error loading visitor image:', error);
        }
      }
      
      // If no image loaded, show placeholder
      if (!imageLoaded) {
        const imgSize = 150;
        const imgX = (canvas.width - imgSize) / 2;
        const imgY = 170;
        
        // Draw placeholder circle
        ctx.fillStyle = '#f3f4f6';
        ctx.beginPath();
        ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add user icon placeholder
        ctx.fillStyle = '#9ca3af';
        ctx.font = '60px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👤', imgX + imgSize/2, imgY + imgSize/2 + 20);
      }
      
      // Visitor name (large, prominent)
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(invite.visitor_name || 'Guest Visitor', canvas.width / 2, 380);
      
      // Visitor details section
      const startY = 440;
      const lineHeight = 45;
      let currentY = startY;
      
      ctx.fillStyle = '#374151';
      ctx.font = '24px Arial, sans-serif';
      ctx.textAlign = 'left';
      
      // Email
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('EMAIL:', 60, currentY);
      ctx.fillStyle = '#374151';
      ctx.font = '20px Arial, sans-serif';
      ctx.fillText(invite.visitor_email || 'N/A', 160, currentY);
      currentY += lineHeight;
      
      // Purpose
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('PURPOSE:', 60, currentY);
      ctx.fillStyle = '#374151';
      ctx.font = '20px Arial, sans-serif';
      ctx.fillText(invite.purpose || 'Meeting', 180, currentY);
      currentY += lineHeight;
      
      // Invite Code
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('CODE:', 60, currentY);
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText(invite.invite_code || 'NO-CODE', 140, currentY);
      currentY += lineHeight + 20;
      
      // Visit details section with background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(40, currentY - 10, canvas.width - 80, 120);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, currentY - 10, canvas.width - 80, 120);
      
      currentY += 20;
      
      // Visit time
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText('VISIT TIME:', 60, currentY);
      ctx.fillStyle = '#059669';
      ctx.font = '18px Arial, sans-serif';
      if (invite.visit_time) {
        ctx.fillText(new Date(invite.visit_time).toLocaleString(), 180, currentY);
      }
      currentY += 35;
      
      // Expiry time
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText('EXPIRES:', 60, currentY);
      ctx.fillStyle = '#dc2626';
      ctx.font = '18px Arial, sans-serif';
      if (invite.expiry_time) {
        ctx.fillText(new Date(invite.expiry_time).toLocaleString(), 150, currentY);
      }
      
      // Footer section
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(20, canvas.height - 120, canvas.width - 40, 100);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Please present this pass at reception', canvas.width / 2, canvas.height - 80);
      ctx.fillText('Keep this pass visible at all times', canvas.width / 2, canvas.height - 60);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(`Generated: ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height - 35);
      
      // Convert canvas to blob
      console.log('✅ NEW PROFESSIONAL PASS GENERATED successfully');
      return await new Promise(resolve => {
        canvas.toBlob(blob => {
          console.log('📄 Pass blob created, size:', blob.size, 'bytes');
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('❌ Error generating NEW professional pass:', error);
      throw error;
    }
  };

  const handleGeneratePass = useCallback(async (invite) => {
    try {
      const blob = await generatePassAsImage(invite);
      return blob;
    } catch (error) {
      console.error('Error generating pass:', error);
      toast.error('Failed to generate pass');
      return null;
    }
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback(async (inviteId, newStatus, options = {}) => {
    console.log('🚀 InviteActions.handleStatusUpdate called for invite:', inviteId, 'Status:', newStatus, 'Options:', options);
    
    // If changing to checked_in, clear previous check-out time for new visit session
    if (newStatus === 'checked_in') {
      options = {
        ...options,
        visit_time: new Date().toISOString(), // Set current time as check-in time
        clearCheckedOut: true // Clear previous check-out time
      };
      console.log('🔄 Clearing previous check-out time for new check-in session');
    }
    
    try {
      setLoading(true);
      
      // If checking in or revisiting, generate and upload pass
      let passFile = null;
      if (['checked_in', 'revisit'].includes(newStatus)) {
        const invite = Array.isArray(invites) ? invites.find(i => i.id === inviteId) : null;
        if (invite) {
          passFile = await handleGeneratePass(invite);
        }
      }
      
      await inviteeAPI.updateInviteStatus(inviteId, newStatus, options, passFile);
      
      // Trigger report refresh by setting localStorage flag
      localStorage.setItem('report_updated', Date.now().toString());
      
      // Refresh the invites list to show updated status
      if (refreshCallback) {
        await refreshCallback();
      }
      
      toast.success(`Status updated to ${newStatus} successfully!`);
      return true;
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleGeneratePass, invites, refreshCallback]);

  // Handle check-in (automatically sets current time)
  const handleCheckIn = useCallback(async (inviteId) => {
    try {
      setLoading(true);
      await inviteeAPI.checkInVisitor(inviteId);
      
      // Trigger report refresh by setting localStorage flag
      localStorage.setItem('report_updated', Date.now().toString());
      
      // Refresh the invites list to show updated status
      if (refreshCallback) {
        await refreshCallback();
      }
      
      toast.success("Visitor checked in successfully!");
      return true;
    } catch (err) {
      console.error("Error checking in visitor:", err);
      toast.error(err.message || "Failed to check in visitor");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCallback]);

  // Handle check-out (automatically sets current time)
  const handleCheckOut = useCallback(async (inviteId) => {
    try {
      setLoading(true);
      await inviteeAPI.checkOutVisitor(inviteId);
      
      // Trigger report refresh by setting localStorage flag
      localStorage.setItem('report_updated', Date.now().toString());
      
      // Refresh the invites list to show updated status
      if (refreshCallback) {
        await refreshCallback();
      }
      
      toast.success("Visitor checked out successfully!");
      return true;
    } catch (err) {
      console.error("Error checking out visitor:", err);
      toast.error(err.message || "Failed to check out visitor");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCallback]);

  // Handle delete invite
  const handleDeleteInvite = useCallback(async (inviteId) => {
    if (!window.confirm("Are you sure you want to delete this invitation?")) {
      return false;
    }

    try {
      setLoading(true);
      await inviteeAPI.deleteInvite(inviteId);
      toast.success("Invitation deleted successfully!");
      return true;
    } catch (err) {
      console.error("Error deleting invite:", err);
      toast.error(err.message || "Failed to delete invitation");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCallback]);

  // Handle generate invite pass - now opens preview modal instead of direct status update
  const handleGenerateInvitePass = useCallback(async (invite, openPassPreview) => {
    try {
      setLoading(true);
      
      // Open the pass preview modal instead of directly updating status
      if (openPassPreview) {
        openPassPreview(invite);
      }
      
      return true;
    } catch (err) {
      console.error("Error opening pass preview:", err);
      toast.error(err.message || "Failed to open pass preview");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCallback]);

  // Handle download pass
  const handleDownloadPass = useCallback((invite) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#2563eb");
    gradient.addColorStop(1, "#7c3aed");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add company header
    ctx.fillStyle = "white";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("VISITOR PASS", canvas.width / 2, 80);
    
    ctx.font = "18px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("Wish Geeks Techserve", canvas.width / 2, 110);
    
    // Add visitor info
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Visitor Information:", 60, 180);
    
    ctx.font = "20px Arial";
    ctx.fillText(`Name: ${invite.visitor_name}`, 60, 220);
    ctx.fillText(`Email: ${invite.visitor_email}`, 60, 250);
    ctx.fillText(`Purpose: ${invite.purpose}`, 60, 280);
    ctx.fillText(`Invite Code: ${invite.invite_code}`, 60, 310);
    
    // Add visit details
    ctx.font = "bold 24px Arial";
    ctx.fillText("Visit Details:", 60, 370);
    
    ctx.font = "20px Arial";
    ctx.fillText(`Visit Time: ${new Date(invite.visit_time).toLocaleString()}`, 60, 410);
    if (invite.expiry_time) {
      ctx.fillText(`Expires: ${new Date(invite.expiry_time).toLocaleString()}`, 60, 440);
    }
    
    // Add footer
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("Please present this pass at reception", canvas.width / 2, 520);
    ctx.fillText(`Generated on: ${new Date().toLocaleString()}`, canvas.width / 2, 550);
    
    // Download the canvas as image
    const link = document.createElement("a");
    link.download = `visitor-pass-${invite.visitor_name.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  // Handle submit invite form
  const handleSubmitInvite = useCallback(async (formData, resetForm) => {
    try {
      setLoading(true);
      
      await inviteeAPI.createInvite(formData);
      
      toast.success("Invitation sent successfully!");
      
      if (resetForm) {
        resetForm();
      }
      
      return true;
    } catch (err) {
      console.error("Error sending invitation:", err);
      
      // Handle specific error cases
      let errorMessage = err.message || "Failed to send invitation";
      
      // Check if the error message contains the JSON response with visitor_email error
      if (errorMessage.includes('visitor_email') && errorMessage.includes('already exists')) {
        toast.error("An invite with this email already exists!");
      } else if (errorMessage.includes('invite with this visitor email already exists')) {
        toast.error("An invite with this email already exists!");
      } else {
        // Try to parse JSON error response if it's embedded in the message
        try {
          const jsonMatch = errorMessage.match(/response: (\{.*\})/);
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[1]);
            if (errorData.visitor_email && errorData.visitor_email[0]) {
              toast.error("An invite with this email already exists!");
            } else {
              toast.error(errorMessage);
            }
          } else {
            toast.error(errorMessage);
          }
        } catch (parseError) {
          toast.error(errorMessage);
        }
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCallback]);

  // Handle update invite
  const handleUpdateInvite = useCallback(async (inviteId, formData) => {
    try {
      setLoading(true);
      
      await inviteeAPI.updateInvite(inviteId, formData);
      
      toast.success("Invitation updated successfully!");
      
      return true;
    } catch (err) {
      console.error("Error updating invitation:", err);
      toast.error(err.message || "Failed to update invitation");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCallback]);

  // Handle reinvite
  const handleReinvite = useCallback(async (inviteId, reinviteData) => {
    try {
      setLoading(true);
      
      console.log('🔄 Reinvite data being sent:', reinviteData);
      console.log('🔄 Reinvite ID:', inviteId);
      
      const response = await inviteeAPI.reinviteInvite(inviteId, reinviteData);
      
      toast.success(`Reinvitation sent successfully! New invite code: ${response.invite_code}`);
      
      return true;
    } catch (err) {
      console.error("Error sending reinvitation:", err);
      
      // Handle specific error cases for reinvite
      let errorMessage = err.message || "Failed to send reinvitation";
      
      if (errorMessage.includes('Invalid data format')) {
        toast.error("Invalid data format. Please check the form fields.");
      } else if (errorMessage.includes('expected JSON object')) {
        toast.error("Data format error. Please try again.");
      } else {
        toast.error(errorMessage);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCallback]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  // Check if an invite can be reinvited based on its status
  const canReinvite = useCallback((status) => {
    return ['expired', 'rejected', 'checked_out'].includes(status);
  }, []);

  return {
    loading,
    error,
    success,
    handleStatusUpdate,
    handleCheckIn,
    handleCheckOut,
    handleDeleteInvite,
    handleGenerateInvitePass,
    handleDownloadPass,
    handleSubmitInvite,
    handleUpdateInvite,
    handleReinvite,
    canReinvite,
    clearMessages,
    setError,
    setSuccess,
  };
};

export default useInviteActions;
