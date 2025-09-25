import React, { useMemo, useCallback } from "react";

// Filter management component for visitors - Client-side filtering like Invitees
export const useVisitorFilters = ({
  visitors,
  searchTerm,
  statusFilter,
  dateFilter,
  setSearchTerm,
  setStatusFilter,
  setDateFilter,
}) => {
  // Client-side filtering logic - matching Invitees functionality
  const filteredVisitors = useMemo(() => {
    return visitors.filter((visitor) => {
      // Search filter - matches name, email, or purpose
      const matchesSearch = 
        visitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.purpose?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || visitor.status === statusFilter;

      // Date filter - based on created_at or updated_at
      const matchesDate = (() => {
        if (dateFilter === "all") return true;
        
        const visitorDate = new Date(visitor.created_at || visitor.updated_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case "today":
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            return visitorDate >= today && visitorDate <= todayEnd;
          case "week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            return visitorDate >= weekStart && visitorDate <= weekEnd;
          case "month":
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);
            return visitorDate >= monthStart && visitorDate <= monthEnd;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [visitors, searchTerm, statusFilter, dateFilter]);

  // Reset filters function - matching Invitees functionality
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
  }, [setSearchTerm, setStatusFilter, setDateFilter]);

  return {
    filteredVisitors,
    resetFilters,
  };
};
