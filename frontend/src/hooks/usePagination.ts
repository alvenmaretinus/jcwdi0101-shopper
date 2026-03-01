import { useState } from 'react';
import { PaginationState } from '@/types/common';

const PAGINATION_LIMIT = 20;

export function usePagination(initialPage = 1) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: PAGINATION_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [currentPage, setCurrentPage] = useState(initialPage);

  const updatePagination = (data: Omit<PaginationState, 'limit'>) => {
    setPagination(prev => ({
      ...prev,
      ...data,
    }));
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    pagination,
    currentPage,
    setCurrentPage,
    updatePagination,
    resetPage,
    limit: PAGINATION_LIMIT,
  };
}
