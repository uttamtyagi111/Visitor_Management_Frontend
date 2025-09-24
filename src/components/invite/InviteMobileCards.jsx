import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Trash2,
  Eye,
  Download,
  FileText,
  Users,
} from "lucide-react";
import { inviteeHelpers } from "../../api/invite.js";

const InviteMobileCards = ({
  filteredInvitees,
  loading,
  invites,
  getStatusBadge,
  handleStatusUpdate,
  handleGenerateInvitePass,
  handleDownloadPass,
  canReinvite,
  openReinviteModal,
  openInviteModal,
  handleDeleteInvite,
}) => {
  return (
    <>
      <div className="md:hidden space-y-4">
        <AnimatePresence>
          {filteredInvitees.map((invite, index) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 relative">
                  {invite.image ? (
                    <img
                      src={invite.image}
                      alt={invite.visitor_name || "Visitor"}
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
                    className={`fallback-avatar w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg absolute top-0 left-0 ${
                      invite.image ? "hidden" : "flex"
                    }`}
                  >
                    {(invite.visitor_name || "V").charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {invite.visitor_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {invite.visitor_email}
                  </p>
                  {invite.visitor_phone && (
                    <p className="text-sm text-gray-500">
                      {invite.visitor_phone}
                    </p>
                  )}
                </div>
                <div className="ml-2 flex-shrink-0">
                  {getStatusBadge(invite.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Host:</span>
                  <span className="text-gray-900 font-medium">
                    {invite.invited_by}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Invite Code:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 font-medium font-mono text-xs">
                      {invite.invite_code || "N/A"}
                    </span>
                    {(invite.status === "checked_in" ||
                      invite.pass_generated) && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Purpose:</span>
                  <span className="text-gray-900 font-medium text-right">
                    {invite.purpose}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Visit Time:</span>
                  <span className="text-gray-900 font-medium text-right">
                    {inviteeHelpers.formatDateTime(invite.visit_time)}
                  </span>
                </div>
                {invite.expiry_time && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expires:</span>
                    <span className="text-gray-900 font-medium text-right">
                      {inviteeHelpers.formatDateTime(invite.expiry_time)}
                    </span>
                  </div>
                )}
                {invite.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900 font-medium text-right">
                      {inviteeHelpers.formatDateTime(invite.created_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced Mobile Actions Section */}
              <div className="space-y-3">
                {/* Status Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 min-w-[60px]">Status:</span>
                  <select
                    value={invite.status}
                    onChange={(e) =>
                      handleStatusUpdate(invite.id, e.target.value)
                    }
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    {inviteeHelpers.statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Approve/Reject buttons for pending invites */}
                  {invite.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusUpdate(invite.id, "approved")
                        }
                        disabled={loading}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 text-sm font-medium"
                        title="Approve"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(invite.id, "rejected")
                        }
                        disabled={loading}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50 text-sm font-medium"
                        title="Reject"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* Pass generation button for approved invites */}
                  {invite.status === "approved" && !invite.pass_generated && (
                    <button
                      onClick={() => handleGenerateInvitePass(invite)}
                      disabled={loading}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50 font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Generate Pass</span>
                    </button>
                  )}

                  {/* Download pass button for generated passes */}
                  {invite.pass_generated && (
                    <button
                      onClick={() => handleDownloadPass(invite.id, "image")}
                      disabled={loading}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm disabled:opacity-50 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Pass</span>
                    </button>
                  )}

                  {/* Reinvite button for expired, rejected, or checked_out invites */}
                  {canReinvite(invite.status) && (
                    <button
                      onClick={() => openReinviteModal(invite)}
                      disabled={loading}
                      className="flex items-center space-x-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 text-sm disabled:opacity-50 font-medium"
                      title="Reinvite"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reinvite</span>
                    </button>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => openInviteModal(invite)}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteInvite(invite.id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                    disabled={loading}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredInvitees.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600">
            No invitees found matching your criteria
          </p>
        </div>
      )}

      {loading && invites.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitations...</p>
        </div>
      )}
    </>
  );
};

export default InviteMobileCards;
