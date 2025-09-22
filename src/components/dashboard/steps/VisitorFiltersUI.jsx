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
    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-4"
  >
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Search */}
      <div className="md:col-span-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Search visitors, companies, or emails..."
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
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
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
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
          className="w-full pl-4 pr-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl hover:bg-gray-200/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Reset</span>
        </button>
      </div>
    </div>
    
    {/* Active Filters Display */}
    <div className="mt-4 flex flex-wrap gap-2">
      {searchTerm && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
          Search: "{searchTerm}"
          <button 
            onClick={() => setSearchTerm("")}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        </span>
      )}
      {statusFilter !== "all" && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
          Status: {statusFilter.replace("_", " ")}
          <button 
            onClick={() => setStatusFilter("all")}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </span>
      )}
      {dateFilter !== "today" && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
          Date: {dateFilter.replace("_", " ")}
          <button 
            onClick={() => setDateFilter("today")}
            className="ml-2 text-purple-600 hover:text-purple-800"
          >
            ×
          </button>
        </span>
      )}
    </div>
  </motion.div>
);
