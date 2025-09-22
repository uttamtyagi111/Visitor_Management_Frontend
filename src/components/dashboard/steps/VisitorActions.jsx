import React, { useCallback, useEffect } from "react";
import { visitorAPI } from "../../../api/visitor";

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

        // 2️⃣ Prepare updated visitor data for updateVisitor API
        const updateData = {
          ...existingVisitor, // preserve existing fields
          status: newStatus,
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

        // 3️⃣ Optimistic update in frontend state
        setVisitors((prev) =>
          prev.map((v) =>
            v.id === visitorId ? { ...v, ...updateData, updated_at: now } : v
          )
        );
        if (selectedVisitor?.id === visitorId) {
          setSelectedVisitor((prev) => ({
            ...prev,
            ...updateData,
            updated_at: now,
          }));
        }

        // 4️⃣ Call updateVisitor API to save host/check-in/out info
        const visitorPayload = {
          ...updateData,
          issued_by: user?.id || "System",
        };
        await visitorAPI.updateVisitor(visitorId, visitorPayload);
        // 5️⃣ Call updateVisitorStatus API to update status and trigger email
        await visitorAPI.updateVisitorStatus(visitorId, newStatus);
        // const updatedVisitor = await visitorAPI.getVisitor(visitorId);
        // setSelectedVisitor(updatedVisitor);
        // setVisitors(prev => prev.map(v => v.id === visitorId ? updatedVisitor : v));
      } catch (err) {
        console.error("Error updating visitor status:", err);
        setError(err.message);
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
      // host: visitor.host || ''
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
        editForm
      );

      // Update local state
      setVisitors((prevVisitors) =>
        prevVisitors.map((visitor) =>
          visitor.id === editingVisitor.id
            ? { ...visitor, ...editForm }
            : visitor
        )
      );

      // Update selected visitor if it's the same one
      if (selectedVisitor && selectedVisitor.id === editingVisitor.id) {
        setSelectedVisitor((prev) => ({ ...prev, ...editForm }));
      }

      // Close edit mode
      setIsEditing(false);
      setEditingVisitor(null);
      setEditForm({});
    } catch (err) {
      console.error("Error updating visitor:", err);
      setError(err.message);
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
