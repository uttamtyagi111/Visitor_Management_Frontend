import React, { useCallback, useEffect } from "react";
import { visitorAPI } from "../../../api/visitor";
import { useToast } from "../../../contexts/ToastContext";

// Visitor actions and API operations component
export const useVisitorActions = ({
  visitors,
  setVisitors,
  selectedVisitor,
  setSelectedVisitor,
  setUpdating,
  setError,
  fetchVisitors,
  user,
  setIsEditing,
  setEditingVisitor,
  setEditForm,
  setEditFormErrors,
}) => {
  const { toast } = useToast();
  // Fetch visitor details when selected visitor changes
  useEffect(() => {
    const fetchVisitorDetails = async () => {
      if (selectedVisitor?.id) {
        try {
          setUpdating(true);
          const response = await visitorAPI.getVisitor(selectedVisitor.id);

          // Update the selected visitor with fresh data
          setSelectedVisitor((prev) => ({ ...prev, ...response }));

          // Also update the visitor in the visitors list
          setVisitors((prevVisitors) =>
            prevVisitors.map((v) =>
              v.id === selectedVisitor.id ? { ...v, ...response } : v
            )
          );
        } catch (error) {
          console.error("Error fetching visitor details:", error);
          // Optionally show an error toast here
        } finally {
          setUpdating(false);
        }
      }
    };

    fetchVisitorDetails();
  }, [selectedVisitor?.id, setUpdating, setSelectedVisitor, setVisitors]); // Only re-run if selectedVisitor.id changes

  const handleStatusUpdate = useCallback(
    async (visitorId, newStatus) => {
      try {
        setUpdating(true);

        // 1️⃣ Get current visitor
        const existingVisitor = visitors.find((v) => v.id === visitorId);
        const now = new Date().toISOString();

        // 2️⃣ Prepare updated visitor data for updateVisitor API (without status)
        const updateData = {
          ...existingVisitor, // preserve existing fields
          host:
            existingVisitor?.host ||
            existingVisitor?.hostName ||
            user?.name ||
            "System",
          hostName:
            existingVisitor?.hostName ||
            existingVisitor?.host ||
            user?.name ||
            "System",
        };

        if (newStatus === "checked_in") {
          updateData.checkInTime = now;
          updateData.checkedInAt = now;
          updateData.checkedInBy = user?.name || "System";
          delete updateData.checkOutTime;
          delete updateData.checkedOutAt;
          delete updateData.checkedOutBy;
        } else if (newStatus === "checked_out") {
          updateData.checkOutTime = now;
          updateData.checkedOutAt = now;
          updateData.checkedOutBy = user?.name || "System";
          // Ensure check-in data exists
          if (!updateData.checkInTime && !updateData.checkedInAt) {
            updateData.checkInTime = now;
            updateData.checkedInAt = now;
            updateData.checkedInBy = user?.name || "System";
          }
        }

        // 3️⃣ Optimistic update in frontend state (include status for UI)
        const uiUpdateData = { ...updateData, status: newStatus };
        setVisitors((prev) =>
          prev.map((v) =>
            v.id === visitorId ? { ...v, ...uiUpdateData, updated_at: now } : v
          )
        );
        if (selectedVisitor?.id === visitorId) {
          setSelectedVisitor((prev) => ({
            ...prev,
            ...uiUpdateData,
            updated_at: now,
          }));
        }

        // 4️⃣ Call updateVisitor API to save host/check-in/out info (no status included)
        const visitorPayload = {
          ...updateData,
          issued_by: user?.id || "System",
        };
        await visitorAPI.updateVisitor(visitorId, visitorPayload);
        
        // 5️⃣ Call updateVisitorStatus API to update status and trigger email
        await visitorAPI.updateVisitorStatus(visitorId, newStatus);
        
        // Show success message based on status
        const statusMessages = {
          revisit: "Visitor marked for revisit",
          pending: "Visitor check-in is pending",
          approved: "Visitor approved successfully",
          rejected: "Visitor rejected successfully", 
          checked_in: "Visitor checked in successfully",
          checked_out: "Visitor checked out successfully"
        };
        toast.success(statusMessages[newStatus] || `Visitor status updated to ${newStatus}`);
      } catch (err) {
        console.error("Error updating visitor status:", err);
        toast.error(err.message || "Failed to update visitor status");
        // rollback frontend state
        fetchVisitors();
      } finally {
        setUpdating(false);
      }
    },
    [visitors, selectedVisitor, user?.name, fetchVisitors, setVisitors, setSelectedVisitor, setUpdating, setError]
  );

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEditForm = (formData) => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate phone if provided - must be exactly 10 digits
    if (formData.phone) {
      if (formData.phone.length !== 10) {
        errors.phone = 'Phone number must be exactly 10 digits';
      } else if (!/^\d{10}$/.test(formData.phone)) {
        errors.phone = 'Phone number must contain only digits';
      }
    }
    
    if (!formData.purpose?.trim()) {
      errors.purpose = 'Purpose is required';
    }
    
    return errors;
  };

  // Handle phone number input - only allow exactly 10 digits
  const handlePhoneInput = (value, setEditForm, setEditFormErrors) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits maximum
    if (digitsOnly.length <= 10) {
      setEditForm(prev => ({
        ...prev,
        phone: digitsOnly
      }));
      
      // Clear phone error if user is typing
      setEditFormErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  // Handle email input with validation
  const handleEmailInput = (value, setEditForm, setEditFormErrors) => {
    setEditForm(prev => ({
      ...prev,
      email: value
    }));

    // Clear previous email error
    setEditFormErrors(prev => ({
      ...prev,
      email: ''
    }));

    // Validate email if not empty
    if (value && !validateEmail(value)) {
      setEditFormErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
    }
  };

  // Handle name input
  const handleNameInput = (value, setEditForm, setEditFormErrors) => {
    setEditForm(prev => ({
      ...prev,
      name: value
    }));

    // Clear name error if user starts typing
    setEditFormErrors(prev => ({
      ...prev,
      name: ''
    }));
  };

  // Handle purpose input
  const handlePurposeInput = (value, setEditForm, setEditFormErrors) => {
    setEditForm(prev => ({
      ...prev,
      purpose: value
    }));

    // Clear purpose error if user starts typing
    setEditFormErrors(prev => ({
      ...prev,
      purpose: ''
    }));
  };

  // Edit functionality
  const handleEditVisitor = (visitor) => {
    setEditingVisitor(visitor);
    setEditForm({
      name: visitor.name || "",
      email: visitor.email || "",
      phone: visitor.phone || "",
      // company: visitor.company || '',
      purpose: visitor.purpose || "",
      host: visitor.host || visitor.hostName || user?.name || ""
    });
    setEditFormErrors({});
    setIsEditing(true);
  };

  const handleSaveEdit = async (editingVisitor, editForm) => {
    // Validate form before submission
    const errors = validateEditForm(editForm);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      setUpdating(true);

      // Call API to update visitor
      const updatedVisitor = await visitorAPI.updateVisitor(
        editingVisitor.id,
        {
          ...editForm,
          hostName: editForm.host, // Ensure hostName is also updated
        }
      );

      // Update local state
      setVisitors((prevVisitors) =>
        prevVisitors.map((visitor) =>
          visitor.id === editingVisitor.id
            ? { ...visitor, ...editForm, hostName: editForm.host }
            : visitor
        )
      );

      // Update selected visitor if it's the same one
      if (selectedVisitor && selectedVisitor.id === editingVisitor.id) {
        setSelectedVisitor((prev) => ({ ...prev, ...editForm, hostName: editForm.host }));
      }

      // Show success message
      toast.success("Visitor information updated successfully");
      
      // Close edit mode
      setIsEditing(false);
      setEditingVisitor(null);
      setEditForm({});
    } catch (err) {
      console.error("Error updating visitor:", err);
      toast.error(err.message || "Failed to update visitor information");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingVisitor(null);
    setEditForm({});
    setEditFormErrors({});
  };

  const handleFormChange = (field, value, setEditForm) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const refreshData = () => {
    fetchVisitors();
  };

  return {
    handleStatusUpdate,
    handleEditVisitor,
    handleSaveEdit,
    handleCancelEdit,
    handleFormChange,
    refreshData,
    // Validation functions
    handlePhoneInput,
    handleEmailInput,
    handleNameInput,
    handlePurposeInput,
  };
};
