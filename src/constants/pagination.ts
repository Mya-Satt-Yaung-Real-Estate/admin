// Standard pagination options used throughout the application
export const PAGINATION_OPTIONS = [5, 10, 25, 50] as const;
export const DEFAULT_ROWS_PER_PAGE = 10;
export const DEFAULT_PAGE = 0;

// Pagination types
export interface PaginationState {
  page: number;
  rowsPerPage: number;
}

export interface PaginationHandlers {
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
} 