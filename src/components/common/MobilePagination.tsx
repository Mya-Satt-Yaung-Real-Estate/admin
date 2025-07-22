import React from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

export interface MobilePaginationProps {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  showResultsInfo?: boolean;
}

export const MobilePagination: React.FC<MobilePaginationProps> = ({
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  showResultsInfo = true,
}) => {
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startItem = page * rowsPerPage + 1;
  const endItem = Math.min((page + 1) * rowsPerPage, totalCount);

  const handlePrevious = () => {
    if (page > 0) {
      onPageChange(null, page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      onPageChange(null, page + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      {showResultsInfo && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Showing {startItem} to {endItem} of {totalCount} results
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
        <IconButton
          disabled={page === 0}
          onClick={handlePrevious}
          size="small"
          color="primary"
        >
          <NavigateBeforeIcon />
        </IconButton>
        
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', minWidth: '80px', justifyContent: 'center' }}>
          Page {page + 1} of {totalPages}
        </Typography>
        
        <IconButton
          disabled={page >= totalPages - 1}
          onClick={handleNext}
          size="small"
          color="primary"
        >
          <NavigateNextIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MobilePagination; 