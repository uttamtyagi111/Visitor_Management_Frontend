import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  X,
  AlertCircle,
  Users,
} from "lucide-react";

// Import the API service
import inviteeAPI, { inviteeHelpers } from "../../api/invite.js";
// Import the modular components
import InviteModal from "../invite/InviteModal";
import ReinviteModal from "../invite/ReinviteModal";
import InviteFilters from "../invite/InviteFilters";
import InviteTable from "../invite/InviteTable";
import InviteMobileCards from "../invite/InviteMobileCards";
import InviteFormModal from "../invite/InviteFormModal";
import InviteViewEditModal from "../invite/InviteViewEditModal";
import PassPreviewModal from "../invite/PassPreviewModal";
import useInviteActions from "../invite/InviteActions";

function Invitees() {
  const { user } = useAuth();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [invites, setInvites] = useState([]);
  
  // Modal states
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [showPassPreview, setShowPassPreview] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  
  // View/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvite, setCurrentInvite] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Reinvite modal state
  const [showReinviteModal, setShowReinviteModal] = useState(false);
  const [reinviteTarget, setReinviteTarget] = useState(null);
  
  // Timeline data state
  const [timelineData, setTimelineData] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  
  // Form states
  const [inviteFormData, setInviteFormData] = useState({
    visitor_name: "",
    visitor_email: "",
    visitor_phone: "",
    invited_by: user?.name || user?.email || "",
    purpose: "",
    visit_time: "",
    expiry_time: "",
  });
  
  const [formData, setFormData] = useState({
    visitor_name: "",
    visitor_email: "",
    visitor_phone: "",
    purpose: "",
    visit_time: "",
    expiry_time: "",
    invited_by: "",
    status: "pending",
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [inviteFormErrors, setInviteFormErrors] = useState({});
  
  // Use the actions hook
  const {
    loading,
    error,
    success,
    handleStatusUpdate: actionHandleStatusUpdate,
    handleDeleteInvite: actionHandleDeleteInvite,
    handleGenerateInvitePass: actionHandleGenerateInvitePass,
    handleDownloadPass: actionHandleDownloadPass,
    handleSubmitInvite: actionHandleSubmitInvite,
    handleUpdateInvite: actionHandleUpdateInvite,
    handleReinvite: actionHandleReinvite,
    canReinvite,
    clearMessages,
    setError,
    setSuccess,
  } = useInviteActions();

  // Modal handlers
  const closeModal = () => {
    setIsModalOpen(false);
    setShowInviteCodeModal(false);
    setShowInviteForm(false);
    setCurrentInvite(null);
    setFormErrors({});
    setIsEditing(false);
    setTimelineData([]);
    setTimelineLoading(false);
    resetForm();
  };

  const closeReinviteModal = () => {
    setShowReinviteModal(false);
    setReinviteTarget(null);
    setReinviteError("");
  };

  // Fetch timeline data for an invite
  const fetchTimelineData = async (inviteId) => {
    try {
      setTimelineLoading(true);
      const timeline = await inviteeAPI.getInviteTimeline(inviteId);
      setTimelineData(timeline || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      setTimelineData([]);
    } finally {
      setTimelineLoading(false);
    }
  };
  
  const openInviteModal = async (invite) => {
    setCurrentInvite(invite);
    setFormData({
      visitor_name: invite.visitor_name || "",
      visitor_email: invite.visitor_email || "",
      visitor_phone: invite.visitor_phone || "",
      purpose: invite.purpose || "",
      visit_time: invite.visit_time ? invite.visit_time.slice(0, 16) : "",
      expiry_time: invite.expiry_time ? invite.expiry_time.slice(0, 16) : "",
      invited_by: invite.invited_by || "",
      status: invite.status || "pending",
    });
    setIsModalOpen(true);
    
    // Fetch timeline data for this invite
    if (invite.id) {
      await fetchTimelineData(invite.id);
    }
  };

  const openReinviteModal = (invite) => {
    setReinviteTarget(invite);
    setShowReinviteModal(true);
  };

  // Data fetching
  const refreshData = useCallback(async () => {
    try {
      const data = await inviteeAPI.getInvites();
      setInvites(data);
    } catch (err) {
      console.error("Error fetching invites:", err);
      toast.error("Failed to fetch invitations");
    }
  }, []);

  // Fetch invites on component mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Filter invites based on search and filters
  const filteredInvitees = invites.filter((invite) => {
    const matchesSearch = 
      invite.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invite.visitor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invite.purpose?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invite.status === statusFilter;

    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      
      const inviteDate = new Date(invite.visit_time);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case "today":
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          return inviteDate >= today && inviteDate <= todayEnd;
        case "week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          return inviteDate >= weekStart && inviteDate <= weekEnd;
        case "month":
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          return inviteDate >= monthStart && inviteDate <= monthEnd;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Status badge helper
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      checked_in: { bg: "bg-blue-100", text: "text-blue-800", label: "Checked In" },
      checked_out: { bg: "bg-gray-100", text: "text-gray-800", label: "Checked Out" },
      expired: { bg: "bg-orange-100", text: "text-orange-800", label: "Expired" },
      reinvited: { bg: "bg-purple-100", text: "text-purple-800", label: "Reinvited" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Form helpers
  const resetForm = () => {
    setInviteFormData({
      visitor_name: "",
      visitor_email: "",
      visitor_phone: "",
      invited_by: user?.name || user?.email || "",
      purpose: "",
      visit_time: "",
      expiry_time: "",
    });
    setInviteFormErrors({});
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getMinExpiryTime = () => {
    if (!inviteFormData.visit_time) return getCurrentDateTime();
    const visitTime = new Date(inviteFormData.visit_time);
    visitTime.setHours(visitTime.getHours() + 1);
    visitTime.setMinutes(visitTime.getMinutes() - visitTime.getTimezoneOffset());
    return visitTime.toISOString().slice(0, 16);
  };

  const getMinExpiryTimeEdit = () => {
    if (!formData.visit_time) return getCurrentDateTime();
    const visitTime = new Date(formData.visit_time);
    visitTime.setHours(visitTime.getHours() + 1);
    visitTime.setMinutes(visitTime.getMinutes() - visitTime.getTimezoneOffset());
    return visitTime.toISOString().slice(0, 16);
  };

  // Form validation and input handlers
  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone) => {
    if (phone && !/^\d{10}$/.test(phone)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const handleNameInputCreate = (e) => {
    const value = e.target.value;
    setInviteFormData({ ...inviteFormData, visitor_name: value });
    
    const error = validateName(value);
    setInviteFormErrors({ ...inviteFormErrors, visitor_name: error });
  };

  const handleEmailInputCreate = (e) => {
    const value = e.target.value;
    setInviteFormData({ ...inviteFormData, visitor_email: value });
    
    const error = validateEmail(value);
    setInviteFormErrors({ ...inviteFormErrors, visitor_email: error });
  };

  const handlePhoneInput = (e, mode) => {
    const value = e.target.value.replace(/\D/g, "");
    
    if (mode === 'create') {
      setInviteFormData({ ...inviteFormData, visitor_phone: value });
      const error = validatePhone(value);
      setInviteFormErrors({ ...inviteFormErrors, visitor_phone: error });
    } else {
      setFormData({ ...formData, visitor_phone: value });
      const error = validatePhone(value);
      setFormErrors({ ...formErrors, visitor_phone: error });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific field errors
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  // Action handlers that integrate with the hook
  const handleStatusUpdate = async (inviteId, newStatus) => {
    const success = await actionHandleStatusUpdate(inviteId, newStatus);
    if (success) {
      await refreshData();
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    const success = await actionHandleDeleteInvite(inviteId);
    if (success) {
      await refreshData();
    }
  };

  const handleGenerateInvitePass = async (invite) => {
    const success = await actionHandleGenerateInvitePass(invite);
    if (success) {
      await refreshData();
    }
  };

  const handleDownloadPass = (invite) => {
    actionHandleDownloadPass(invite);
  };

  const handleSubmitInvite = async (e) => {
    e.preventDefault();
    
    // Validate form
    const nameError = validateName(inviteFormData.visitor_name);
    const emailError = validateEmail(inviteFormData.visitor_email);
    const phoneError = validatePhone(inviteFormData.visitor_phone);
    const purposeError = !inviteFormData.purpose.trim() ? "Purpose is required" : "";
    
    if (nameError || emailError || phoneError || purposeError) {
      setInviteFormErrors({
        visitor_name: nameError,
        visitor_email: emailError,
        visitor_phone: phoneError,
        purpose: purposeError,
      });
      return;
    }

    const success = await actionHandleSubmitInvite(inviteFormData, resetForm);
    if (success) {
      setShowInviteForm(false);
      await refreshData();
    }
  };

  const handleUpdateInvite = async (e) => {
    e.preventDefault();
    
    const success = await actionHandleUpdateInvite(currentInvite.id, formData);
    if (success) {
      setIsEditing(false);
      await refreshData();
      await openInviteModal({ ...currentInvite, ...formData });
    }
  };

  const handleReinvite = async (reinviteData) => {
    const success = await actionHandleReinvite(reinviteTarget.id, reinviteData);
    if (success) {
      closeReinviteModal();
      await refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2 sm:p-4 lg:p-6 xl:p-8 portrait:p-2 portrait:sm:p-3 landscape:p-3 landscape:lg:p-4 landscape:xl:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-full xl:max-w-8xl 2xl:max-w-9xl mx-auto space-y-4 sm:space-y-6 portrait:space-y-3 landscape:space-y-2 landscape:lg:space-y-4"
      >
        {/* Filters Component */}
        <InviteFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          loading={loading}
          refreshData={refreshData}
          setShowInviteForm={setShowInviteForm}
          setShowInviteCodeModal={setShowInviteCodeModal}
        />

        {/* Invitees Table/Cards - Orientation Responsive Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl portrait:rounded-lg landscape:rounded-xl shadow-lg sm:shadow-xl portrait:shadow-md landscape:shadow-lg border border-white/50 overflow-hidden"
        >
          {/* Desktop Table View */}
          <InviteTable
            filteredInvitees={filteredInvitees}
            loading={loading}
            getStatusBadge={getStatusBadge}
            handleStatusUpdate={handleStatusUpdate}
            handleGenerateInvitePass={handleGenerateInvitePass}
            canReinvite={canReinvite}
            openReinviteModal={openReinviteModal}
            handleDeleteInvite={handleDeleteInvite}
            openInviteModal={openInviteModal}
          />

          {/* Mobile Cards View */}
          <InviteMobileCards
            filteredInvitees={filteredInvitees}
            loading={loading}
            invites={invites}
            getStatusBadge={getStatusBadge}
            handleStatusUpdate={handleStatusUpdate}
            handleGenerateInvitePass={handleGenerateInvitePass}
            handleDownloadPass={handleDownloadPass}
            canReinvite={canReinvite}
            openReinviteModal={openReinviteModal}
            openInviteModal={openInviteModal}
            handleDeleteInvite={handleDeleteInvite}
          />
        </motion.div>
      </motion.div>

      {/* Modals */}
      <InviteFormModal
        showInviteForm={showInviteForm}
        setShowInviteForm={setShowInviteForm}
        error={error}
        handleSubmitInvite={handleSubmitInvite}
        inviteFormData={inviteFormData}
        handleNameInputCreate={handleNameInputCreate}
        handleEmailInputCreate={handleEmailInputCreate}
        handlePhoneInput={handlePhoneInput}
        setInviteFormData={setInviteFormData}
        inviteFormErrors={inviteFormErrors}
        setInviteFormErrors={setInviteFormErrors}
        user={user}
        getCurrentDateTime={getCurrentDateTime}
        getMinExpiryTime={getMinExpiryTime}
        loading={loading}
      />

      <InviteViewEditModal
        isModalOpen={isModalOpen}
        currentInvite={currentInvite}
        closeModal={closeModal}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        getStatusBadge={getStatusBadge}
        timelineLoading={timelineLoading}
        timelineData={timelineData}
        error={error}
        handleUpdateInvite={handleUpdateInvite}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        handleEditInputChange={handleEditInputChange}
        handlePhoneInput={handlePhoneInput}
        getCurrentDateTime={getCurrentDateTime}
        getMinExpiryTimeEdit={getMinExpiryTimeEdit}
        loading={loading}
      />

      <PassPreviewModal
        showPassPreview={showPassPreview}
        setShowPassPreview={setShowPassPreview}
        selectedInvite={selectedInvite}
        handleDownloadPass={handleDownloadPass}
      />

      {/* Existing Modals */}
      <InviteModal
        isOpen={showInviteCodeModal}
        onClose={closeModal}
        isAdmin={true}
      />

      <ReinviteModal
        isOpen={showReinviteModal}
        onClose={closeReinviteModal}
        invite={reinviteTarget}
        onReinvite={handleReinvite}
        loading={loading}
      />

      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default Invitees;
