import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import inviteeAPI from "../../api/invite.js";

const useInviteActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle status update
  const handleStatusUpdate = useCallback(async (inviteId, newStatus) => {
    try {
      setLoading(true);
      await inviteeAPI.updateInviteStatus(inviteId, newStatus);
      toast.success(`Status updated to ${newStatus} successfully!`);
      return true;
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, []);

  // Handle generate invite pass
  const handleGenerateInvitePass = useCallback(async (invite) => {
    try {
      setLoading(true);
      
      // Update the invite status to checked_in and mark pass as generated
      await inviteeAPI.updateInviteStatus(invite.id, "checked_in");
      
      toast.success("Pass generated successfully!");
      return true;
    } catch (err) {
      console.error("Error generating pass:", err);
      toast.error(err.message || "Failed to generate pass");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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
      toast.error(err.message || "Failed to send invitation");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, []);

  // Handle reinvite
  const handleReinvite = useCallback(async (inviteId, reinviteData) => {
    try {
      setLoading(true);
      
      const response = await inviteeAPI.reinviteInvite(inviteId, reinviteData);
      
      toast.success(`Reinvitation sent successfully! New invite code: ${response.invite_code}`);
      
      return true;
    } catch (err) {
      console.error("Error sending reinvitation:", err);
      toast.error(err.message || "Failed to send reinvitation");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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
