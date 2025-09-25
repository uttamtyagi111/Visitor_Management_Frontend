import React from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  FileText,
} from "lucide-react";

// UI utility components for visitor management
export const getStatusBadge = (status) => {
  const styles = {
    checked_in: "bg-green-100 text-green-800 border-green-200",
    checked_out: "bg-gray-100 text-gray-800 border-gray-200",
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    approved: "bg-blue-100 text-blue-800 border-blue-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    created: "bg-indigo-100 text-indigo-800 border-indigo-200",
    revisit: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const icons = {
    checked_in: <CheckCircle className="w-4 h-4" />,
    checked_out: <XCircle className="w-4 h-4" />,
    scheduled: <Clock className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
    pending: <Clock className="w-4 h-4" />,
    created: <FileText className="w-4 h-4" />,
    revisit: <RotateCcw className="w-4 h-4" />,
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${
        styles[status] || styles.pending
      }`}
    >
      {icons[status] || icons.pending}
      <span className="capitalize">
        {status?.replace("_", " ") || "pending"}
      </span>
    </span>
  );
};

// Loading component
export const LoadingComponent = () => (
  <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading visitors...</p>
      </div>
    </div>
  </div>
);

// Error component
export const ErrorComponent = ({ error, onRetry }) => (
  <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <XCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Visitors
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

// Empty state component
export const EmptyStateComponent = () => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <Clock className="w-16 h-16 mx-auto" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No visitors found
    </h3>
    <p className="text-gray-600">
      No visitors match your current filters. Try adjusting your search criteria.
    </p>
  </div>
);
