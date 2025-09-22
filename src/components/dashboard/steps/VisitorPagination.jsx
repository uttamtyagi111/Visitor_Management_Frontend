import React from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Pagination Component for Visitors
export const VisitorPagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  handlePageChange,
  loading,
}) => {
  if (totalItems <= itemsPerPage) {
    return null;
  }

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing{" "}
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}{" "}
          to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
          {totalItems} visitors
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {Array.from(
              {
                length: Math.min(
                  5,
                  Math.ceil(totalItems / itemsPerPage)
                ),
              },
              (_, i) => {
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                let pageNumber;

                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === pageNumber
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNumber}
                  </button>
                );
              }
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={
              currentPage >= Math.ceil(totalItems / itemsPerPage) ||
              loading
            }
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
