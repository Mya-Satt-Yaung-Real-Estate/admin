import { useState, useCallback } from 'react';
import { PAGINATION_CONFIG, PaginationState, PaginationHandlers } from '../constants/pagination';

export interface ExtendedPaginationHandlers extends PaginationHandlers {
  resetPagination: () => void;
}

export const usePagination = (
  initialPage: number = PAGINATION_CONFIG.defaultPage,
  initialRowsPerPage: number = PAGINATION_CONFIG.defaultRowsPerPage
): PaginationState & ExtendedPaginationHandlers => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  }, []);

  const resetPagination = useCallback(() => {
    setPage(PAGINATION_CONFIG.defaultPage);
    setRowsPerPage(PAGINATION_CONFIG.defaultRowsPerPage);
  }, []);

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPagination,
  };
}; 