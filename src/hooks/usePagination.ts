import { useState, useCallback } from 'react';
import { DEFAULT_PAGE, DEFAULT_ROWS_PER_PAGE, PaginationState, PaginationHandlers } from '../constants/pagination';

export const usePagination = (
  initialPage: number = DEFAULT_PAGE,
  initialRowsPerPage: number = DEFAULT_ROWS_PER_PAGE
): PaginationState & PaginationHandlers => {
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

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  };
}; 