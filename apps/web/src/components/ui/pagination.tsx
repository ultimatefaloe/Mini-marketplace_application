// components/ui/pagination.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { IPaginationMeta } from '@/types';

interface PaginationProps {
  meta: IPaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  showPageSize?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  meta,
  onPageChange,
  className,
  showInfo = true,
  showPageSize = false,
}) => {
  const { page, totalPages, total, limit } = meta;
  const maxVisiblePages = 5;

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, and pages around current page
      pages.push(1);
      
      if (page > 3) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onPageChange(newPage);
    }
  };

  if (total === 0) return null;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showInfo && (
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">
            {Math.min((page - 1) * limit + 1, total)}
          </span> to <span className="font-semibold">
            {Math.min(page * limit, total)}
          </span> of <span className="font-semibold">{total}</span> products
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Page size selector */}
        {showPageSize && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show:</span>
            <select 
              className="border rounded px-2 py-1 text-sm bg-transparent"
              value={limit}
              onChange={() => onPageChange(1)} // Reset to page 1 when changing limit
            >
              {[12, 24, 36, 48].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page numbers */}
          {getPageNumbers().map((pageNum, index) => (
            pageNum === 'ellipsis' ? (
              <Button
                key={`ellipsis-${index}`}
                variant="outline"
                size="icon"
                className="w-9 h-9 cursor-default hover:bg-transparent"
                disabled
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="icon"
                className={cn(
                  "w-9 h-9 text-sm",
                  pageNum === page && "bg-mmp-primary hover:bg-mmp-primary2 text-white"
                )}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            )
          ))}

          {/* Next button */}
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Jump to page (desktop only) */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
          <span>Go to:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            defaultValue={page}
            className="w-16 border rounded px-2 py-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const inputPage = parseInt(e.currentTarget.value);
                if (!isNaN(inputPage)) {
                  handlePageChange(Math.min(Math.max(1, inputPage), totalPages));
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Mobile-friendly compact pagination
interface CompactPaginationProps {
  meta: IPaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export const CompactPagination: React.FC<CompactPaginationProps> = ({
  meta,
  onPageChange,
  className,
}) => {
  const { page, totalPages } = meta;

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 max-w-[120px]"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>
      
      <span className="text-sm text-gray-600 px-4">
        Page {page} of {totalPages}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        className="flex-1 max-w-[120px]"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};