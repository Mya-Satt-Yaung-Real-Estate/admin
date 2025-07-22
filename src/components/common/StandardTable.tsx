import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PAGINATION_CONFIG } from '../../constants/pagination';

export interface TableColumn<T> {
  id: keyof T | string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  hidden?: boolean;
}

export interface StandardTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  emptyMessage?: string;
  getRowKey?: (row: T, index: number) => string | number;
  onRowClick?: (row: T, index: number) => void;
  hover?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string | number;
}

export function StandardTable<T>({
  columns,
  data,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  emptyMessage = 'No data available',
  getRowKey = (_row: T, index: number) => index,
  onRowClick,
  hover = true,
  stickyHeader = true,
  maxHeight,
}: StandardTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filter out hidden columns
  const visibleColumns = columns.filter(col => !col.hidden);

  const handleRowClick = (row: T, index: number) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const renderCell = (column: TableColumn<T>, row: T, index: number) => {
    const value = typeof column.id === 'string' ? (row as any)[column.id] : row[column.id];
    
    if (column.render) {
      return column.render(value, row, index);
    }
    
    return (
      <Typography variant="body2" color="textSecondary">
        {value || '-'}
      </Typography>
    );
  };

  if (isMobile) {
    return (
      <Box>
        {data.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {emptyMessage}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.map((row, index) => (
              <Paper
                key={getRowKey(row, index)}
                sx={{
                  p: 2,
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': onRowClick ? { backgroundColor: 'action.hover' } : {},
                }}
                onClick={() => handleRowClick(row, index)}
              >
                {visibleColumns.map((column) => (
                  <Box key={column.id as string} sx={{ mb: 1 }}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {column.label}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {renderCell(column, row, index)}
                    </Box>
                  </Box>
                ))}
              </Paper>
            ))}
          </Box>
        )}
        <TablePagination
          rowsPerPageOptions={PAGINATION_CONFIG.options}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id as string}
                  align={column.align || 'left'}
                  sx={{
                    width: column.width,
                    fontWeight: 600,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={getRowKey(row, index)}
                  hover={hover}
                  onClick={() => handleRowClick(row, index)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                >
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.id as string}
                      align={column.align || 'left'}
                      sx={{ width: column.width }}
                    >
                      {renderCell(column, row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={PAGINATION_CONFIG.options}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
} 