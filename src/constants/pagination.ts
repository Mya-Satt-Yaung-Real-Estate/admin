// Standard pagination options used throughout the application
export const PAGINATION_OPTIONS = [5, 10, 25, 50] as const;
export const DEFAULT_ROWS_PER_PAGE = 10;
export const DEFAULT_PAGE = 0;

// Pagination configuration
export const PAGINATION_CONFIG = {
  options: PAGINATION_OPTIONS,
  defaultRowsPerPage: DEFAULT_ROWS_PER_PAGE,
  defaultPage: DEFAULT_PAGE,
  maxRowsPerPage: 100,
} as const;

// Pagination types
export interface PaginationState {
  page: number;
  rowsPerPage: number;
}

export interface PaginationHandlers {
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
} 