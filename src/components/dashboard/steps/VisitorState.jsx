import React, { useState, useMemo, useCallback, useEffect } from "react";
import { visitorAPI } from "../../../api/visitor";
import { useToast } from "../../../contexts/ToastContext";

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
      setLoading(true);
      setError(null);
      const data = await visitorAPI.getVisitors(); // Fetch all visitors at once
      const results = Array.isArray(data) ? data : data.results || [];
      setVisitors(results);
      setTotalItems(results.length);
    } catch (err) {
      console.error("Error fetching visitors:", err);
      toast.error("Failed to fetch visitors");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch visitors on component mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
    itemsPerPage,
    totalItems,
    setTotalItems,

    // Computed values
    visitorStats,
  };
};
