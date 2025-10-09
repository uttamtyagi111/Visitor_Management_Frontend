import React, { useState, useMemo, useCallback, useEffect } from "react";
import { visitorAPI } from "../../../api/visitor";
import { useToast } from "../../../contexts/ToastContext";
import { debounce } from "../../../utils/validation";

// State management component for visitor data
export const useVisitorState = () => {
  const { toast } = useToast();
  // Main data state
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Edit functionality state
  const [isEditing, setIsEditing] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  // Pass modal state
  const [showPassModal, setShowPassModal] = useState(false);
  const [passVisitor, setPassVisitor] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Data fetching - matching Invitees functionality
  const refreshData = useCallback(async () => {
    try {
      console.log('Starting visitor data refresh');
      setLoading(true);
      setError(null);
      const data = await visitorAPI.getVisitors(); // Fetch all visitors at once
      const results = Array.isArray(data) ? data : data.results || [];
      setVisitors(results);
      setTotalItems(results.length);
      console.log('Visitor data refresh completed:', results.length, 'visitors');
    } catch (err) {
      console.error("Error fetching visitors:", err);
      toast.error("Failed to fetch visitors");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle page change for pagination
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Fetch visitors on component mount (only once)
  useEffect(() => {
    refreshData();
  }, []); // Empty dependency array to run only once on mount

  // Debounced refresh to prevent multiple rapid API calls
  const debouncedRefresh = useCallback(
    debounce(() => {
      console.log('Debounced refresh triggered');
      refreshData();
    }, 1000), // 1 second debounce
    [] // Remove refreshData dependency to prevent infinite loop
  );

  // Refresh data when window regains focus (user returns from registration)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused - scheduling debounced refresh');
      debouncedRefresh();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible - scheduling debounced refresh');
        debouncedRefresh();
      }
    };

    // Add event listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      debouncedRefresh.cancel?.(); // Cancel pending debounced calls
    };
  }, []); // Remove debouncedRefresh dependency to prevent infinite loop

  // Listen for visitor registration events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'visitor_registered' && e.newValue) {
        console.log('New visitor registered via storage - refreshing visitor data');
        refreshData();
        // Clear the flag
        localStorage.removeItem('visitor_registered');
      }
    };

    // Listen for custom event (same tab)
    const handleVisitorRegistered = (e) => {
      console.log('New visitor registered via custom event - refreshing visitor data', e.detail);
      refreshData();
      // Clear the flag
      localStorage.removeItem('visitor_registered');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('visitorRegistered', handleVisitorRegistered);
    
    // Also check for the flag on component mount/focus
    const checkRegistrationFlag = () => {
      if (localStorage.getItem('visitor_registered')) {
        console.log('Found visitor registration flag on mount - refreshing data');
        refreshData();
        localStorage.removeItem('visitor_registered');
      }
    };

    checkRegistrationFlag();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('visitorRegistered', handleVisitorRegistered);
    };
  }, []); // Remove refreshData dependency to prevent infinite loop

  // Memoized visitor statistics
  const visitorStats = useMemo(() => {
    const stats = {
      total: visitors.length,
      checked_in: 0,
      checked_out: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    visitors.forEach((visitor) => {
      const status = visitor.status || "pending";
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });

    return stats;
  }, [visitors]);

  return {
    // Main data state
    visitors,
    setVisitors,
    loading,
    setLoading,
    error,
    setError,
    selectedVisitor,
    setSelectedVisitor,
    updating,
    setUpdating,
    refreshData,

    // Filter state
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,

    // Edit functionality state
    isEditing,
    setIsEditing,
    editingVisitor,
    setEditingVisitor,
    editForm,
    setEditForm,
    editFormErrors,
    setEditFormErrors,

    // Pass modal state
    showPassModal,
    setShowPassModal,
    passVisitor,
    setPassVisitor,

    // Pagination state
    currentPage,
    setCurrentPage,
    handlePageChange,
    itemsPerPage,
    totalItems,
    setTotalItems,

    // Computed values
    visitorStats,
  };
};
