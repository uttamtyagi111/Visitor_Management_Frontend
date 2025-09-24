import React from "react";
import { motion } from "framer-motion";
import { User, Download } from "lucide-react";
import { inviteeHelpers } from "../../api/invite.js";

const PassPreviewModal = ({
  showPassPreview,
  setShowPassPreview,
  selectedInvite,
  handleDownloadPass,
}) => {
  if (!showPassPreview || !selectedInvite) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => setShowPassPreview(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Visitor Pass Preview
          </h3>
          <p className="text-gray-600">Download your pass</p>
        </div>

        <div
          id="pass-preview"
          className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6"
        >
          <div className="text-center mb-4">
            <h4 className="text-lg font-bold">VISITOR PASS</h4>
            <p className="text-blue-100 text-sm">Wish Geeks Techserve</p>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20">
              {selectedInvite.image ? (
                <img
                  src={selectedInvite.image}
                  alt="Visitor"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white/60" />
                </div>
              )}
            </div>
            <div>
              <h5 className="font-bold text-lg">
                {selectedInvite.visitor_name}
              </h5>
              <p className="text-blue-100 text-sm">
                {selectedInvite.visitor_email}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-100">Visit Time:</span>
              <span>
                {inviteeHelpers.formatDateTime(selectedInvite.visit_time)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Purpose:</span>
              <span>{selectedInvite.purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Invite Code:</span>
              <span>{selectedInvite.invite_code}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowPassPreview(false)}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
          <button
            onClick={() => handleDownloadPass(selectedInvite)}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Pass</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PassPreviewModal;
