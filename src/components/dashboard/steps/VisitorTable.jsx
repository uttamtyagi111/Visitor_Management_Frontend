import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  Check,
  MoreVertical,
} from "lucide-react";
import { getStatusBadge } from "./VisitorUIComponents";

// Desktop and Mobile Table Components for Visitors
export const VisitorDesktopTable = ({
  filteredVisitors,
  user,
  handleStatusUpdate,
  handleGeneratePass,
  setSelectedVisitor,
  updating,
}) => (
  <div className="hidden md:block overflow-auto max-h-[600px]">
    <table className="w-full table-auto">
      <thead className="bg-gray-50/50 sticky top-0 z-10">
        <tr>
          <th className="px-3 py-2 text-center text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
            Visitor
          </th>
          <th className="px-3 py-2 text-left text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
            Purpose
          </th>
          <th className="px-3 py-2 text-left text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
            Host
          </th>
          <th className="px-3 py-2 text-left text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
            Check In
          </th>
          <th className="px-3 py-2 text-center text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        <AnimatePresence>
          {filteredVisitors.map((visitor, index) => (
            <motion.tr
              key={visitor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 relative">
                    {visitor.image ||
                    visitor.imageUrl ||
                    visitor.photo ? (
                      <img
                        src={
                          visitor.image ||
                          visitor.imageUrl ||
                          visitor.photo
                        }
                        alt={`${
                          visitor.name ||
                          visitor.firstName + " " + visitor.lastName
                        }`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback =
                            e.target.parentElement.querySelector(
                              ".fallback-avatar"
                            );
                          if (fallback) fallback.style.display = "flex";
                        }}
                        onLoad={(e) => {
                          const fallback =
                            e.target.parentElement.querySelector(
                              ".fallback-avatar"
                            );
                          if (fallback) fallback.style.display = "none";
                        }}
                      />
                    ) : null}
                    <div
                      className={`fallback-avatar w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base absolute top-0 left-0 ${
                        visitor.image ||
                        visitor.imageUrl ||
                        visitor.photo
                          ? "hidden"
                          : "flex"
                      }`}
                    >
                      {(visitor.name || visitor.firstName || "V")
                        .charAt(0)
                        .toUpperCase()}
                      {(visitor.lastName || "").charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {visitor.name ||
                        `${visitor.firstName || ""} ${
                          visitor.lastName || ""
                        }`.trim()}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {visitor.email}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {visitor.phone}
                    </div>
                    <div className="mt-1">
                      {getStatusBadge(visitor.status)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {visitor.purpose || "N/A"}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {visitor.host || visitor.hostName || visitor.issued_by == user.id ? user.name : "N/A"}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  <div className="mb-1">
                    <span className="block">
                      {(visitor.checkInTime || visitor.check_in)
                        ? new Date(
                            visitor.checkInTime || visitor.check_in
                          ).toLocaleDateString()
                        : "Not checked in"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(visitor.checkInTime || visitor.check_in)
                        ? new Date(
                            visitor.checkInTime || visitor.check_in
                          ).toLocaleTimeString()
                        : "Not checked in"}
                    </span>
                  </div>
                  {(visitor.checkOutTime || visitor.check_out) && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="block text-xs text-gray-500">
                        Checked Out:
                      </span>
                      <span className="block">
                        {new Date(
                          visitor.checkOutTime || visitor.check_out
                        ).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(
                          visitor.checkOutTime || visitor.check_out
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  {/* Status Dropdown */}
                  <select
                    value={visitor.status || "pending"}
                    onChange={(e) =>
                      handleStatusUpdate(visitor.id, e.target.value)
                    }
                    className="px-2 py-1 text-sm border border-gray-200 rounded bg-white min-w-[100px]"
                    disabled={updating}
                  >
                    <option value="created">Created</option>
                    <option value="revisit">Revisit</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                  </select>

                  {/* Approve/Reject buttons for pending status */}
                  {visitor.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusUpdate(visitor.id, "approved")
                        }
                        disabled={updating}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                        title="Approve"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(visitor.id, "rejected")
                        }
                        disabled={updating}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                        title="Reject"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Pass generation button for approved status */}
                  {visitor.status === "approved" && (
                    <button
                      onClick={() => handleGeneratePass(visitor.id)}
                      disabled={updating}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50"
                    >
                      Generate Pass
                    </button>
                  )}

                  {/* Check mark for pass generated */}
                  {visitor.pass_generated && (
                    <div className="group relative">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                        Pass Generated
                      </span>
                    </div>
                  )}

                  {/* Check Out button for checked in visitors */}
                  {visitor.status === "checked_in" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(visitor.id, "checked_out")
                      }
                      disabled={updating}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-50"
                    >
                      Check Out
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedVisitor(visitor)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
);

export const VisitorMobileCards = ({
  filteredVisitors,
  handleStatusUpdate,
  handleGeneratePass,
  setSelectedVisitor,
  updating,
}) => (
  <div className="md:hidden space-y-4">
    <AnimatePresence>
      {filteredVisitors.map((visitor, index) => (
        <motion.div
          key={visitor.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-16 h-16 relative">
              {visitor.image || visitor.imageUrl || visitor.photo ? (
                <img
                  src={
                    visitor.image || visitor.imageUrl || visitor.photo
                  }
                  alt={`${
                    visitor.name ||
                    visitor.firstName + " " + visitor.lastName
                  }`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const fallback =
                      e.target.parentElement.querySelector(
                        ".fallback-avatar"
                      );
                    if (fallback) fallback.style.display = "flex";
                  }}
                  onLoad={(e) => {
                    const fallback =
                      e.target.parentElement.querySelector(
                        ".fallback-avatar"
                      );
                    if (fallback) fallback.style.display = "none";
                  }}
                />
              ) : null}
              <div
                className={`fallback-avatar w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl absolute top-0 left-0 ${
                  visitor.image || visitor.imageUrl || visitor.photo
                    ? "hidden"
                    : "flex"
                }`}
              >
                {(visitor.name || visitor.firstName || "V")
                  .charAt(0)
                  .toUpperCase()}
                {(visitor.lastName || "").charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {visitor.name ||
                      `${visitor.firstName || ""} ${
                        visitor.lastName || ""
                      }`.trim()}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {visitor.email}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {visitor.phone}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  {getStatusBadge(visitor.status)}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Purpose:</span>
                  <span className="text-gray-900 font-medium">
                    {visitor.purpose || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Host:</span>
                  <span className="text-gray-900 font-medium">
                    {visitor.host || visitor.hostName || visitor.invitedBy || "N/A"}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check In:</span>
                    <span className="text-gray-900 font-medium">
                      {visitor.checkInTime
                        ? `${new Date(
                            visitor.checkInTime
                          ).toLocaleDateString()} ${new Date(
                            visitor.checkInTime
                          ).toLocaleTimeString()}`
                        : "Not checked in"}
                    </span>
                  </div>
                  {visitor.checkOutTime && (
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-gray-500">Check Out:</span>
                      <span className="text-gray-900 font-medium">
                        {`${new Date(
                          visitor.checkOutTime
                        ).toLocaleDateString()} ${new Date(
                          visitor.checkOutTime
                        ).toLocaleTimeString()}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between space-x-2">
                <select
                  value={visitor.status || "pending"}
                  onChange={(e) =>
                    handleStatusUpdate(visitor.id, e.target.value)
                  }
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                  disabled={updating}
                >
                  <option value="pending">Created</option>
                  <option value="revisit">Revisit</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                </select>

                {visitor.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusUpdate(visitor.id, "approved")
                      }
                      disabled={updating}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                      title="Approve"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(visitor.id, "rejected")
                      }
                      disabled={updating}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                      title="Reject"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </>
                )}

                {visitor.status === "approved" &&
                  !visitor.pass_generated && (
                    <button
                      onClick={() => handleGeneratePass(visitor.id)}
                      disabled={updating}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50"
                    >
                      Generate Pass
                    </button>
                  )}

                {visitor.pass_generated && (
                  <Check className="w-4 h-4 text-green-600" />
                )}

                <button
                  onClick={() => setSelectedVisitor(visitor)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
