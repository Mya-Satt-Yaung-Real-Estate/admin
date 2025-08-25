import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
} from '@mui/icons-material';
import { PAGINATION_OPTIONS } from '../../constants/pagination';

export interface PaginationProps {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showResultsInfo?: boolean;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  showResultsInfo = true,
  disabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startItem = totalCount > 0 ? page * rowsPerPage + 1 : 0;
  const endItem = Math.min((page + 1) * rowsPerPage, totalCount);

  // Don't render if only one page or no data
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && !disabled) {
      onPageChange(null, newPage);
    }
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    if (onRowsPerPageChange) {
      // Convert SelectChangeEvent to ChangeEvent<HTMLInputElement>
      const syntheticEvent = {
        target: {
          value: event.target.value.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onRowsPerPageChange(syntheticEvent);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const currentPage = page + 1;
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const renderPageButton = (pageNum: number | string, index: number) => {
    const isCurrentPage = pageNum === page + 1;
    const isEllipsis = pageNum === '...';
    
    if (isEllipsis) {
      return (
        <Typography
          key={`ellipsis-${index}`}
          variant="body2"
          sx={{
            px: 1,
            color: theme.palette.text.secondary,
            userSelect: 'none',
            fontWeight: 500,
          }}
        >
          ...
        </Typography>
      );
    }

    return (
      <Button
        key={pageNum}
        variant="outlined"
        size="small"
        onClick={() => handlePageChange(Number(pageNum) - 1)}
        disabled={disabled}
        sx={{
          minWidth: 36,
          height: 36,
          borderRadius: 2,
          fontWeight: isCurrentPage ? 600 : 500,
          fontSize: '0.875rem',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          backgroundColor: isCurrentPage ? '#ffffff' : 'transparent',
          color: isCurrentPage ? '#3B8880' : '#64748B',
          borderColor: isCurrentPage ? '#3B8880' : '#E2E8F0',
          borderWidth: '1px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: isCurrentPage 
              ? '#ffffff' 
              : '#F0F9F8',
            borderColor: isCurrentPage 
              ? '#3B8880' 
              : '#3B8880',
            color: isCurrentPage ? '#3B8880' : '#3B8880',
            transform: 'scale(1.02)',
            boxShadow: '0 2px 4px rgba(59, 136, 128, 0.1)',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(59, 136, 128, 0.2)',
          },
          '&:disabled': {
            backgroundColor: '#F1F5F9',
            color: '#94A3B8',
            borderColor: '#E2E8F0',
            transform: 'none',
            boxShadow: 'none',
          },
        }}
      >
        {pageNum}
      </Button>
    );
  };

  // Mobile pagination (prev/next only with rows per page selector)
  if (isMobile) {
    return (
      <Box sx={{ mt: 3 }}>
        {showResultsInfo && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography 
              variant="body2" 
              sx={{
                color: '#64748B',
                fontSize: '0.875rem',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 500,
              }}
            >
              Showing {startItem} to {endItem} of {totalCount} results
            </Typography>
            
            {/* Mobile rows per page selector */}
            {onRowsPerPageChange && (
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  disabled={disabled}
                  sx={{
                    fontSize: '0.75rem',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    '& .MuiSelect-select': {
                      py: 0.5,
                      px: 1,
                      color: '#1E293B',
                      fontWeight: 500,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E2E8F0',
                      borderRadius: 1,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3B8880',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3B8880',
                      borderWidth: '2px',
                    },
                    '& .MuiSelect-icon': {
                      color: '#3B8880',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {PAGINATION_OPTIONS.map((option) => (
                    <MenuItem 
                      key={option} 
                      value={option} 
                      sx={{ 
                        fontSize: '0.75rem',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: 500,
                        color: '#1E293B',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(59, 136, 128, 0.08)',
                          color: '#3B8880',
                          fontWeight: 600,
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(59, 136, 128, 0.04)',
                        },
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 1, 
          alignItems: 'center' 
        }}>
          <IconButton
            disabled={page === 0 || disabled}
            onClick={() => handlePageChange(page - 1)}
            size="small"
            sx={{
              color: '#3B8880',
              backgroundColor: 'transparent',
              borderRadius: '50%',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(59, 136, 128, 0.08)',
                transform: 'scale(1.05)',
              },
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(59, 136, 128, 0.2)',
              },
              '&:disabled': {
                color: '#94A3B8',
                backgroundColor: 'transparent',
                transform: 'none',
              },
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          
          <Typography 
            variant="body2" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              minWidth: '80px', 
              justifyContent: 'center',
              fontWeight: 600,
              color: '#1E293B',
              fontSize: '0.875rem',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}
          >
            Page {page + 1} of {totalPages}
          </Typography>
          
          <IconButton
            disabled={page >= totalPages - 1 || disabled}
            onClick={() => handlePageChange(page + 1)}
            size="small"
            sx={{
              color: '#3B8880',
              backgroundColor: 'transparent',
              borderRadius: '50%',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(59, 136, 128, 0.08)',
                transform: 'scale(1.05)',
              },
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(59, 136, 128, 0.2)',
              },
              '&:disabled': {
                color: '#94A3B8',
                backgroundColor: 'transparent',
                transform: 'none',
              },
            }}
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  // Desktop pagination (full controls)
  return (
    <Box sx={{ 
      mt: 3,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      {showResultsInfo && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: 1,
        }}>
          <Typography variant="body2" color="textSecondary">
            Showing {startItem} to {endItem} of {totalCount} results
          </Typography>
          
          {/* Desktop rows per page selector */}
          {onRowsPerPageChange && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{
                  color: '#64748B',
                  fontSize: '0.875rem',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontWeight: 500,
                }}
              >
                Rows per page:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  disabled={disabled}
                  sx={{
                    fontSize: '0.875rem',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    '& .MuiSelect-select': {
                      py: 0.75,
                      px: 1.5,
                      color: '#1E293B',
                      fontWeight: 500,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E2E8F0',
                      borderRadius: 1,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3B8880',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3B8880',
                      borderWidth: '2px',
                    },
                    '& .MuiSelect-icon': {
                      color: '#3B8880',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {PAGINATION_OPTIONS.map((option) => (
                    <MenuItem 
                      key={option} 
                      value={option}
                      sx={{
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: 500,
                        color: '#1E293B',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(59, 136, 128, 0.08)',
                          color: '#3B8880',
                          fontWeight: 600,
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(59, 136, 128, 0.04)',
                        },
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: 1,
      }}>
        {/* First page button */}
        <IconButton
          disabled={page === 0 || disabled}
          onClick={() => handlePageChange(0)}
          size="small"
          sx={{
            color: '#3B8880',
            backgroundColor: 'transparent',
            borderRadius: '50%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(59, 136, 128, 0.08)',
              transform: 'scale(1.05)',
            },
            '&:focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(59, 136, 128, 0.2)',
            },
            '&:disabled': {
              color: '#94A3B8',
              backgroundColor: 'transparent',
              transform: 'none',
            },
          }}
        >
          <FirstPageIcon />
        </IconButton>

        {/* Previous page button */}
        <IconButton
          disabled={page === 0 || disabled}
          onClick={() => handlePageChange(page - 1)}
          size="small"
          sx={{
            color: '#3B8880',
            backgroundColor: 'transparent',
            borderRadius: '50%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(59, 136, 128, 0.08)',
              transform: 'scale(1.05)',
            },
            '&:focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(59, 136, 128, 0.2)',
            },
            '&:disabled': {
              color: '#94A3B8',
              backgroundColor: 'transparent',
              transform: 'none',
            },
          }}
        >
          <NavigateBeforeIcon />
        </IconButton>

        {/* Page numbers */}
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5, 
          alignItems: 'center',
          mx: 1,
        }}>
          {getPageNumbers().map((pageNum, index) => 
            renderPageButton(pageNum, index)
          )}
        </Box>

        {/* Next page button */}
        <IconButton
          disabled={page >= totalPages - 1 || disabled}
          onClick={() => handlePageChange(page + 1)}
          size="small"
          sx={{
            color: '#3B8880',
            backgroundColor: 'transparent',
            borderRadius: '50%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(59, 136, 128, 0.08)',
              transform: 'scale(1.05)',
            },
            '&:focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(59, 136, 128, 0.2)',
            },
            '&:disabled': {
              color: '#94A3B8',
              backgroundColor: 'transparent',
              transform: 'none',
            },
          }}
        >
          <NavigateNextIcon />
        </IconButton>

        {/* Last page button */}
        <IconButton
          disabled={page >= totalPages - 1 || disabled}
          onClick={() => handlePageChange(totalPages - 1)}
          size="small"
          sx={{
            color: '#3B8880',
            backgroundColor: 'transparent',
            borderRadius: '50%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(59, 136, 128, 0.08)',
              transform: 'scale(1.05)',
            },
            '&:focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(59, 136, 128, 0.2)',
            },
            '&:disabled': {
              color: '#94A3B8',
              backgroundColor: 'transparent',
              transform: 'none',
            },
          }}
        >
          <LastPageIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Pagination;
