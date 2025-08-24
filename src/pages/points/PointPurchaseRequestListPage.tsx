import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  ShoppingCart as OrderIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { usePointPurchaseRequests, useDeletePointPurchaseRequest, useApproveRejectPointPurchaseRequest } from '../../services/queries/points';
import { FilterState } from '../../constants/filters';
import { PointPurchaseRequest, PointPurchaseRequestsResponse } from '../../types/point';
import { formatDate } from '../../constants/dateFormats';
import ApproveRejectDialog from '../../components/dialogs/ApproveRejectDialog';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PointPurchaseRequestFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  paymentMethodFilter: string;
}

interface ApproveRejectDialogState {
  open: boolean;
  type: 'approve' | 'reject';
  request: PointPurchaseRequest | null;
  notes: string;
  reason: string;
  payment_method: string;
  payment_reference: string;
  errors: {
    notes?: string;
    reason?: string;
    payment_method?: string;
    payment_reference?: string;
  };
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Point Purchase Requests',
  description: 'Manage point purchase requests from users',
  createButtonText: 'Add Request',
  createButtonPath: '/points/purchase-requests/create',
} as const;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by user name or request ID...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'paymentMethodFilter',
    type: 'select',
    label: 'Payment Method',
    options: [
      { value: 'allMethods', label: 'All Methods' },
      { value: 'bank_transfer', label: 'Bank Transfer' },
      { value: 'cash', label: 'Cash' },
      { value: 'mobile_money', label: 'Mobile Money' },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const PointPurchaseRequestListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for approve/reject dialog
  const [approveRejectDialog, setApproveRejectDialog] = useState<ApproveRejectDialogState>({
    open: false,
    type: 'approve',
    request: null,
    notes: '',
    reason: '',
    payment_method: '',
    payment_reference: '',
    errors: {},
  });

  // Hooks
  const { filters, setFilter } = useFilters<PointPurchaseRequestFilters>({
    searchTerm: '',
    statusFilter: 'all',
    paymentMethodFilter: 'allMethods',
  });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation, handleConfirmDelete } = useDeleteConfirmation();

  // Queries - Fetch all data once for client-side filtering
  const { data: requestsData, isLoading, error, refetch } = usePointPurchaseRequests({
    page: 1,
    per_page: 1000, // Fetch all data
  });

  const deleteRequestMutation = useDeletePointPurchaseRequest();
  const approveRejectMutation = useApproveRejectPointPurchaseRequest();

  // Computed values
  const allRequests = (requestsData as PointPurchaseRequestsResponse)?.data || [];

  // Client-side filtering
  const filteredRequests = useMemo(() => {
    let filtered = allRequests;

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.user.name.toLowerCase().includes(searchLower) ||
        request.user.email.toLowerCase().includes(searchLower) ||
        request.id.toString().includes(searchLower)
      );
    }

    // Filter by status
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === filters.statusFilter);
    }

    // Filter by payment method
    if (filters.paymentMethodFilter !== 'allMethods') {
      filtered = filtered.filter(request => request.payment_method === filters.paymentMethodFilter);
    }

    return filtered;
  }, [allRequests, filters.searchTerm, filters.statusFilter, filters.paymentMethodFilter]);

  // Client-side pagination
  const paginatedRequests = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredRequests.slice(startIndex, endIndex);
  }, [filteredRequests, page, rowsPerPage]);

  // Use filtered and paginated data
  const requests = paginatedRequests;

  // Calculate statistics from filtered data
  const statistics = useMemo(() => ({
    totalRequests: filteredRequests.length,
    pendingRequests: filteredRequests.filter(r => r.status === 'pending').length,
    approvedRequests: filteredRequests.filter(r => r.status === 'approved').length,
    totalRevenue: filteredRequests.reduce((sum, r) => sum + Number(r.price_mmk || 0), 0),
  }), [filteredRequests]);

  // Reset page to 0 when filters change
  useEffect(() => {
    handleChangePage(null, 0);
  }, [filters.searchTerm, filters.statusFilter, filters.paymentMethodFilter, handleChangePage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => {
    // Determine revenue label and value based on status filter
    let revenueLabel = 'Total Revenue'; // Default to total revenue
    let revenueValue = 0;
    
    if (filters.statusFilter === 'pending') {
      revenueLabel = 'Incoming Revenue';
      revenueValue = statistics.totalRevenue; // Revenue from pending requests
    } else if (filters.statusFilter === 'rejected') {
      revenueLabel = 'Lost Revenue';
      revenueValue = statistics.totalRevenue; // Revenue from rejected requests
    } else if (filters.statusFilter === 'cancelled') {
      revenueLabel = 'Cancelled Revenue';
      revenueValue = statistics.totalRevenue; // Revenue from cancelled requests
    } else if (filters.statusFilter === 'approved') {
      revenueLabel = 'Approved Revenue';
      revenueValue = statistics.totalRevenue; // Revenue from approved requests
    } else {
      // 'all' or any other status - show revenue based on current filters
      revenueLabel = 'Total Revenue';
      
      // If payment method filter is applied, calculate revenue for that payment method
      if (filters.paymentMethodFilter !== 'allMethods') {
        // Calculate revenue for specific payment method from all requests
        revenueValue = allRequests
          .filter(request => 
            request.status === 'approved' && 
            request.payment_method === filters.paymentMethodFilter
          )
          .reduce((sum, request) => sum + Number(request.price_mmk || 0), 0);
      } else {
        // No payment method filter - show total approved revenue
        revenueValue = allRequests
          .filter(request => request.status === 'approved')
          .reduce((sum, request) => sum + Number(request.price_mmk || 0), 0);
      }
    }

    return [
      {
        title: 'Total Requests',
        value: statistics.totalRequests.toString(),
        color: 'primary',
        icon: <OrderIcon />,
      },
      {
        title: 'Pending',
        value: statistics.pendingRequests.toString(),
        color: 'warning',
        icon: <OrderIcon />,
      },
      {
        title: 'Approved',
        value: statistics.approvedRequests.toString(),
        color: 'success',
        icon: <ApproveIcon />,
      },
      {
        title: revenueLabel,
        value: `${revenueValue.toLocaleString()} MMK`,
        color: 'info',
        icon: <OrderIcon />,
      },
    ];
  }, [statistics, filters.statusFilter, filters.paymentMethodFilter, allRequests]);

  // Validation function
  const validateDialogForm = (): boolean => {
    const errors: { notes?: string; reason?: string; payment_method?: string; payment_reference?: string } = {};

    if (approveRejectDialog.type === 'reject' && !approveRejectDialog.reason.trim()) {
      errors.reason = 'Rejection reason is required';
    }

    if (approveRejectDialog.type === 'approve') {
      if (!approveRejectDialog.payment_method) {
        errors.payment_method = 'Payment method is required';
      }
      if (!approveRejectDialog.notes.trim()) {
        errors.notes = 'Admin notes are required';
      }
      // Payment reference is optional, so no validation needed
    }

    setApproveRejectDialog(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  // Event handlers
  const handleCreate = () => navigate(PAGE_CONFIG.createButtonPath);
  const handleView = (request: PointPurchaseRequest) => navigate(`/points/purchase-requests/${request.id}`);
  const handleEdit = (request: PointPurchaseRequest) => navigate(`/points/purchase-requests/${request.id}/edit`);
  
  const handleDelete = (request: PointPurchaseRequest) => {
    openDeleteConfirmation(`Request #${request.id}`, 'purchase request', async () => {
      try {
        const response = await deleteRequestMutation.mutateAsync(request.id);
        showSuccess(response.message || 'Purchase request deleted successfully!', true);
        refetch();
      } catch (error: any) {
        showError(error?.message || 'Failed to delete purchase request', true);
      }
    });
  };

  const handleApprove = (request: PointPurchaseRequest) => {
    setApproveRejectDialog({
      open: true,
      type: 'approve',
      request,
      notes: '',
      reason: '',
      payment_method: request.payment_method,
      payment_reference: request.payment_reference,
      errors: {},
    });
  };

  const handleReject = (request: PointPurchaseRequest) => {
    setApproveRejectDialog({
      open: true,
      type: 'reject',
      request,
      notes: '',
      reason: '',
      payment_method: request.payment_method,
      payment_reference: request.payment_reference,
      errors: {},
    });
  };

  const handleApproveRejectConfirm = async () => {
    if (!approveRejectDialog.request) return;

    // Validate form
    if (!validateDialogForm()) {
      return;
    }

    try {
      const { type, request, notes, reason, payment_method, payment_reference } = approveRejectDialog;
      
      const response = await approveRejectMutation.mutateAsync({ 
        id: request.id, 
        data: { 
          action: type, 
          notes: notes.trim() || undefined,
          rejection_reason: type === 'reject' ? reason.trim() : undefined,
          payment_method: type === 'approve' ? (payment_method as 'bank_transfer' | 'cash' | 'mobile_money' | 'other' | undefined) : undefined,
          payment_reference: type === 'approve' ? (payment_reference?.trim() || undefined) : undefined,
        }
      });
      
      showSuccess(response.message || `Request ${type === 'approve' ? 'approved' : 'rejected'} successfully!`, true);
      setApproveRejectDialog({ 
        open: false, 
        type: 'approve', 
        request: null, 
        notes: '', 
        reason: '', 
        payment_method: '',
        payment_reference: '',
        errors: {} 
      });
      refetch(); // Refresh the data
    } catch (error: any) {
      showError(error?.message || `Failed to ${approveRejectDialog.type} request`, true);
    }
  };

  const handleApproveRejectClose = () => {
    setApproveRejectDialog({ 
      open: false, 
      type: 'approve', 
      request: null, 
      notes: '', 
      reason: '', 
      payment_method: '',
      payment_reference: '',
      errors: {} 
    });
  };

  const handleDialogInputChange = (field: 'notes' | 'reason' | 'payment_method' | 'payment_reference', value: string) => {
    setApproveRejectDialog(prev => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined // Clear error when user starts typing
      }
    }));
  };

  // Create mobile card actions for a specific request
  const createMobileCardActions = useCallback((request: PointPurchaseRequest): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      onClick: () => handleView(request),
      color: 'primary',
    },
    ...(request.can_approve ? [{
      icon: <ApproveIcon />,
      tooltip: 'Approve',
      onClick: () => handleApprove(request),
      color: 'success' as const,
    }] : []),
    ...(request.can_reject ? [{
      icon: <RejectIcon />,
      tooltip: 'Reject',
      onClick: () => handleReject(request),
      color: 'error' as const,
    }] : []),
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      onClick: () => handleEdit(request),
      color: 'secondary',
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      onClick: () => handleDelete(request),
      color: 'error',
    },
  ], [handleView, handleApprove, handleReject, handleEdit, handleDelete]);

  // Table columns
  const columns: TableColumn<PointPurchaseRequest>[] = useMemo(() => [
    {
      id: 'id',
      label: 'Request ID',
      align: 'center',
      render: (value) => (
        <Typography variant="body2" fontWeight={500}>
          #{value}
        </Typography>
      ),
    },
    {
      id: 'user',
      label: 'User',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.user.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row.user.email}
          </Typography>
          <Chip
            label={row.user.user_type}
            size="small"
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
      ),
    },
    {
      id: 'package',
      label: 'Package',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.package.name_en}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row.package.name_mm}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'points_requested',
      label: 'Points',
      align: 'center',
      render: (value) => (
        <Chip
          label={(value || 0).toLocaleString()}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      id: 'price_mmk',
      label: 'Price (MMK)',
      align: 'right',
      render: (_, row) => (
        <Typography variant="body2" fontWeight={500} color="success.main">
          {row.formatted_price}
        </Typography>
      ),
    },
    {
      id: 'payment_method',
      label: 'Payment',
      align: 'center',
             render: (_, row) => (
         <Box>
           <Typography variant="body2" fontWeight={500}>
             {row.status === 'approved' ? row.formatted_payment_method : '-'}
           </Typography>
         </Box>
       ),
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
             render: (_, row) => (
         <StatusChip 
           status={row.status}
           statusType="verification_status"
         />
       ),
    },
    {
      id: 'requested_at',
      label: 'Request Date',
      align: 'center',
      render: (value) => formatDate(value, 'display'),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleView(row);
              }}
                color="primary"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          {row.can_approve && (
            <Tooltip title="Approve">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(row);
                }}
                color="success"
              >
                <ApproveIcon />
              </IconButton>
            </Tooltip>
          )}
          {row.can_reject && (
            <Tooltip title="Reject">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(row);
                }}
                color="error"
              >
                <RejectIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [handleView, handleApprove, handleReject, handleEdit, handleDelete, deleteRequestMutation.isPending]);

  // Loading and error states
  if (isLoading) {
    return <PageLoadingState title="Loading Point Purchase Requests" />;
  }

  if (error) {
    return (
      <PageErrorState
        title="Failed to Load Point Purchase Requests"
        message={error?.message || 'An error occurred while loading point purchase requests'}
        onRetry={refetch}
        error={error}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleCreate,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof PointPurchaseRequestFilters, value)}
        fields={FILTER_FIELDS}
      />

      {/* Content */}
      {requests.length === 0 ? (
        <PageEmptyState
          title="No Point Purchase Requests Found"
          message="No point purchase requests match your current filters. Try adjusting your search criteria."
          actionButton={{
            text: 'Add Request',
            onClick: handleCreate,
          }}
        />
      ) : (
        <>
          {isMobile ? (
            <Box>
              {requests.map((request: PointPurchaseRequest) => (
                <MobileCard
                  key={request.id}
                  title={`Request #${request.id}`}
                  subtitle={request.user.name}
                  description={`${request.package.name_en} • ${(request.points_requested || 0).toLocaleString()} points`}
                  avatar={request.user.user_type === 'company' ? <PersonIcon /> : <PersonIcon />}
                  avatarColor="primary.main"
                                      status={{
                      label: request.status_label,
                      color: request.status === 'pending' ? 'warning' : 
                             request.status === 'approved' ? 'success' : 
                             request.status === 'rejected' ? 'error' : 'default',
                    }}
                  chips={[
                    {
                      label: request.formatted_payment_method,
                      color: 'info',
                    },
                    {
                      label: request.formatted_price,
                      color: 'primary',
                    },
                  ]}
                  actions={createMobileCardActions(request)}
                  onClick={() => handleView(request)}
                  clickable={true}
                />
              ))}
              <Pagination
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredRequests.length} // Use filteredRequests for total count
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                showResultsInfo={true}
              />
            </Box>
          ) : (
            <StandardTable
              columns={columns}
              data={requests}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={filteredRequests.length} // Use filteredRequests for total count
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onRowClick={handleView}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        title="Delete Point Purchase Request"
        message={`Are you sure you want to delete ${deleteState.itemName}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={closeDeleteConfirmation}
        isLoading={deleteRequestMutation.isPending}
        reasonLabel="Deletion Reason"
        reasonPlaceholder="Enter reason for deletion (optional)"
      />

      {/* Approve/Reject Dialog */}
      <ApproveRejectDialog
        dialog={approveRejectDialog}
        onClose={handleApproveRejectClose}
        onConfirm={handleApproveRejectConfirm}
        onInputChange={handleDialogInputChange}
        isLoading={approveRejectMutation.isPending}
      />
    </Box>
  );
};

export default PointPurchaseRequestListPage;
