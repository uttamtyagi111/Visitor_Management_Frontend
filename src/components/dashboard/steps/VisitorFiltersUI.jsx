import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  RefreshCw,
} from "lucide-react";

// Filter UI Component for Visitors
export const VisitorFiltersUI = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  resetFilters,
  loading,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.5 }}
    className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-white/50 mb-4"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
      {/* Search */}
      <div className="lg:col-span-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Search visitors..."
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
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="scheduled">Scheduled</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
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

      {/* Reset Filters Button */}
      <div className="relative">
        <button
          onClick={resetFilters}
          disabled={loading}
          className="w-full px-3 py-2 text-sm bg-gray-100/50 border border-gray-200 rounded-lg hover:bg-gray-200/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reset</span>
        </button>
      </div>
    </div>
    
    {/* Active Filters Display */}
    {(searchTerm || statusFilter !== "all" || dateFilter !== "today") && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {searchTerm && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">
            Search: "{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
            <button 
              onClick={() => setSearchTerm("")}
              className="ml-1.5 text-blue-600 hover:text-blue-800 text-sm"
            >
              ×
            </button>
          </span>
        )}
        {statusFilter !== "all" && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
            {statusFilter.replace("_", " ")}
            <button 
              onClick={() => setStatusFilter("all")}
              className="ml-1.5 text-green-600 hover:text-green-800 text-sm"
            >
              ×
            </button>
          </span>
        )}
        {dateFilter !== "today" && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800">
            {dateFilter.replace("_", " ")}
            <button 
              onClick={() => setDateFilter("today")}
              className="ml-1.5 text-purple-600 hover:text-purple-800 text-sm"
            >
              ×
            </button>
          </span>
        )}
      </div>
    )}
  </motion.div>
);
