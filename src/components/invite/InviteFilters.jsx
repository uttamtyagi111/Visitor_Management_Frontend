import React, { useState } from "react";
import { 
  Search, 
  RefreshCw, 
  QrCode, 
  Plus, 
  X, 
  Filter, 
  Calendar,
  RotateCcw,
  ChevronDown 
} from "lucide-react";
import { inviteeHelpers } from "../../api/invite.js";

const InviteFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  loading,
  refreshData,
  setShowInviteForm,
  setShowInviteCodeModal,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      // Keep spinning for a brief moment to show completion
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };
  return (
    <>
      {/* Header Section - Title and Action Buttons */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Invitations
            </h1>
            <p className="text-gray-600 text-base">
              Manage and track visitor invitations
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 text-sm font-medium group"
            >
              <RefreshCw 
                className={`w-4 h-4 transition-transform duration-300 ${
                  loading || isRefreshing 
                    ? 'animate-spin' 
                    : 'group-hover:rotate-180'
                }`} 
              />
              <span className="hidden sm:inline">
                {loading || isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
            <button
              onClick={() => setShowInviteCodeModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-medium"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Invite Code</span>
            </button>
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Invite</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section - Separate Container */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/50 mb-3">
        <div className="flex flex-row gap-2 sm:gap-3 lg:gap-4 w-full">
          {/* Search Input - Flexible width */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-2 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm transition-all duration-200"
            />
          </div>

          {/* Status Filter - Fixed width */}
          <div className="relative w-32 sm:w-36 lg:w-40 xl:w-44 flex-shrink-0">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-xs sm:text-sm transition-all duration-200"
            >
              <option value="all">All Status</option>
              {inviteeHelpers.statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter - Fixed width */}
          <div className="relative w-32 sm:w-36 lg:w-40 xl:w-44 flex-shrink-0">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-xs sm:text-sm transition-all duration-200"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Display - Responsive */}
      {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-3">
          {/* Header and Filters Container */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-0">Active Filters:</span>
            
            {/* Filter Tags Container */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1">
              {/* Search Filter */}
              {searchTerm && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm max-w-full">
                  <Search className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-[150px] lg:max-w-[200px]">
                    Search: "{searchTerm}"
                  </span>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 sm:ml-2 hover:bg-blue-200 rounded-full p-0.5 flex-shrink-0 transition-colors"
                    aria-label="Clear search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Status Filter */}
              {statusFilter !== "all" && (
                <div className="flex items-center bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  <Filter className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    Status: {inviteeHelpers.statusOptions.find(opt => opt.value === statusFilter)?.label || statusFilter}
                  </span>
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 sm:ml-2 hover:bg-green-200 rounded-full p-0.5 flex-shrink-0 transition-colors"
                    aria-label="Clear status filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Date Filter */}
              {dateFilter !== "all" && (
                <div className="flex items-center bg-purple-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    Date: {dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : dateFilter === "month" ? "This Month" : dateFilter}
                  </span>
                  <button
                    onClick={() => setDateFilter("all")}
                    className="ml-1 sm:ml-2 hover:bg-purple-200 rounded-full p-0.5 flex-shrink-0 transition-colors"
                    aria-label="Clear date filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Reset All Button - Responsive */}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
              className="flex items-center justify-center sm:justify-start bg-gray-100 text-gray-700 px-2 sm:px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm hover:bg-gray-200 transition-colors w-full sm:w-auto mt-1 sm:mt-0"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3 h-3 mr-1 flex-shrink-0" />
              <span>Reset All</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InviteFilters;
