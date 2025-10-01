import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { inviteeHelpers } from "../../api/invite.js";

const InviteTable = ({
  filteredInvitees,
  loading,
  getStatusBadge,
  handleStatusUpdate,
  handleGenerateInvitePass,
  canReinvite,
  openReinviteModal,
  handleDeleteInvite,
  openInviteModal,
  openPassPreview,
}) => {
  return (
    <div className="hidden md:block overflow-auto max-h-[600px]">
      <table className="w-full table-auto">
        <thead className="bg-gray-50/50 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
              Invitee
            </th>
            <th className="px-3 py-2 text-left text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
              Invite_code
            </th>
            <th className="px-3 py-2 text-left text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
              Purpose
            </th>
            <th className="px-3 py-2 text-left text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
              Visit Time
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 backdrop-blur-sm">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <AnimatePresence>
            {filteredInvitees.map((invite, index) => (
              <motion.tr
                key={invite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="hover:bg-white/50 transition-colors duration-200"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 relative">
                      {invite.image ? (
                        <img
                          key={`${invite.id}-${invite.image}`}
                          src={`${invite.image}?t=${Date.now()}`}
                          alt={invite.visitor_name || "Visitor"}
                          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
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
                        className={`fallback-avatar w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs absolute top-0 left-0 ${
                          invite.image ? "hidden" : "flex"
                        }`}
                      >
                        {(invite.visitor_name || "V")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {invite.visitor_name}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {invite.visitor_email}
                      </p>
                      {invite.visitor_phone && (
                        <p className="text-gray-500 text-xs">
                          {invite.visitor_phone}
                        </p>
                      )}
                      <div className="mt-1">
                        {getStatusBadge(invite.status)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 text-sm">
                      {invite.invite_code || "N/A"}
                    </p>
                    {(invite.status === "checked_in" ||
                      invite.pass_generated) && (
                      <div className="group relative">
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          {invite.status === "checked_in"
                            ? "Checked In"
                            : "Pass Generated"}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {invite.purpose}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-1">
                    {/* Show scheduled time - emphasize for created/reinvited status */}
                    <p className={`text-xs ${(invite.status === 'created' || invite.status === 'reinvited') ? 'text-indigo-600 font-medium' : 'font-medium text-gray-900'}`}>
                      <span className="text-gray-500">Scheduled:</span> {inviteeHelpers.formatDateTime(invite.visit_time)}
                    </p>
                    
                    {/* Only show check-in/check-out times for visitors who have actually checked in */}
                    {(invite.status === 'checked_in' || invite.status === 'checked_out') && (
                      <>
                        {invite.report?.check_in && (
                          <p className="text-green-600 text-xs">
                            <span className="text-gray-500">Checked In:</span> {inviteeHelpers.formatDateTime(invite.report.check_in)}
                          </p>
                        )}
                        {invite.report?.check_out && invite.status === "checked_out" && (
                          <p className="text-blue-600 text-xs">
                            <span className="text-gray-500">Checked Out:</span> {inviteeHelpers.formatDateTime(invite.report.check_out)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <select
                      value={invite.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        const inviteId = invite.id;
                        
                        console.log('🔄 Dropdown onChange triggered for invite:', inviteId, 'New status:', newStatus);
                        
                        // Prevent calling if the status is the same
                        if (newStatus === invite.status) {
                          console.log('⚠️ Status unchanged, skipping update');
                          return;
                        }
                        
                        handleStatusUpdate(inviteId, newStatus);
                      }}
                      className="px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white min-w-[100px]"
                      disabled={loading}
                    >
                      {inviteeHelpers.statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Approve/Reject buttons for pending status */}
                    {invite.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(invite.id, "approved")
                          }
                          disabled={loading}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                          title="Approve"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(invite.id, "rejected")
                          }
                          disabled={loading}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                          title="Reject"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Pass generation button for approved invites */}
                    {invite.status === "approved" && (
                      <button
                        onClick={() => handleStatusUpdate(invite.id, "checked_in")}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50"
                      >
                        Generate Pass
                      </button>
                    )}

                    {/* Check mark for pass generated */}
                    {invite.pass_generated && (
                      <div className="group relative">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Pass Generated
                        </span>
                      </div>
                    )}

                    {/* Check Out button */}
                    {invite.status === "checked_in" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(invite.id, "checked_out")
                        }
                        disabled={loading}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-50"
                      >
                        Check Out
                      </button>
                    )}

                    {/* Reinvite button for expired, rejected, or checked_out invites */}
                    {canReinvite(invite.status) && (
                      <button
                        onClick={() => openReinviteModal(invite)}
                        disabled={loading}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors duration-200 text-sm disabled:opacity-50 flex items-center space-x-1"
                        title="Reinvite"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reinvite</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteInvite(invite.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openInviteModal(invite);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default InviteTable;
