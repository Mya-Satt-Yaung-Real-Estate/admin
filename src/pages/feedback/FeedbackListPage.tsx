import React, { useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Feedback as FeedbackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert, Pagination } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useFeedbacks, useDeleteFeedback } from '../../services/queries/feedback';
import { FilterState } from '../../constants/filters';
import { Feedback } from '../../types/feedback';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FeedbackFilters extends FilterState {
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
  user_name: string;
  email: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'User Feedback Management',
  description: 'View and manage user feedback submissions',
  createButtonText: 'Add Feedback',
  createButtonPath: '/feedback/create',
} as const;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by user name, email, or feedback content...',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FeedbackListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Hooks
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  const { filters, setFilter, resetFilters } = useFilters<FeedbackFilters>({
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    user_name: '',
    email: '',
  });
  
  // Create a custom reset function that ensures all fields are cleared
  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);
  
  const { showSuccess, showError } = useAlertSystem();
  const { 
    deleteState, 
    openDeleteConfirmation, 
    closeDeleteConfirmation, 
    handleConfirmDelete 
  } = useDeleteConfirmation();

  // API Queries - Fetch all data once for client-side filtering
  const { data: feedbacksResponse, isLoading, error, refetch } = useFeedbacks({
    page: 1,
    per_page: 1000, // Fetch all data
  });

  const deleteFeedbackMutation = useDeleteFeedback();

  // Data processing
  const allFeedbacks = feedbacksResponse?.data || [];

  // Client-side filtering
  const filteredFeedbacks = useMemo(() => {
    let filtered = allFeedbacks;

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(feedback => 
        (feedback.user_name && feedback.user_name.toLowerCase().includes(searchLower)) ||
        (feedback.email && feedback.email.toLowerCase().includes(searchLower)) ||
        (feedback.feedback && feedback.feedback.toLowerCase().includes(searchLower)) ||
        (feedback.slug && feedback.slug.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [allFeedbacks, filters.searchTerm]);
  
  // Log filter changes for debugging
  useEffect(() => {
    console.log('Filters changed:', filters);
  }, [filters]);

  // Client-side pagination
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredFeedbacks.slice(startIndex, endIndex);
  }, [filteredFeedbacks, page, rowsPerPage]);

  // Use filtered and paginated data
  const feedbacks = paginatedFeedbacks;

  // Reset page to 0 when filters change
  useEffect(() => {
    handleChangePage(null, 0);
  }, [filters.searchTerm, handleChangePage]);

  // Statistics
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Feedbacks',
      value: filteredFeedbacks.length.toString(),
      color: 'primary',
      icon: <FeedbackIcon />,
    },
    {
      title: 'This Month',
      value: filteredFeedbacks.filter(feedback => {
        if (!feedback.created_at) return false;
        const feedbackDate = new Date(feedback.created_at);
        const now = new Date();
        return feedbackDate.getMonth() === now.getMonth() && 
               feedbackDate.getFullYear() === now.getFullYear();
      }).length.toString(),
      color: 'info',
      icon: <FeedbackIcon />,
    },
    {
      title: 'Recent (7 days)',
      value: filteredFeedbacks.filter(feedback => {
        if (!feedback.created_at) return false;
        const feedbackDate = new Date(feedback.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return feedbackDate >= weekAgo;
      }).length.toString(),
      color: 'success',
      icon: <FeedbackIcon />,
    },
  ], [filteredFeedbacks]);

  // Event handlers
  const handleDeleteFeedback = async (feedback: Feedback) => {
    // Ensure we're working with a proper string value
    const userName = feedback.user_name ? String(feedback.user_name) : 'Unknown User';
    
    openDeleteConfirmation(
      userName,
      'feedback',
      async () => {
        try {
          const slug = feedback.slug || '';
          if (!slug) {
            throw new Error('Feedback slug is missing');
          }
          
          await deleteFeedbackMutation.mutateAsync(slug);
          showSuccess(`Feedback from ${userName} deleted successfully!`);
          refetch();
        } catch (error: any) {
          console.error('Delete feedback error:', error);
          showError(error.message || 'Failed to delete feedback.');
        }
      }
    );
  };

  // Table columns configuration
  const columns: TableColumn<Feedback>[] = [
    {
      id: 'user',
      label: 'User',
      sortable: true,
      render: (_, feedback) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {feedback.user_name || 'Unknown User'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      sortable: false,
      render: (_, feedback) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="caption" color="textSecondary">
              {feedback.email || 'No email'}
            </Typography>
          </Box>
          {feedback.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="caption" color="textSecondary">
                {feedback.phone}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'feedback',
      label: 'Feedback',
      sortable: false,
      render: (_, feedback) => (
        <Box sx={{ maxWidth: 300 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {feedback.feedback || 'No feedback content'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'created_at',
      label: 'Submitted',
      sortable: true,
      render: (_, feedback) => (
        <Box>
          <Typography variant="body2">
            {feedback.created_at ? formatDate(feedback.created_at) : 'Unknown date'}
          </Typography>
          {/* {feedback.created_at && (
            <Typography variant="caption" color="textSecondary">
              {new Date(feedback.created_at).toLocaleTimeString()}
            </Typography>
          )} */}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, feedback) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/feedback/${feedback.slug}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Feedback">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteFeedback(feedback)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Mobile card actions
  const getMobileCardActions = (feedback: Feedback): MobileCardAction[] => [
    {
      icon: <VisibilityIcon />,
      color: 'primary',
      tooltip: 'View Details',
      onClick: () => navigate(`/feedback/${feedback.slug}`),
    },
    {
      icon: <DeleteIcon />,
      color: 'error',
      tooltip: 'Delete Feedback',
      onClick: () => handleDeleteFeedback(feedback),
    },
  ];

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Feedback Management"
        subtitle={PAGE_CONFIG.description}
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof FeedbackFilters, value)}
        fields={FILTER_FIELDS}
        showClearButton={true}
        onClearFilters={handleResetFilters}
      />

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="body1">Loading feedbacks...</Typography>
        </Box>
      )}

      {/* Error state */}
      {error && (
        <PageErrorState 
          error={error} 
          onRetry={refetch}
          title="Failed to load feedbacks"
        />
      )}

      {/* Empty state - shown when no feedbacks match filters */}
      {!isLoading && !error && feedbacks.length === 0 && (
        <PageEmptyState
          title="No Feedbacks Found"
          message={filters.searchTerm
            ? "No feedbacks match your current filters. Try adjusting your search criteria."
            : "No feedbacks have been submitted yet."
          }
        />
      )}

      {/* Table/Cards */}
      {!isLoading && !error && feedbacks.length > 0 && isMobile && (
        <Box sx={{ mt: 2 }}>
          {feedbacks.map((feedback) => (
            <MobileCard
              key={feedback.id}
              title={feedback.user_name || 'Unknown User'}
              subtitle={`${feedback.email || 'No Email'} • ${feedback.created_at ? formatDate(feedback.created_at) : 'Unknown Date'}`}
              actions={getMobileCardActions(feedback)}
            />
          ))}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredFeedbacks.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      )}

      {/* Desktop Table Layout */}
      {!isLoading && !error && feedbacks.length > 0 && !isMobile && (
        <StandardTable
          columns={columns}
          data={feedbacks}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredFeedbacks.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete Feedback"
        isLoading={deleteFeedbackMutation.isPending}
      />

      {/* Action Alert */}
      <ActionAlert />
    </Box>
  );
};

export default FeedbackListPage;
