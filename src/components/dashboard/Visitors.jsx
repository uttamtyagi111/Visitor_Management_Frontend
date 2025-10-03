import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  RefreshCw,
  Download,
} from "lucide-react";

// Import modular components
import { useVisitorState } from "./steps/VisitorState";
import { useVisitorFilters } from "./steps/VisitorFilters";
import { useVisitorActions } from "./steps/VisitorActions";
import { useVisitorPassGenerator } from "./steps/VisitorPassGenerator";
import { 
  LoadingComponent, 
  ErrorComponent, 
  EmptyStateComponent 
} from "./steps/VisitorUIComponents";
import { VisitorFiltersUI } from "./steps/VisitorFiltersUI";
import { VisitorDesktopTable, VisitorMobileCards } from "./steps/VisitorTable";
import { PassGenerationModal, VisitorDetailModal, EditVisitorModal } from "./steps/VisitorModals";
import { VisitorPagination } from "./steps/VisitorPagination";

function Visitors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize all state using the modular hook
  const state = useVisitorState();

  // Enhanced refresh handler with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await state.refreshData();
    } finally {
      // Keep spinning for a brief moment to show completion
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  // Initialize filters with client-side filtering like Invitees
  const filters = useVisitorFilters({
    visitors: state.visitors,
    searchTerm: state.searchTerm,
    statusFilter: state.statusFilter,
    dateFilter: state.dateFilter,
    setSearchTerm: state.setSearchTerm,
    setStatusFilter: state.setStatusFilter,
    setDateFilter: state.setDateFilter,
  });

  // Initialize actions with state and filter dependencies
  const actions = useVisitorActions({
    visitors: state.visitors,
    setVisitors: state.setVisitors,
    selectedVisitor: state.selectedVisitor,
    setSelectedVisitor: state.setSelectedVisitor,
    setUpdating: state.setUpdating,
    setError: state.setError,
    fetchVisitors: state.refreshData, // Use refreshData from state instead of filters
    user,
    setIsEditing: state.setIsEditing,
    setEditingVisitor: state.setEditingVisitor,
    setEditForm: state.setEditForm,
    setEditFormErrors: state.setEditFormErrors,
  });

  // Initialize pass generator with state dependencies
  const passGenerator = useVisitorPassGenerator({
    visitors: state.visitors,
    setVisitors: state.setVisitors,
    selectedVisitor: state.selectedVisitor,
    setSelectedVisitor: state.setSelectedVisitor,
    setUpdating: state.setUpdating,
    setError: state.setError,
    fetchVisitors: state.refreshData, // Use refreshData from state instead of filters
    user,
    setPassVisitor: state.setPassVisitor,
    setShowPassModal: state.setShowPassModal,
    passVisitor: state.passVisitor,
  });

  // Helper functions for UI interactions
  const handleFormChange = (field, value) => {
    actions.handleFormChange(field, value, state.setEditForm);
  };

  const handleSaveEdit = () => {
    actions.handleSaveEdit(state.editingVisitor, state.editForm);
  };

  // Early returns for loading and error states
  if (state.loading && state.visitors.length === 0) {
    return <LoadingComponent />;
  }

  if (state.error) {
    return <ErrorComponent error={state.error} onRetry={actions.refreshData} />;
  }

  // Show empty state if no visitors found
  if (!state.loading && filters.filteredVisitors.length === 0) {
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
                Visitor Management
              </h1>
              <p className="text-gray-600 text-base">
                Track and manage all visitor activities
              </p>
            </div>
          </div>

          {/* Filters */}
          <VisitorFiltersUI
            searchTerm={state.searchTerm}
            setSearchTerm={state.setSearchTerm}
            statusFilter={state.statusFilter}
            setStatusFilter={state.setStatusFilter}
            dateFilter={state.dateFilter}
            setDateFilter={state.setDateFilter}
            resetFilters={filters.resetFilters}
            loading={state.loading}
          />

          <EmptyStateComponent />
        </motion.div>
      </div>
    );
  }

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
              Visitor Management
            </h1>
            <p className="text-gray-600 text-base">
              Track and manage all visitor activities
            </p>
            {state.error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {state.error}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={state.loading || isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white/70 border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 group"
            >
              <RefreshCw
                className={`w-4 h-4 transition-transform duration-300 ${
                  state.loading || isRefreshing 
                    ? "animate-spin" 
                    : "group-hover:rotate-180"
                }`}
              />
              <span>{state.loading || isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            {/* <button className="flex items-center space-x-2 px-4 py-2 bg-white/70 border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button> */}
          </div>
        </div>

        {/* Filters */}
        <VisitorFiltersUI
          searchTerm={state.searchTerm}
          setSearchTerm={state.setSearchTerm}
          statusFilter={state.statusFilter}
          setStatusFilter={state.setStatusFilter}
          dateFilter={state.dateFilter}
          setDateFilter={state.setDateFilter}
          resetFilters={filters.resetFilters}
          loading={state.loading}
        />

        {/* Visitors Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* Desktop Table View */}
          <VisitorDesktopTable
            filteredVisitors={filters.filteredVisitors}
            user={user}
            handleStatusUpdate={actions.handleStatusUpdate}
            handleGeneratePass={passGenerator.handleGeneratePass}
            setSelectedVisitor={state.setSelectedVisitor}
            updating={state.updating}
          />

          {/* Mobile Card View */}
          <VisitorMobileCards
            filteredVisitors={filters.filteredVisitors}
            handleStatusUpdate={actions.handleStatusUpdate}
            handleGeneratePass={passGenerator.handleGeneratePass}
            setSelectedVisitor={state.setSelectedVisitor}
            updating={state.updating}
          />

          {/* Pagination */}
          <VisitorPagination
            totalItems={state.totalItems}
            itemsPerPage={state.itemsPerPage}
            currentPage={state.currentPage}
            handlePageChange={state.handlePageChange}
            loading={state.loading}
          />
        </motion.div>
      </motion.div>

      {/* Pass Generation Modal */}
      <PassGenerationModal
        showPassModal={state.showPassModal}
        passVisitor={state.passVisitor}
        setShowPassModal={state.setShowPassModal}
        handleDownloadPass={passGenerator.handleDownloadPass}
      />

      {/* Visitor Detail Modal */}
      <VisitorDetailModal
        selectedVisitor={state.selectedVisitor}
        setSelectedVisitor={state.setSelectedVisitor}
        handleEditVisitor={actions.handleEditVisitor}
        user={user}
        isEditing={state.isEditing}
      />

      {/* Edit Visitor Modal */}
      <EditVisitorModal
        isEditing={state.isEditing}
        editingVisitor={state.editingVisitor}
        editForm={state.editForm}
        editFormErrors={state.editFormErrors}
        handleFormChange={handleFormChange}
        handleSaveEdit={handleSaveEdit}
        handleCancelEdit={actions.handleCancelEdit}
        updating={state.updating}
        actions={actions}
      />
    </div>
  );
}

export default Visitors;
