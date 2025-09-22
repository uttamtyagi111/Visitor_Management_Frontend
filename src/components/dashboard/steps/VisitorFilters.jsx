import React, { useMemo, useCallback, useEffect } from "react";
import { visitorAPI } from "../../../api/visitor";

// Debounce utility function with cancel support
function debounce(func, wait) {
  let timeout;
  const executedFunction = function(...args) {
    const later = () => {
      clearTimeout(timeout);
      console.log("Debounce executing with args:", args);
      func(...args);
    };
    clearTimeout(timeout);
    console.log("Debounce scheduled with args:", args, "wait:", wait);
    timeout = setTimeout(later, wait);
  };
  
  // Add cancel method
  executedFunction.cancel = () => {
    clearTimeout(timeout);
    console.log("Debounce cancelled");
  };
  
  return executedFunction;
}

// Filter management component for visitors
export const useVisitorFilters = ({
  dateFilter,
  statusFilter,
  searchTerm,
  itemsPerPage,
  setLoading,
  setError,
  setCurrentPage,
  setVisitors,
  setTotalItems,
  setSearchTerm,
  setStatusFilter,
  setDateFilter,
}) => {
  // Memoized date calculations for better performance
  const dateFilters = useMemo(() => {
    const today = new Date();
    const filters = {};

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    switch (dateFilter) {
      case "today":
        filters.created_at_after = formatDate(today);
        filters.created_at_before = formatDate(today);
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        filters.created_at_after = formatDate(yesterday);
        filters.created_at_before = formatDate(yesterday);
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filters.created_at_after = formatDate(weekAgo);
        // For "this week", we want from 7 days ago until today
        filters.created_at_before = formatDate(today);
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filters.created_at_after = formatDate(monthAgo);
        // For "this month", we want from 30 days ago until today
        filters.created_at_before = formatDate(today);
        break;
      default:
        // For "all" or any other case, don't apply date filters
        break;
    }
    
    console.log("Date filter computed:", { dateFilter, filters });
    return filters;
  }, [dateFilter]);

  const fetchVisitors = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          ...dateFilters,
          page,
          page_size: itemsPerPage,
          ordering: "-created_at", // Most recent first
        };

        // Apply status filter
        if (statusFilter !== "all") {
          filters.status = statusFilter;
        }

        // Apply search filter if there's a search term
        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }

        console.log("Fetching visitors with filters:", filters);
        console.log("Current filter states:", { searchTerm, statusFilter, dateFilter });

        const data = await visitorAPI.getVisitorsWithFilters(filters);
        const results = Array.isArray(data) ? data : data.results || data || [];
        results.forEach((visitor) => {
          return { ...visitor, checkInTime: visitor.checkInTime || visitor.check_in, checkedOutTime: visitor.checkOutTime || visitor.check_out, hostName: visitor.host || visitor.issued_by };
        });
        console.log("Fetched visitor details:", results);
        console.log("Total items:", data.count || results.length);
        setVisitors(results);
        setTotalItems(data.count || results.length);
        setCurrentPage(page);
      } catch (err) {
        console.error("Error fetching visitors:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, dateFilters, itemsPerPage, searchTerm, setLoading, setError, setVisitors, setTotalItems, setCurrentPage]
  );

  const handleSearch = useCallback(
    async (term = searchTerm, page = 1) => {
      try {
        console.log("=== STARTING SEARCH ===");
        console.log("Search term received:", term);
        console.log("Page:", page);
        
        setLoading(true);
        setError(null);
        setCurrentPage(page); // Use the provided page parameter

        // Combine search with current filters for better results
        const filters = {
          ...dateFilters,
          page: page,
          page_size: itemsPerPage,
          ordering: "-created_at", // Most recent first
        };

        // Apply status filter
        if (statusFilter !== "all") {
          filters.status = statusFilter;
        }
        
        // Apply search term
        if (term && term.trim()) {
          filters.search = term.trim();
          console.log("Added search filter:", term.trim());
        }

        console.log("Final filters object:", filters);
        console.log("API URL will be: /visitors/ with params:", new URLSearchParams(filters).toString());

        const data = await visitorAPI.getVisitorsWithFilters(filters);
        console.log("Raw API response:", data);
        
        const results = Array.isArray(data) ? data : data.results || data || [];
        console.log("Processed results array:", results);
        console.log("Number of results:", results.length);
        
        // Process visitor data
        const processedResults = results.map((visitor) => {
          return { 
            ...visitor, 
            checkInTime: visitor.checkInTime || visitor.check_in, 
            checkedOutTime: visitor.checkOutTime || visitor.check_out, 
            hostName: visitor.host || visitor.issued_by 
          };
        });

        console.log("Final processed results:", processedResults);
        console.log("Total items from API:", data.count || results.length);
        
        setVisitors(processedResults);
        setTotalItems(data.count || results.length);
        
        console.log("=== SEARCH COMPLETED ===");
      } catch (err) {
        console.error("=== SEARCH ERROR ===", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, dateFilters, itemsPerPage, searchTerm, setLoading, setError, setCurrentPage, setVisitors, setTotalItems]
  );

  // Optimized debounce search with useCallback - defined after handleSearch to avoid circular dependency
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.trim()) {
        await handleSearch(term);
      } else {
        await fetchVisitors(1);
      }
    }, 300),
    [fetchVisitors, handleSearch]
  );

  // Initial load effect - fetch all visitors once
  useEffect(() => {
    console.log("Initial load - fetching all visitors");
    fetchVisitors(1);
  }, [fetchVisitors]);

  // Reset to first page when filters change (client-side filtering)
  useEffect(() => {
    console.log("Filters changed, resetting to page 1");
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, setCurrentPage]);

  // Handle page changes - simple page change for client-side filtering
  const handlePageChange = useCallback(
    (page) => {
      console.log("Page change requested:", page);
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  // Individual filter clear functions
  const clearSearchFilter = useCallback(() => {
    console.log("Clearing search filter");
    setSearchTerm("");
  }, [setSearchTerm]);

  const clearStatusFilter = useCallback(() => {
    console.log("Clearing status filter");
    setStatusFilter("all");
  }, [setStatusFilter]);

  const clearDateFilter = useCallback(() => {
    console.log("Clearing date filter");
    setDateFilter("today");
  }, [setDateFilter]);

  // Reset all filters to default values
  const resetFilters = useCallback(() => {
    console.log("Resetting all filters to default values");
    clearSearchFilter();
    clearStatusFilter();
    clearDateFilter();
    setCurrentPage(1);
    // The useEffect will trigger fetchVisitors with reset filters
  }, [clearSearchFilter, clearStatusFilter, clearDateFilter, setCurrentPage]);

  return {
    dateFilters,
    fetchVisitors,
    handleSearch,
    debouncedSearch,
    handlePageChange,
    clearSearchFilter,
    clearStatusFilter,
    clearDateFilter,
    resetFilters,
  };
};
