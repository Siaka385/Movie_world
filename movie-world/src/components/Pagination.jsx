import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { generatePageNumbers, getItemsRange } from '../utils/apiHelpers.js';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalResults, 
  itemsPerPage = 20,
  onPageChange,
  showInfo = true,
  maxVisible = 5,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers = generatePageNumbers(currentPage, totalPages, maxVisible);
  const { start, end } = getItemsRange(currentPage, itemsPerPage, totalResults);
  
  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const PaginationButton = ({ page, children, disabled = false, active = false }) => {
    const baseClasses = 'px-3 py-2 text-sm font-medium rounded-lg transition-colors border';
    const activeClasses = 'bg-blue-600 text-white border-blue-600';
    const inactiveClasses = 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:text-white hover:border-gray-500';
    const disabledClasses = 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed';
    
    const classes = `${baseClasses} ${
      disabled 
        ? disabledClasses 
        : active 
        ? activeClasses 
        : inactiveClasses
    }`;

    return (
      <button
        onClick={() => !disabled && handlePageClick(page)}
        disabled={disabled}
        className={classes}
        aria-label={`Go to page ${page}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results Info */}
      {showInfo && (
        <div className="text-sm text-gray-400">
          Showing <span className="font-medium text-white">{start}</span> to{' '}
          <span className="font-medium text-white">{end}</span> of{' '}
          <span className="font-medium text-white">{totalResults.toLocaleString()}</span> results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <PaginationButton 
          page={currentPage - 1} 
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </PaginationButton>

        {/* First Page */}
        {pageNumbers[0] > 1 && (
          <>
            <PaginationButton page={1}>1</PaginationButton>
            {pageNumbers[0] > 2 && (
              <span className="px-2 py-2 text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map(page => (
          <PaginationButton 
            key={page} 
            page={page} 
            active={page === currentPage}
          >
            {page}
          </PaginationButton>
        ))}

        {/* Last Page */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 py-2 text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            )}
            <PaginationButton page={totalPages}>{totalPages}</PaginationButton>
          </>
        )}

        {/* Next Button */}
        <PaginationButton 
          page={currentPage + 1} 
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </PaginationButton>
      </div>
    </div>
  );
};

export default Pagination;
