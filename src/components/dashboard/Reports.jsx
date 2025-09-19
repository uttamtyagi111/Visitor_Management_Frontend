import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  RefreshCw,
  Users,
  Hash,
} from "lucide-react";
import {
  getReports,
  exportReports,
  formatDateTime,
  getReportStatus,
} from "../../api/reports";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState('visitors'); // 'visitors' or 'invitees'

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports();
      setReports(data.results || data);
    } catch (err) {
      setError("Failed to fetch reports");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // In your Reports.jsx, replace the filteredReports logic with:

  const filteredReports = (reports || []).map(report => {
    const isVisitor = !!report.visitor_data;
    const isInvitee = !!report.invite_data;

    return {
      ...report,
      visitor_type: isVisitor ? 'visitor' : 'invitee',
      visitor_name: isVisitor
        ? report.visitor_data?.name
        : report.invite_data?.visitor_name,
      email: isVisitor
        ? report.visitor_data?.email
        : report.invite_data?.visitor_email,
      phone: isVisitor
        ? report.visitor_data?.phone
        : report.invite_data?.visitor_phone,
      purpose: isVisitor
        ? report.visitor_data?.purpose
        : report.invite_data?.purpose,
      status: isVisitor
        ? report.visitor_data?.status
        : report.invite_data?.status,
      image: report.image ||
        (isVisitor ? report.visitor_data?.image : report.invite_data?.image)
    };
  }).filter(report => {
    // Filter by active tab
    const matchesTab = (activeTab === 'visitors' && report.visitor_type === 'visitor') ||
      (activeTab === 'invitees' && report.visitor_type === 'invitee');

    if (!matchesTab) return false;

    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (report.visitor_name || '').toLowerCase().includes(searchLower) ||
      (report.email || '').toLowerCase().includes(searchLower) ||
      (report.phone || '').toLowerCase().includes(searchLower) ||
      (report.remarks || '').toLowerCase().includes(searchLower) ||
      (report.purpose || '').toLowerCase().includes(searchLower);

    // Filter by status
    const reportStatus = getReportStatus(report.check_in, report.check_out);
    const matchesStatus = statusFilter === "all" || reportStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExport = async () => {
    try {
      const filters = {
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : null,
        date_filter: dateFilter !== "today" ? dateFilter : null,
        report_type: activeTab, // Add report type to filters
      };

      const blob = await exportReports("csv", filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `reports_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting reports:", error);
      alert("Failed to export reports. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      "checked-in": "bg-green-100 text-green-800 border-green-200",
      "checked-out": "bg-gray-100 text-gray-800 border-gray-200",
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const icons = {
      "checked-in": <CheckCircle className="w-4 h-4" />,
      "checked-out": <XCircle className="w-4 h-4" />,
      scheduled: <Clock className="w-4 h-4" />,
    };

    return (
      <span
        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}
      >
        {icons[status]}
        <span className="capitalize">{status.replace("-", " ")}</span>
      </span>
    );
  };

  return (
    <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Report Management
              </h1>
              <p className="text-gray-600 text-base">
                Track and manage all {activeTab} reports
              </p>
            </div>

            <div className="flex space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200">
                <span>{filteredReports.length} {activeTab} reports</span>
                <RefreshCw
                  className="w-4 h-4 cursor-pointer hover:text-blue-600"
                  onClick={fetchReports}
                />
              </div>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-white/70 border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'visitors'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('visitors')}
            >
              Visitors
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'invitees'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('invitees')}
            >
              Invitees
            </button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search visitor names or remarks..."
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
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="scheduled">Scheduled</option>
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
          </div>
        </motion.div>

        {/* Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Reports List</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RefreshCw className="w-4 h-4 cursor-pointer hover:text-blue-600" onClick={fetchReports} />
                <span>{filteredReports.length} reports</span>
              </div>
            </div>
          </div> */}

          {/* Desktop and Tablet Table View */}
          <div className="hidden md:block overflow-auto max-h-[600px]">
            <table className="w-full table-auto">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Visit Count
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  {/* <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Remarks</th> */}
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-gray-600">
                          Loading reports...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-red-600">
                        <p className="font-medium">{error}</p>
                        <button
                          onClick={fetchReports}
                          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredReports.map((report, index) => {
                      const status = getReportStatus(
                        report.check_in,
                        report.check_out
                      );
                      return (
                        <motion.tr
                          key={report.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="hover:bg-white/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {report.image ? (
                                <img
                                  src={report.image}
                                  alt={report.visitor_name || "Visitor"}
                                  className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ${report.image ? "hidden" : ""
                                  }`}
                              >
                                {report.visitor_name
                                  ? report.visitor_name.charAt(0).toUpperCase()
                                  : "V"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {report.visitor_name || "Unknown Visitor"}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  ID: {report.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {formatDateTime(report.check_in)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {formatDateTime(report.check_out)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Hash className="w-4 h-4 text-blue-500" />
                              <span className="font-bold text-blue-600">
                                {report.visit_count}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(status)}
                          </td>
                          {/* <td className="px-6 py-4">
                            <span className="text-gray-700 text-sm">
                              {report.remarks ? (
                                report.remarks.length > 50 
                                  ? `${report.remarks.substring(0, 50)}...` 
                                  : report.remarks
                              ) : 'No remarks'}
                            </span>
                          </td> */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-gray-600">Loading reports...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600">
                  <p className="font-medium">{error}</p>
                  <button
                    onClick={fetchReports}
                    className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {filteredReports.map((report, index) => {
                  const status = getReportStatus(
                    report.check_in,
                    report.check_out
                  );
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {report.image ? (
                            <img
                              src={report.image}
                              alt={report.visitor_name || "Visitor"}
                              className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ${report.image ? "hidden" : ""
                              }`}
                          >
                            {report.visitor_name
                              ? report.visitor_name.charAt(0).toUpperCase()
                              : "V"}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {report.visitor_name || "Unknown Visitor"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              ID: {report.id}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Check In:</span>
                          <span className="text-gray-900 font-medium">
                            {formatDateTime(report.check_in)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Check Out:</span>
                          <span className="text-gray-900 font-medium">
                            {formatDateTime(report.check_out)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Visit Count:</span>
                          <div className="flex items-center space-x-1">
                            <Hash className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-600 font-bold">
                              {report.visit_count}
                            </span>
                          </div>
                        </div>
                        {/* <div className="flex justify-between">
                          <span className="text-gray-500">Remarks:</span>
                          <span className="text-gray-900 font-medium text-right max-w-48 truncate">
                            {report.remarks || 'No remarks'}
                          </span>
                        </div> */}
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {!loading && !error && filteredReports.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">
                No reports found matching your criteria
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                {selectedReport.image ? (
                  <img
                    src={selectedReport.image}
                    alt={selectedReport.visitor_name || "Visitor"}
                    className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-white mx-auto mb-4"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg ${selectedReport.image ? "hidden" : ""
                    }`}
                >
                  {selectedReport.visitor_name
                    ? selectedReport.visitor_name.charAt(0).toUpperCase()
                    : "V"}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedReport.visitor_name || "Unknown Visitor"}
                </h3>
                <p className="text-gray-600">Report ID: {selectedReport.id}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Check In
                  </label>
                  <p className="text-gray-900 font-medium">
                    {formatDateTime(selectedReport.check_in)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Check Out
                  </label>
                  <p className="text-gray-900 font-medium">
                    {formatDateTime(selectedReport.check_out)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Visit Count
                  </label>
                  <p className="text-gray-900 font-medium flex items-center space-x-1">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <span>{selectedReport.visit_count}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  {getStatusBadge(
                    getReportStatus(
                      selectedReport.check_in,
                      selectedReport.check_out
                    )
                  )}
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Remarks</label>
                  <p className="text-gray-900 font-medium">{selectedReport.remarks || 'No remarks'}</p>
                </div> */}
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                  Edit Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStatusBadge(status) {
  const styles = {
    "checked-in": "bg-green-100 text-green-800 border-green-200",
    "checked-out": "bg-gray-100 text-gray-800 border-gray-200",
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const icons = {
    "checked-in": <CheckCircle className="w-4 h-4" />,
    "checked-out": <XCircle className="w-4 h-4" />,
    scheduled: <Clock className="w-4 h-4" />,
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}
    >
      {icons[status]}
      <span className="capitalize">{status.replace("-", " ")}</span>
    </span>
  );
}

export default Reports;
