import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  Plus,
  RefreshCw,
  QrCode,
  X,
  RotateCcw,
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
  return (
    <>
      {/* Enhanced Header Section - Orientation Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 portrait:p-3 landscape:p-4 landscape:lg:p-6 mb-6 portrait:mb-4 landscape:mb-5">
        <div className="flex flex-col space-y-4 lg:space-y-6 portrait:space-y-3 landscape:space-y-3 landscape:lg:space-y-4">
          {/* Title and Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 portrait:space-y-3 landscape:space-y-2 landscape:lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl portrait:text-xl landscape:text-2xl landscape:lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2 portrait:mb-1 landscape:mb-1">
                Invitations
              </h1>
              <p className="text-sm sm:text-base lg:text-lg portrait:text-xs landscape:text-sm landscape:lg:text-base text-gray-600">
                Manage and track visitor invitations
              </p>
            </div>
            
            {/* Action Buttons - Orientation Responsive */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4 lg:flex-shrink-0 portrait:space-y-1.5 portrait:sm:space-x-2 landscape:space-y-1.5 landscape:sm:space-x-2 landscape:lg:space-x-3">
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 portrait:px-3 portrait:py-2 landscape:px-4 landscape:py-2.5 landscape:lg:px-6 landscape:lg:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base lg:text-base portrait:text-xs landscape:text-sm landscape:lg:text-base font-medium"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 portrait:w-3 portrait:h-3 landscape:w-4 landscape:h-4 landscape:lg:w-5 landscape:lg:h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline portrait:hidden landscape:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowInviteCodeModal(true)}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 portrait:px-3 portrait:py-2 landscape:px-4 landscape:py-2.5 landscape:lg:px-6 landscape:lg:py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base lg:text-base portrait:text-xs landscape:text-sm landscape:lg:text-base font-medium"
              >
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 portrait:w-3 portrait:h-3 landscape:w-4 landscape:h-4 landscape:lg:w-5 landscape:lg:h-5" />
                <span className="hidden sm:inline portrait:hidden landscape:inline">Invite Code</span>
              </button>
              <button
                onClick={() => setShowInviteForm(true)}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 portrait:px-3 portrait:py-2 landscape:px-4 landscape:py-2.5 landscape:lg:px-6 landscape:lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base lg:text-base portrait:text-xs landscape:text-sm landscape:lg:text-base font-medium"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 portrait:w-3 portrait:h-3 landscape:w-4 landscape:h-4 landscape:lg:w-5 landscape:lg:h-5" />
                <span className="hidden sm:inline portrait:hidden landscape:inline">New Invite</span>
              </button>
            </div>
          </div>

          {/* Enhanced Filters Section - True Single Line */}
          <div className="flex flex-row gap-2 sm:gap-3 lg:gap-4 w-full">
            {/* Search Input - Flexible width */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-2 sm:pr-4 py-2 sm:py-2.5 lg:py-3 xl:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm lg:text-base xl:text-lg transition-all duration-200"
              />
            </div>

            {/* Status Filter - Fixed width */}
            <div className="relative w-32 sm:w-36 lg:w-40 xl:w-44 flex-shrink-0">
              <Filter className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-7 sm:pl-10 pr-1 sm:pr-2 lg:pr-4 py-2 sm:py-2.5 lg:py-3 xl:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-xs sm:text-sm lg:text-base xl:text-lg transition-all duration-200"
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
              <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-7 sm:pl-10 pr-1 sm:pr-2 lg:pr-4 py-2 sm:py-2.5 lg:py-3 xl:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-xs sm:text-sm lg:text-base xl:text-lg transition-all duration-200"
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
          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-0">
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
      </div>
    </>
  );
};

export default InviteFilters;
