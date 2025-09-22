import React, { useState, useMemo } from "react";

// State management component for visitor data
export const useVisitorState = () => {
  // Main data state
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  // Edit functionality state
  const [isEditing, setIsEditing] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Pass modal state
  const [showPassModal, setShowPassModal] = useState(false);
  const [passVisitor, setPassVisitor] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // For client-side filtering when search is active
  const filteredVisitors = useMemo(() => {
    return visitors; // Server-side filtering is now handled in API calls
  }, [visitors]);

  // Memoized visitor statistics
  const visitorStats = useMemo(() => {
    const stats = {
      total: filteredVisitors.length,
      checked_in: 0,
      checked_out: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    filteredVisitors.forEach((visitor) => {
      const status = visitor.status || "pending";
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });

    return stats;
  }, [filteredVisitors]);

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
    filteredVisitors,
    visitorStats,
  };
};
