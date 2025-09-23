import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Plus,
  Mail,
  Phone,
  Building,
  User,
  X,
  Send,
  Edit,
  Trash2,
  Users,
  QrCode,
  Camera,
  Download,
  Check,
  ChevronRight,
  Upload,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  RefreshCw,
  Eye,
  User as UserIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Hash,
  Info,
  XCircle,
  CheckCircle,
  Clock as ClockIcon2,
  UserCheck,
  UserX,
  ExternalLink,
  Copy,
  Share2,
  Printer,
  Mail as MailIcon,
  Smartphone,
  MapPin,
  Home,
  Briefcase,
  Tag,
  FileText,
  Hash as HashIcon,
  CheckCircle2,
  XCircle as XCircleIcon,
  Clock as ClockIcon3,
  Calendar as CalendarIcon2,
  User as UserIcon2,
  Mail as MailIcon2,
  Phone as PhoneIcon,
  Building as BuildingIcon,
  MapPin as MapPinIcon,
  Clock as ClockIcon4,
  Calendar as CalendarIcon3,
  File as FileIcon,
  User as UserIcon3,
  Mail as MailIcon3,
  Phone as PhoneIcon2,
  Building as BuildingIcon2,
  MapPin as MapPinIcon2,
  Clock as ClockIcon5,
  Calendar as CalendarIcon4,
  File as FileIcon2,
  User as UserIcon4,
  Mail as MailIcon4,
  Phone as PhoneIcon3,
  Building as BuildingIcon3,
  MapPin as MapPinIcon3,
  Clock as ClockIcon6,
  Calendar as CalendarIcon5,
  File as FileIcon3,
} from "lucide-react";

// Import the API service
import inviteeAPI, { inviteeHelpers } from "../../api/invite.js";
// Import the invite modal component
import InviteModal from "../invite/InviteModal";

function Invitees() {
  const { user } = useAuth(); // Get logged-in user information
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [dateFilter, setDateFilter] = useState("today");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invites, setInvites] = useState([]);

  const [inviteFormData, setInviteFormData] = useState({
    visitor_name: "",
    visitor_email: "",
    visitor_phone: "",
    invited_by: user?.name || user?.email || "",
    purpose: "",
    visit_time: "",
    expiry_time: "",
  });

  const [selectedInvite, setSelectedInvite] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showPassPreview, setShowPassPreview] = useState(false);

  // View/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvite, setCurrentInvite] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
  
  const closeModal = () => {
    setIsModalOpen(false);
    setShowInviteCodeModal(false);
    setShowInviteForm(false);
    setCurrentInvite(null);
    setFormErrors({});
    setIsEditing(false);
    resetForm();
  };
  
  const openInviteModal = (invite) => {
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
    setFormErrors({});
    setIsModalOpen(true);
    setIsEditing(false);
  };


  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.visitor_name.trim()) errors.visitor_name = "Name is required";
    if (!formData.visitor_email.trim()) {
      errors.visitor_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.visitor_email)) {
      errors.visitor_email = "Please enter a valid email";
    }
    
    // Validate phone if provided - must be exactly 10 digits
    if (formData.visitor_phone) {
      if (formData.visitor_phone.length !== 10) {
        errors.visitor_phone = "Phone number must be exactly 10 digits";
      } else if (!/^\d{10}$/.test(formData.visitor_phone)) {
        errors.visitor_phone = "Phone number must contain only digits";
      }
    }
    
    if (!formData.purpose.trim()) errors.purpose = "Purpose is required";
    if (!formData.visit_time) errors.visit_time = "Visit time is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateInvite = async (e) => {
    e.preventDefault();
    if (!currentInvite) return;

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Prepare the data to send
      const updateData = {
        ...formData,
        visitor_phone: formData.visitor_phone || null,
        expiry_time: formData.expiry_time || null,
      };

      await inviteeAPI.updateInvite(currentInvite.id, updateData);

      setSuccess("Invitation updated successfully");
      setTimeout(() => setSuccess(""), 3000);
      closeModal();
      loadInvites();
    } catch (error) {
      console.error("Error updating invite:", error);
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Load invites on component mount
  useEffect(() => {
    loadInvites();
  }, []);

  const refreshData = () => {
    loadInvites();
  };

  const loadInvites = async () => {
    try {
      setLoading(true);
      const data = await inviteeAPI.getInvites();
      setInvites(data);
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredInvitees = invites.filter((invite) => {
    const matchesSearch =
      invite.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invite.visitor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invite.purpose?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invite.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Validate create form
  const validateCreateForm = () => {
    const errors = {};
    
    if (!inviteFormData.visitor_name.trim()) {
      errors.visitor_name = 'Name is required';
    }
    
    if (!inviteFormData.visitor_email.trim()) {
      errors.visitor_email = 'Email is required';
    } else if (!validateEmail(inviteFormData.visitor_email)) {
      errors.visitor_email = 'Please enter a valid email address';
    }
    
    if (!inviteFormData.purpose.trim()) {
      errors.purpose = 'Purpose is required';
    }
    
    // Validate phone if provided - must be exactly 10 digits
    if (inviteFormData.visitor_phone) {
      if (inviteFormData.visitor_phone.length !== 10) {
        errors.visitor_phone = 'Phone number must be exactly 10 digits';
      } else if (!/^\d{10}$/.test(inviteFormData.visitor_phone)) {
        errors.visitor_phone = 'Phone number must contain only digits';
      }
    }
    
    setInviteFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitInvite = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateCreateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");

    try {

      // Ensure invited_by is set to logged-in user
      const inviteData = {
        ...inviteFormData,
        invited_by: user?.name || user?.email || inviteFormData.invited_by
      };
      
      const response = await inviteeAPI.createInvite(inviteData);

      // Backend returns the invite data with generated invite_code
      if (response && response.invite_code) {
        // Generate email template using backend invite code
        const emailTemplate =
          inviteeHelpers.generateInviteEmailTemplate(response);
        console.log("Email template generated:", emailTemplate);
        // You can use this emailTemplate to send emails via your backend
      }

      setSuccess(
        `Invitation sent successfully! Invite code: ${
          response.invite_code || "Generated"
        }`
      );
      setTimeout(() => {}, 3000);
      setShowInviteForm(false);
      resetForm();
      loadInvites(); // Reload the list
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvite = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invitation?")) {
      return;
    }

    try {
      setLoading(true);
      await inviteeAPI.deleteInvite(id);
      setSuccess("Invitation deleted successfully");
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      loadInvites();
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setLoading(true);
      await inviteeAPI.updateInviteStatus(id, newStatus);
      setSuccess("Status updated successfully");
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      loadInvites();
    } catch (error) {
      setError(inviteeHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

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
    setError("");
    setSuccess("");
    setInviteFormErrors({});
  };


  const handleGenerateInvitePass = useCallback(
    async (invite) => {
      try {
        setLoading(true);

        // Find the invite using invite code
        const targetInvite = invites.find(
          (i) => i.invite_code === invite.invite_code
        );
        if (!targetInvite) {
          throw new Error("Invite not found");
        }

        // Set the invite and show preview
        setSelectedInvite(targetInvite);
        setShowPassPreview(true);

        // Update invite to show pass generated
        setInvites((prevInvites) =>
          prevInvites.map((i) =>
            i.invite_code === invite.invite_code
              ? { ...i, pass_generated: true, status: "checked_in" }
              : i
          )
        );

        // Update API
        await inviteeAPI.updateInviteStatus(targetInvite.id, "checked_in");

        setSuccess("Pass generated successfully!");
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } catch (err) {
        console.error("Error generating pass:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [invites]
  );

  const handleDownloadPass = useCallback((invite) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 600);
    gradient.addColorStop(0, "#3B82F6");
    gradient.addColorStop(1, "#8B5CF6");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);

    // Add company header
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("VISITOR PASS", 200, 50);

    ctx.font = "16px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("Wish Geeks Techserve", 200, 80);

    const drawPass = (img = null) => {
      // Clear and redraw background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 600);

      // Redraw header text
      ctx.fillStyle = "white";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("INVITE PASS", 200, 50);

      ctx.font = "16px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Wish Geeks Techserve", 200, 80);

      // Draw visitor image if available
      if (img) {
        // Create a circular mask for the image
        ctx.save();
        ctx.beginPath();
        ctx.arc(200, 170, 50, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the image
        ctx.drawImage(img, 150, 120, 100, 100);
        ctx.restore();

        // Add white border
        ctx.beginPath();
        ctx.arc(200, 170, 50, 0, Math.PI * 2);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.stroke();
      } else {
        // Fallback to placeholder if no image
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(200, 170, 50, 0, Math.PI * 2);
        ctx.fill();

        // Add initial letter
        const initials = (invite.visitor_name || "V").charAt(0).toUpperCase();
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(initials, 200, 170);
      }

      // Add visitor details
      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(invite.visitor_name, 200, 260);

      ctx.font = "14px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(invite.visitor_email, 200, 285);

      // Add visit details
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Visit Time:", 50, 340);
      ctx.fillStyle = "white";
      ctx.fillText(inviteeHelpers.formatDateTime(invite.visit_time), 150, 340);

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Purpose:", 50, 370);
      ctx.fillStyle = "white";
      ctx.fillText(invite.purpose || "General Visit", 150, 370);

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Invite Code:", 50, 400);
      ctx.fillStyle = "white";
      ctx.fillText(invite.invite_code, 150, 400);

      // Add footer
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "12px Arial";
      ctx.fillText(
        "Please wear this pass at all times during your visit",
        200,
        520
      );
      ctx.fillText(
        "Generated on: " + new Date().toLocaleDateString(),
        200,
        540
      );

      // Download the pass
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `visitor-pass-${invite.visitor_name}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    // Try to load the visitor's image using fetch API
    const loadImageWithFetch = async (url) => {
      try {
        console.log("Attempting to fetch image:", url);
        const response = await fetch(url, {
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
          console.log("Image loaded successfully via fetch");
          drawPass(img);
          // Clean up the object URL after the image is loaded
          URL.revokeObjectURL(imageUrl);
        };

        img.onerror = (e) => {
          console.error("Error creating image from blob:", e);
          drawPass();
          URL.revokeObjectURL(imageUrl);
        };

        img.src = imageUrl;
      } catch (error) {
        console.error("Error loading image with fetch:", error);
        // Fallback to regular image loading if fetch fails
        loadImageDirectly(url);
      }
    };

    // Fallback method using regular image loading
    const loadImageDirectly = (url) => {
      console.log("Trying direct image load for:", url);
      const img = new Image();

      img.onload = () => {
        console.log("Image loaded successfully with direct method");
        drawPass(img);
      };

      img.onerror = (e) => {
        console.error("Direct image load failed:", e);
        drawPass();
      };

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const urlWithTimestamp = url.includes("?")
        ? `${url}&t=${timestamp}`
        : `${url}?t=${timestamp}`;

      img.crossOrigin = "anonymous";
      img.src = urlWithTimestamp;
    };

    // Get the image URL and start loading
    const imageUrl = invite.image;
    console.log("Image URL:", imageUrl);

    if (imageUrl) {
      // First try with fetch API, fallback to direct loading
      loadImageWithFetch(imageUrl);
    } else {
      console.log("No image URL available for visitor");
      // No image URL, draw without it
      drawPass();
    }
  }, []);

  const getStatusBadge = (status) => {
    const colorClass = inviteeHelpers.getStatusColor(status);
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Helper functions
  const formatDateTimeLocal = (datetimeString) => {
    if (!datetimeString) return "";
    const date = new Date(datetimeString);
    // Return in YYYY-MM-DDTHH:mm format
    return date.toISOString().slice(0, 16);
  };

  // Get current date and time in YYYY-MM-DDTHH:mm format
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  // Get minimum expiry time (current visit time or current time if no visit time)
  const getMinExpiryTime = () => {
    if (inviteFormData.visit_time) {
      return inviteFormData.visit_time;
    }
    return getCurrentDateTime();
  };

  // Get minimum expiry time for edit form
  const getMinExpiryTimeEdit = () => {
    if (formData.visit_time) {
      return formData.visit_time;
    }
    return getCurrentDateTime();
  };

  // Handle phone number input - only allow exactly 10 digits
  const handlePhoneInput = (e, formType = 'create') => {
    const value = e.target.value;
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits maximum
    if (digitsOnly.length <= 10) {
      if (formType === 'create') {
        setInviteFormData({
          ...inviteFormData,
          visitor_phone: digitsOnly,
        });
        // Clear phone error if user is typing
        if (inviteFormErrors.visitor_phone) {
          setInviteFormErrors({...inviteFormErrors, visitor_phone: ''});
        }
      } else {
        setFormData(prev => ({
          ...prev,
          visitor_phone: digitsOnly
        }));
        // Clear phone error if user is typing
        if (formErrors.visitor_phone) {
          setFormErrors({...formErrors, visitor_phone: ''});
        }
      }
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input with validation for create form
  const handleEmailInputCreate = (e) => {
    const value = e.target.value;
    setInviteFormData({
      ...inviteFormData,
      visitor_email: value,
    });

    // Clear previous email error
    if (inviteFormErrors.visitor_email) {
      setInviteFormErrors({
        ...inviteFormErrors,
        visitor_email: ''
      });
    }

    // Validate email if not empty
    if (value && !validateEmail(value)) {
      setInviteFormErrors({
        ...inviteFormErrors,
        visitor_email: 'Please enter a valid email address'
      });
    }
  };

  // Handle name input for create form
  const handleNameInputCreate = (e) => {
    const value = e.target.value;
    setInviteFormData({
      ...inviteFormData,
      visitor_name: value,
    });

    // Clear name error if user starts typing
    if (inviteFormErrors.visitor_name) {
      setInviteFormErrors({...inviteFormErrors, visitor_name: ''});
    }
  };

  // handleUpdateInvite function is already defined above

  return (
    <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invite Management
            </h1>
            <p className="text-gray-600 text-base">
              Send invitations and manage upcoming visits
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white/70 border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowInviteCodeModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <QrCode className="w-5 h-5" />
              <span>Invite Code</span>
            </button>
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Send Invitation</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="ml-auto p-1 hover:bg-green-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto p-1 hover:bg-red-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-white/50 mb-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search invitees..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="all">All Status</option>
                {inviteeHelpers.statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Invitees Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* Desktop and Tablet Table View */}
          <div className="hidden md:block overflow-auto max-h-[600px]">
            <table className="w-full table-auto">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Invitee
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Invite_code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Visit Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredInvitees.map((invite, index) => (
                    <motion.tr
                      key={invite.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="hover:bg-white/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 relative">
                            {invite.image ? (
                              <img
                                src={invite.image}
                                alt={invite.visitor_name || "Visitor"}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  const fallback =
                                    e.target.parentElement.querySelector(
                                      ".fallback-avatar"
                                    );
                                  if (fallback) fallback.style.display = "flex";
                                }}
                                onLoad={(e) => {
                                  const fallback =
                                    e.target.parentElement.querySelector(
                                      ".fallback-avatar"
                                    );
                                  if (fallback) fallback.style.display = "none";
                                }}
                              />
                            ) : null}
                            <div
                              className={`fallback-avatar w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm absolute top-0 left-0 ${
                                invite.image ? "hidden" : "flex"
                              }`}
                            >
                              {(invite.visitor_name || "V")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {invite.visitor_name}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {invite.visitor_email}
                            </p>
                            {invite.visitor_phone && (
                              <p className="text-gray-500 text-xs">
                                {invite.visitor_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {invite.invited_by}
                          </p>
                          {invite.created_at && (
                            <p className="text-gray-600 text-sm">
                              {inviteeHelpers.formatDateTime(invite.created_at)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {invite.invite_code || "N/A"}
                          </p>
                          {(invite.status === "checked_in" ||
                            invite.pass_generated) && (
                            <div className="group relative">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                                {invite.status === "checked_in"
                                  ? "Checked In"
                                  : "Pass Generated"}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {invite.purpose}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {inviteeHelpers.formatDateTime(invite.visit_time)}
                        </p>
                        {invite.expiry_time && (
                          <p className="text-gray-600 text-sm">
                            Expires:{" "}
                            {inviteeHelpers.formatDateTime(invite.expiry_time)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invite.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <select
                            value={invite.status}
                            onChange={(e) =>
                              handleStatusUpdate(invite.id, e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white min-w-[100px]"
                            disabled={loading}
                          >
                            {inviteeHelpers.statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          {/* Approve/Reject buttons for pending status */}
                          {invite.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(invite.id, "approved")
                                }
                                disabled={loading}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                                title="Approve"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(invite.id, "rejected")
                                }
                                disabled={loading}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                                title="Reject"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Pass generation button for approved invites */}
                          {invite.status === "approved" &&
                            !invite.pass_generated && (
                              <button
                                onClick={() => handleGenerateInvitePass(invite)}
                                disabled={loading}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50"
                              >
                                Generate Pass
                              </button>
                            )}

                          {/* Check mark for pass generated */}
                          {invite.pass_generated && (
                            <div className="group relative">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                                Pass Generated
                              </span>
                            </div>
                          )}

                          {/* Check In/Out buttons */}
                          {/* {invite.status === 'approved' && !invite.pass_generated && (
                            <button
                              onClick={() => handleStatusUpdate(invite.id, 'checked_in')}
                              disabled={loading}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              Check In
                            </button>
                          )} */}
                          {invite.status === "checked_in" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(invite.id, "checked_out")
                              }
                              disabled={loading}
                              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              Check Out
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteInvite(invite.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openInviteModal(invite);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            <AnimatePresence>
              {filteredInvitees.map((invite, index) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 relative">
                      {invite.image ? (
                        <img
                          src={invite.image}
                          alt={invite.visitor_name || "Visitor"}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback =
                              e.target.parentElement.querySelector(
                                ".fallback-avatar"
                              );
                            if (fallback) fallback.style.display = "flex";
                          }}
                          onLoad={(e) => {
                            const fallback =
                              e.target.parentElement.querySelector(
                                ".fallback-avatar"
                              );
                            if (fallback) fallback.style.display = "none";
                          }}
                        />
                      ) : null}
                      <div
                        className={`fallback-avatar w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg absolute top-0 left-0 ${
                          invite.image ? "hidden" : "flex"
                        }`}
                      >
                        {(invite.visitor_name || "V").charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {invite.visitor_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {invite.visitor_email}
                      </p>
                      {invite.visitor_phone && (
                        <p className="text-sm text-gray-500">
                          {invite.visitor_phone}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {getStatusBadge(invite.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Host:</span>
                      <span className="text-gray-900 font-medium">
                        {invite.invited_by}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Invite Code:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-medium font-mono text-xs">
                          {invite.invite_code || "N/A"}
                        </span>
                        {(invite.status === "checked_in" ||
                          invite.pass_generated) && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Purpose:</span>
                      <span className="text-gray-900 font-medium text-right">
                        {invite.purpose}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Visit Time:</span>
                      <span className="text-gray-900 font-medium text-right">
                        {inviteeHelpers.formatDateTime(invite.visit_time)}
                      </span>
                    </div>
                    {invite.expiry_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expires:</span>
                        <span className="text-gray-900 font-medium text-right">
                          {inviteeHelpers.formatDateTime(invite.expiry_time)}
                        </span>
                      </div>
                    )}
                    {invite.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900 font-medium text-right">
                          {inviteeHelpers.formatDateTime(invite.created_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <select
                      value={invite.status}
                      onChange={(e) =>
                        handleStatusUpdate(invite.id, e.target.value)
                      }
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                      disabled={loading}
                    >
                      {inviteeHelpers.statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Approve/Reject buttons for pending invites */}
                    {invite.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(invite.id, "approved")
                          }
                          disabled={loading}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                          title="Approve"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(invite.id, "rejected")
                          }
                          disabled={loading}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                          title="Reject"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Pass generation button for approved invites */}
                    {invite.status === "approved" && !invite.pass_generated && (
                      <button
                        onClick={() => handleGenerateInvitePass(invite)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50"
                      >
                        Generate Pass
                      </button>
                    )}

                    {/* Download pass button for generated passes */}
                    {invite.pass_generated && (
                      <button
                        onClick={() => handleDownloadPass(invite.id, "image")}
                        disabled={loading}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm disabled:opacity-50"
                      >
                        Download Pass
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteInvite(invite.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredInvitees.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">
                No invitees found matching your criteria
              </p>
            </div>
          )}

          {loading && invites.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invitations...</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Regular Invite Form Modal */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Send Invitation
                </h3>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmitInvite} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={inviteFormData.visitor_name}
                        onChange={handleNameInputCreate}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                          inviteFormErrors.visitor_name ? 'border-red-500' : 'border-gray-200'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    {inviteFormErrors.visitor_name && (
                      <p className="mt-1 text-sm text-red-600">{inviteFormErrors.visitor_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={inviteFormData.visitor_email}
                        onChange={handleEmailInputCreate}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                          inviteFormErrors.visitor_email ? 'border-red-500' : 'border-gray-200'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    {inviteFormErrors.visitor_email && (
                      <p className="mt-1 text-sm text-red-600">{inviteFormErrors.visitor_email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invited By *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={user?.name || user?.email || ""}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-600"
                        placeholder="Auto-filled with logged-in user"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={inviteFormData.visitor_phone}
                        onChange={(e) => handlePhoneInput(e, 'create')}
                        onKeyPress={(e) => {
                          // Prevent non-numeric characters on keypress
                          const char = String.fromCharCode(e.which);
                          if (!/[0-9]/.test(char)) {
                            e.preventDefault();
                          }
                        }}
                        maxLength="10"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter 10-digit phone number"
                      />
                    </div>
                    {inviteFormErrors.visitor_phone && (
                      <p className="mt-1 text-sm text-red-600">{inviteFormErrors.visitor_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visit Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={inviteFormData.visit_time}
                        min={getCurrentDateTime()}
                        onChange={(e) =>
                          setInviteFormData({
                            ...inviteFormData,
                            visit_time: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Time
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={inviteFormData.expiry_time}
                        min={getMinExpiryTime()}
                        onChange={(e) =>
                          setInviteFormData({
                            ...inviteFormData,
                            expiry_time: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Visit *
                  </label>
                  <input
                    type="text"
                    value={inviteFormData.purpose}
                    onChange={(e) => {
                      setInviteFormData({
                        ...inviteFormData,
                        purpose: e.target.value,
                      });
                      // Clear purpose error if user starts typing
                      if (inviteFormErrors.purpose) {
                        setInviteFormErrors({...inviteFormErrors, purpose: ''});
                      }
                    }}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      inviteFormErrors.purpose ? 'border-red-500' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                    placeholder="e.g., Business meeting, Interview, Product demo"
                    required
                  />
                  {inviteFormErrors.purpose && (
                    <p className="mt-1 text-sm text-red-600">{inviteFormErrors.purpose}</p>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? "Sending..." : "Send Invitation"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combined View/Edit Invite Modal */}
      <AnimatePresence>
        {isModalOpen && currentInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Invitation' : 'Invitation Details'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!isEditing ? (
                // View Mode with Sidebar Layout
                <div className="flex flex-col lg:flex-row gap-6 h-full">
                  {/* Main Content */}
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Visitor Image */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                          {currentInvite.image ? (
                            <img
                              src={currentInvite.image}
                              alt={currentInvite.visitor_name || 'Visitor'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold ${
                              currentInvite.image ? 'hidden' : 'flex'
                            }`}
                          >
                            {(currentInvite.visitor_name || 'V').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Status
                          </p>
                          {getStatusBadge(currentInvite.status)}
                        </div>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Visitor Information
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Full Name
                              </p>
                              <p className="mt-1 text-gray-900 font-medium">
                                {currentInvite.visitor_name || 'N/A'}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Email
                              </p>
                              <p className="mt-1 text-blue-600">
                                {currentInvite.visitor_email || 'N/A'}
                              </p>
                            </div>
                            
                            {currentInvite.visitor_phone && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Phone
                                </p>
                                <p className="mt-1 text-gray-900">
                                  {currentInvite.visitor_phone}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Visit Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Purpose
                              </p>
                              <p className="mt-1 text-gray-900">
                                {currentInvite.purpose || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Visit Time
                              </p>
                              <p className="mt-1 text-gray-900">
                                {inviteeHelpers.formatDateTime(currentInvite.visit_time) || 'N/A'}
                              </p>
                            </div>
                            
                            {currentInvite.expiry_time && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Expiry Time
                                </p>
                                <p className="mt-1 text-gray-900">
                                  {inviteeHelpers.formatDateTime(currentInvite.expiry_time)}
                                </p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Invited By
                              </p>
                              <p className="mt-1 text-gray-900">
                                {currentInvite.invited_by || 'N/A'}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Invite Code
                              </p>
                              <p className="mt-1 font-mono text-gray-900">
                                {currentInvite.invite_code || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Invitation</span>
                      </button>
                    </div>
                  </div>

                  {/* Timeline Sidebar */}
                  <div className="lg:w-80 lg:border-l lg:border-gray-200 lg:pl-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Timeline
                      </h3>
                      
                      {/* Timeline Component */}
                      <div className="space-y-4">
                        {(() => {
                          const getTimelineSteps = (invite) => {
                            const steps = [
                              {
                                status: 'pending',
                                title: 'Invitation Sent',
                                description: 'Invitation created and sent to visitor',
                                timestamp: invite.created_at,
                                icon: MailIcon,
                                completed: true
                              },
                              {
                                status: 'approved',
                                title: 'Invitation Approved',
                                description: 'Invitation approved by host',
                                timestamp: invite.status === 'approved' || invite.status === 'checked_in' || invite.status === 'checked_out' ? invite.updated_at || invite.created_at : null,
                                icon: CheckCircle,
                                completed: ['approved', 'checked_in', 'checked_out'].includes(invite.status)
                              },
                              {
                                status: 'checked_in',
                                title: 'Visitor Checked In',
                                description: 'Visitor arrived and checked in',
                                timestamp: invite.status === 'checked_in' || invite.status === 'checked_out' ? invite.updated_at || invite.created_at : null,
                                icon: UserCheck,
                                completed: ['checked_in', 'checked_out'].includes(invite.status)
                              },
                              {
                                status: 'checked_out',
                                title: 'Visitor Checked Out',
                                description: 'Visit completed and checked out',
                                timestamp: invite.status === 'checked_out' ? invite.updated_at || invite.created_at : null,
                                icon: UserX,
                                completed: invite.status === 'checked_out'
                              }
                            ];

                            // Handle rejected status
                            if (invite.status === 'rejected') {
                              steps[1] = {
                                status: 'rejected',
                                title: 'Invitation Rejected',
                                description: 'Invitation was rejected',
                                timestamp: invite.updated_at || invite.created_at,
                                icon: XCircleIcon,
                                completed: true,
                                isRejected: true
                              };
                              // Mark subsequent steps as not completed
                              steps[2].completed = false;
                              steps[3].completed = false;
                            }

                            // Handle expired status
                            if (invite.status === 'expired') {
                              const expiredStep = {
                                status: 'expired',
                                title: 'Invitation Expired',
                                description: 'Invitation has expired',
                                timestamp: invite.expiry_time || invite.updated_at,
                                icon: ClockIcon3,
                                completed: true,
                                isExpired: true
                              };
                              steps.push(expiredStep);
                            }

                            return steps;
                          };

                          const timelineSteps = getTimelineSteps(currentInvite);

                          return timelineSteps.map((step, index) => {
                            const IconComponent = step.icon;
                            const isLast = index === timelineSteps.length - 1;
                            
                            return (
                              <div key={step.status} className="relative">
                                {/* Vertical Line */}
                                {!isLast && (
                                  <div className={`absolute left-4 top-8 w-0.5 h-16 ${
                                    step.completed ? 'bg-green-400' : 'bg-gray-300'
                                  }`} />
                                )}
                                
                                {/* Step Content */}
                                <div className="flex items-start space-x-3">
                                  {/* Icon */}
                                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    step.completed 
                                      ? step.isRejected 
                                        ? 'bg-red-100 text-red-600' 
                                        : step.isExpired
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-green-100 text-green-600'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className={`text-sm font-medium ${
                                        step.completed ? 'text-gray-900' : 'text-gray-500'
                                      }`}>
                                        {step.title}
                                      </p>
                                      {step.completed && (
                                        <div className={`w-2 h-2 rounded-full ${
                                          step.isRejected 
                                            ? 'bg-red-400' 
                                            : step.isExpired
                                            ? 'bg-orange-400'
                                            : 'bg-green-400'
                                        }`} />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {step.description}
                                    </p>
                                    {step.timestamp && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        {inviteeHelpers.formatDateTime(step.timestamp)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleUpdateInvite} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="visitor_name"
                        value={formData.visitor_name}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.visitor_name ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter full name"
                      />
                      {formErrors.visitor_name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.visitor_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="visitor_email"
                        value={formData.visitor_email}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.visitor_email ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter email address"
                      />
                      {formErrors.visitor_email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.visitor_email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="visitor_phone"
                        value={formData.visitor_phone}
                        onChange={(e) => handlePhoneInput(e, 'edit')}
                        onKeyPress={(e) => {
                          // Prevent non-numeric characters on keypress
                          const char = String.fromCharCode(e.which);
                          if (!/[0-9]/.test(char)) {
                            e.preventDefault();
                          }
                        }}
                        maxLength="10"
                        className={`w-full px-3 py-2 border ${
                          formErrors.visitor_phone ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter 10-digit phone number"
                      />
                      {formErrors.visitor_phone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.visitor_phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invited By
                      </label>
                      <input
                        type="text"
                        name="invited_by"
                        value={formData.invited_by}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                        placeholder="Auto-filled with logged-in user"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visit Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="visit_time"
                        value={formData.visit_time}
                        min={getCurrentDateTime()}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.visit_time ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formErrors.visit_time && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.visit_time}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Time
                      </label>
                      <input
                        type="datetime-local"
                        name="expiry_time"
                        value={formData.expiry_time}
                        min={getMinExpiryTimeEdit()}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose *
                      </label>
                      <input
                        type="text"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.purpose ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="e.g., Business meeting, Interview, Product demo"
                      />
                      {formErrors.purpose && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.purpose}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="checked_in">Checked_in</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                        <option value="checked_out">Checked_out</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to original values
                        setFormData({
                          visitor_name: currentInvite.visitor_name,
                          visitor_email: currentInvite.visitor_email,
                          visitor_phone: currentInvite.visitor_phone || "",
                          purpose: currentInvite.purpose,
                          visit_time: currentInvite.visit_time
                            ? currentInvite.visit_time.slice(0, 16)
                            : "",
                          expiry_time: currentInvite.expiry_time
                            ? currentInvite.expiry_time.slice(0, 16)
                            : "",
                          invited_by: currentInvite.invited_by || "",
                          status: currentInvite.status,
                        });
                        setFormErrors({});
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Code Modal */}
      <InviteModal
        isOpen={showInviteCodeModal}
        onClose={closeModal}
        isAdmin={true}
      />

      {/* Pass Preview Modal */}
      {showPassPreview && selectedInvite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowPassPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Visitor Pass Preview
              </h3>
              <p className="text-gray-600">Download your pass</p>
            </div>

            <div
              id="pass-preview"
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6"
            >
              <div className="text-center mb-4">
                <h4 className="text-lg font-bold">VISITOR PASS</h4>
                <p className="text-blue-100 text-sm">Wish Geeks Techserve</p>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20">
                  {selectedInvite.image ? (
                    <img
                      src={selectedInvite.image}
                      alt="Visitor"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white/60" />
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-lg">
                    {selectedInvite.visitor_name}
                  </h5>
                  <p className="text-blue-100 text-sm">
                    {selectedInvite.visitor_email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-100">Visit Time:</span>
                  <span>
                    {inviteeHelpers.formatDateTime(selectedInvite.visit_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Purpose:</span>
                  <span>{selectedInvite.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Invite Code:</span>
                  <span>{selectedInvite.invite_code}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPassPreview(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadPass(selectedInvite)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Pass</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Invitees;
