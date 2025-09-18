import React, { useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  RequestQuote as RequestQuoteIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem, useManualSearch } from '../../hooks';
import { useLoanRequests, useDeleteLoanRequest, useRestoreLoanRequest, useLoanRequestStatistics } from '../../services/queries/loan-requests';
import { FilterState } from '../../constants/filters';
import { LoanRequest } from '../../types/loanRequest';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================  
// TYPES & INTERFACES
// ============================================================================

interface LoanFilters extends FilterState {
  searchTerm: string;
  status: string;
}

// ============================================================================  
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Loan Requests',
  description: 'Manage loan requests from users',
} as const;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name, email, phone or NRC...',
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    options: [
      { value: '', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'under_review', label: 'Under Review' },
    ],
  },
];

// ============================================================================  
// MAIN COMPONENT
// ============================================================================

const LoanRequestListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================  
  // HOOKS & STATE
  // ========================================================================

  const { filters, setFilter } = useFilters<LoanFilters>({
    searchTerm: '', // This will be overridden by manual search
    status: '',
  });

  // Manual search: only triggers on Enter key or search button click
  const {
    searchValue,
    searchTerm,
    handleInputChange,
    triggerSearch,
    clearSearch,
    handleKeyPress,
  } = useManualSearch('');

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Tab state for active/deleted loan requests
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // API Queries - Fetch a larger dataset for client-side filtering
  const { data: loanRequestsResponse, isLoading, error } = useLoanRequests({
    page: 1, // Fetch first page
    per_page: 90, // Fetch a larger number to accommodate both active and deleted requests
    search: searchTerm || undefined, // Use manual search term
    status: filters.status || undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // API Query - Fetch loan request statistics
  const { data: statistics } = useLoanRequestStatistics();

  // Delete and restore mutations
  const deleteLoanRequestMutation = useDeleteLoanRequest();
  const restoreLoanRequestMutation = useRestoreLoanRequest();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // ========================================================================  
  // EVENT HANDLERS
  // ========================================================================

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Reset to first page when switching tabs
    handleChangePage(event, 0);
  };

  // Custom filter change handler that handles search input specially
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      // Use manual search for search input
      handleInputChange(value);
    } else {
      // Use regular filter for other inputs
      setFilter(key as keyof LoanFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();
    
    // Reset all filters to default values
    setFilter('status', '');
    
    // Reset to first page
    handleChangePage({} as any, 0);
  };

  const handleDeleteLoanRequest = (loanRequest: LoanRequest) => {
    openDeleteConfirmation(
      `Loan Request #${loanRequest.id}`,
      'loan request',
      async () => {
        try {
          await deleteLoanRequestMutation.mutateAsync(loanRequest.slug);
          showSuccess(`Loan Request #${loanRequest.id} deleted successfully!`);
        } catch (error: any) {
          showError(error.message || 'Failed to delete loan request. Please try again.');
        }
      }
    );
  };

  const handleRestoreLoanRequest = async (loanRequest: LoanRequest) => {
    try {
      await restoreLoanRequestMutation.mutateAsync(loanRequest.slug);
      showSuccess(`Loan Request #${loanRequest.id} restored successfully!`);
    } catch (error: any) {
      showError(error.message || 'Failed to restore loan request. Please try again.');
    }
  };

  // ========================================================================  
  // DATA PROCESSING
  // ========================================================================

  // Extract loan requests data
  const allLoanRequests = loanRequestsResponse?.data || [];
  
  // Filter loan requests based on active/deleted status
  const filteredLoanRequests = useMemo(() => {
    return allLoanRequests.filter((loanRequest) => {
      // Filter by active/deleted status based on tab
      const matchesDeletedStatus = activeTab === 0 
        ? loanRequest.deleted_at === null  // Active tab: show non-deleted requests
        : loanRequest.deleted_at !== null; // Deleted tab: show deleted requests
      
      // Filter by search term
      const matchesSearch = !filters.search || 
        (loanRequest.full_name?.toLowerCase().includes(filters.search.toLowerCase())) ||
        (loanRequest.email?.toLowerCase().includes(filters.search.toLowerCase())) ||
        (loanRequest.phone?.toLowerCase().includes(filters.search.toLowerCase())) ||
        (loanRequest.nrc_number?.toLowerCase().includes(filters.search.toLowerCase())) ||
        (loanRequest.user?.name?.toLowerCase().includes(filters.search.toLowerCase()));
      
      // Filter by status
      const matchesStatus = !filters.status || 
        loanRequest.status === filters.status;
      
      return matchesDeletedStatus && matchesSearch && matchesStatus;
    });
  }, [allLoanRequests, activeTab, filters]);

  // Paginate data
  const paginatedLoanRequests = useMemo(() => {
    return filteredLoanRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredLoanRequests, page, rowsPerPage]);

  // ========================================================================  
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Requests',
      value: statistics?.data?.total_count || allLoanRequests.length,
      color: 'primary',
      icon: <RequestQuoteIcon />,
    },
    {
      title: 'Pending',
      value: statistics?.data?.pending_count || allLoanRequests.filter(lr => lr.status === 'pending' && lr.deleted_at === null).length,
      color: 'warning',
      icon: <RequestQuoteIcon />,
    },
    {
      title: 'Approved',
      value: statistics?.data?.approved_count || allLoanRequests.filter(lr => lr.status === 'approved' && lr.deleted_at === null).length,
      color: 'success',
      icon: <RequestQuoteIcon />,
    },
    {
      title: 'Rejected',
      value: statistics?.data?.rejected_count || allLoanRequests.filter(lr => lr.status === 'rejected' && lr.deleted_at === null).length,
      color: 'error',
      icon: <RequestQuoteIcon />,
    },
    {
      title: 'Under Review',
      value: statistics?.data?.under_review_count || allLoanRequests.filter(lr => lr.status === 'under_review' && lr.deleted_at === null).length,
      color: 'info',
      icon: <RequestQuoteIcon />,
    },
  ], [statistics, allLoanRequests]);

  // ========================================================================  
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<LoanRequest>[] = useMemo(() => [
    // {
    //   id: 'id',
    //   label: 'ID',
    //   render: (_value, row) => (
    //     <Typography variant="body2" fontWeight="500">
    //       #{row.id}
    //     </Typography>
    //   ),
    // },
    {
      id: 'full_name',
      label: 'Applicant',
      render: (_value, row) => (
        <Typography variant="body2">
          {row.full_name}
        </Typography>
      ),
    },
    {
      id: 'user',
      label: 'User',
      render: (_value, row) => (
        <Typography variant="body2">
          {row.user?.name || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'requested_amount',
      label: 'Requested Amount',
      render: (_value, row) => (
        <Typography variant="body2" fontWeight="500">
          {formatCurrency(parseFloat(row.requested_amount))}
        </Typography>
      ),
    },
    {
      id: 'property_type',
      label: 'Property Type',
      render: (_value, row) => (
        <Typography variant="body2">
          {row.property_type?.name_en || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <StatusChip status={row.status} size="small" />
      ),
    },
    {
      id: 'created_at',
      label: 'Requested',
      render: (_value, row) => (
        <Typography variant="body2" color="textSecondary">
          {row.created_at ? formatDate(row.created_at, 'display') : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          {activeTab === 0 ? (
            <>
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/loan-requests/${row.slug}`)}
                  color="primary"
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteLoanRequest(row)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/loan-requests/${row.slug}`)}
                  color="primary"
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={() => handleRestoreLoanRequest(row)}
                  color="success"
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ], [activeTab, navigate, showSuccess, showError]);

  // ========================================================================  
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (loanRequest: LoanRequest): MobileCardAction[] => {
    if (activeTab === 0) {
      return [
        {
          icon: <ViewIcon />,
          tooltip: 'View Details',
          color: 'primary',
          onClick: () => navigate(`/loan-requests/${loanRequest.slug}`),
        },
        {
          icon: <DeleteIcon />,
          tooltip: 'Delete',
          color: 'error',
          onClick: () => handleDeleteLoanRequest(loanRequest),
        },
      ];
    } else {
      return [
        {
          icon: <ViewIcon />,
          tooltip: 'View Details',
          color: 'primary',
          onClick: () => navigate(`/loan-requests/${loanRequest.slug}`),
        },
        {
          icon: <RestoreIcon />,
          tooltip: 'Restore',
          color: 'success',
          onClick: () => handleRestoreLoanRequest(loanRequest),
        },
      ];
    }
  };

  // ========================================================================  
  // RENDER
  // ========================================================================

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader
          title={PAGE_CONFIG.title}
          breadcrumbs="Dashboard / Loan Requests"
          subtitle={PAGE_CONFIG.description}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="body1">Loading loan requests...</Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Loan Requests"
        message={(error as any).message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / Loan Requests"
        subtitle={PAGE_CONFIG.description}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Active/Deleted Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="loan request status tabs"
        >
          <Tab 
            label={`Active Requests (${allLoanRequests.filter(lr => lr.deleted_at === null).length})`} 
            id="loan-request-tab-0"
            aria-controls="loan-request-tabpanel-0"
          />
          <Tab 
            label={`Deleted Requests (${allLoanRequests.filter(lr => lr.deleted_at !== null).length})`} 
            id="loan-request-tab-1"
            aria-controls="loan-request-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Filters */}
      <StandardFilters
        filters={{
          ...filters,
          searchTerm: searchValue, // Use current search value for immediate UI feedback
        }}
        onFilterChange={handleFilterChange}
        fields={FILTER_FIELDS}
        onSearchKeyPress={handleKeyPress}
        onSearchClick={triggerSearch}
        showSearchButton={true}
        onClearFilters={handleClearFilters}
        showClearButton={true}
      />

      {/* Empty state */}
      {filteredLoanRequests.length === 0 && !isLoading && (
        <PageEmptyState
          title="No Loan Requests Found"
          message={filters.search || filters.status
            ? "No loan requests match your current filters. Try adjusting your search criteria."
            : activeTab === 0
              ? "No active loan requests have been created yet."
              : "No deleted loan requests found."
          }
        />
      )}

      {/* Mobile Card Layout */}
      {isMobile && filteredLoanRequests.length > 0 ? (
        <Box>
          {paginatedLoanRequests.map((loanRequest) => (
            <MobileCard
              key={loanRequest.id}
              title={loanRequest.full_name}
              subtitle={loanRequest.email}
              description={`${loanRequest.property_type?.name_en || 'N/A'} • ${formatCurrency(parseFloat(loanRequest.requested_amount))}`}
              avatar={<RequestQuoteIcon />}
              avatarColor="primary.main"
              status={{
                label: loanRequest.status,
                color: 'default',
              }}
              chips={[
                {
                  label: formatCurrency(parseFloat(loanRequest.requested_amount)),
                  color: 'primary',
                },
              ]}
              actions={createMobileCardActions(loanRequest)}
              onClick={() => navigate(`/loan-requests/${loanRequest.slug}`)}
              clickable={true}
            />
          ))}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredLoanRequests.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        filteredLoanRequests.length > 0 && (
          <StandardTable
            columns={columns}
            data={paginatedLoanRequests}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredLoanRequests.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(row) => row.id}
          />
        )
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteLoanRequestMutation.isPending}
        error={deleteLoanRequestMutation.error?.message}
      />
    </Box>
  );
};

export default LoanRequestListPage;