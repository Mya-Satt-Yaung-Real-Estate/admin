import React, { useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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
import { PointPurchaseRequest } from '../../types/point';
import { formatDate } from '../../constants/dateFormats';

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
  });

  // Hooks
  const { filters, setFilter } = useFilters<PointPurchaseRequestFilters>({
    paymentMethodFilter: 'allMethods',
  });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation, handleConfirmDelete } = useDeleteConfirmation();

  // Queries
  const { data: requestsData, isLoading, error, refetch } = usePointPurchaseRequests();

  const deleteRequestMutation = useDeletePointPurchaseRequest();
  const approveRejectMutation = useApproveRejectPointPurchaseRequest();

  // Computed values
  const requests = requestsData?.data || [];
  const pagination = requestsData?.pagination;

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return requests.filter((item: PointPurchaseRequest) => {
      const matchesSearch = filters.searchTerm === '' || 
        item.user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.id.toString().includes(filters.searchTerm);

      const matchesStatus = filters.statusFilter === 'all' || item.status === filters.statusFilter;
      const matchesPaymentMethod = !filters.paymentMethodFilter || filters.paymentMethodFilter === 'allMethods' || item.payment_method === filters.paymentMethodFilter;

      return matchesSearch && matchesStatus && matchesPaymentMethod;
    });
  }, [requests, filters]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Requests',
      value: pagination?.total?.toString() || '0',
      color: 'primary',
      icon: <OrderIcon />,
    },
    {
      title: 'Pending',
      value: requests.filter(r => r.is_pending).length.toString(),
      color: 'warning',
      icon: <OrderIcon />,
    },
    {
      title: 'Approved',
      value: requests.filter(r => r.is_approved).length.toString(),
      color: 'success',
      icon: <ApproveIcon />,
    },
    {
      title: 'Total Revenue',
      value: `${requests.reduce((sum, r) => sum + (r.price_mmk || 0), 0).toLocaleString()} MMK`,
      color: 'info',
      icon: <OrderIcon />,
    },
  ], [requests, pagination]);

  // Event handlers
  const handleCreate = () => navigate(PAGE_CONFIG.createButtonPath);
  const handleView = (request: PointPurchaseRequest) => navigate(`/points/purchase-requests/${request.id}`);
  const handleEdit = (request: PointPurchaseRequest) => navigate(`/points/purchase-requests/${request.id}/edit`);
  
  const handleDelete = (request: PointPurchaseRequest) => {
    openDeleteConfirmation(`Request #${request.id}`, 'purchase request', async () => {
      try {
        await deleteRequestMutation.mutateAsync(request.id);
        showSuccess('Purchase request deleted successfully!', true);
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
    });
  };

  const handleReject = (request: PointPurchaseRequest) => {
    setApproveRejectDialog({
      open: true,
      type: 'reject',
      request,
      notes: '',
      reason: '',
    });
  };

  const handleApproveRejectConfirm = async () => {
    if (!approveRejectDialog.request) return;

    try {
      const { type, request, notes, reason } = approveRejectDialog;
      
      await approveRejectMutation.mutateAsync({ 
        id: request.id, 
        data: { 
          action: type, 
          notes: notes.trim() || undefined,
          rejection_reason: type === 'reject' ? reason.trim() : undefined
        }
      });
      
      showSuccess(`Request ${type === 'approve' ? 'approved' : 'rejected'} successfully!`, true);
      setApproveRejectDialog({ open: false, type: 'approve', request: null, notes: '', reason: '' });
    } catch (error: any) {
      showError(error?.message || `Failed to ${approveRejectDialog.type} request`, true);
    }
  };

  const handleApproveRejectClose = () => {
    setApproveRejectDialog({ open: false, type: 'approve', request: null, notes: '', reason: '' });
  };

  // Create mobile card actions for a specific request
  const createMobileCardActions = (request: PointPurchaseRequest): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      onClick: () => handleView(request),
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
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      onClick: () => handleDelete(request),
      color: 'error',
    },
  ];

  // Table columns
  const columns: TableColumn<PointPurchaseRequest>[] = [
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
            {row.formatted_payment_method}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row.payment_reference}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      render: (_, row) => <StatusChip status={row.status} />,
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
            >
              <ViewIcon fontSize="small" />
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
                <ApproveIcon fontSize="small" />
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
                <RejectIcon fontSize="small" />
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
            >
              <EditIcon fontSize="small" />
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
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
      {filteredData.length === 0 ? (
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
              {paginatedData.map((request) => (
                <MobileCard
                  key={request.id}
                  title={`Request #${request.id}`}
                  subtitle={request.user.name}
                  description={`${request.package.name_en} • ${(request.points_requested || 0).toLocaleString()} points`}
                  avatar={request.user.user_type === 'company' ? <PersonIcon /> : <PersonIcon />}
                  avatarColor="primary.main"
                  status={{
                    label: request.status_label,
                    color: request.is_pending ? 'warning' : request.is_approved ? 'success' : 'error',
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
                totalCount={filteredData.length}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                showResultsInfo={true}
              />
            </Box>
          ) : (
            <StandardTable
              columns={columns}
              data={paginatedData}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={filteredData.length}
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
      <Dialog open={approveRejectDialog.open} onClose={handleApproveRejectClose}>
        <DialogTitle>{approveRejectDialog.type === 'approve' ? 'Approve Request' : 'Reject Request'}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Request ID: #{approveRejectDialog.request?.id}</Typography>
          <Typography variant="body1">User: {approveRejectDialog.request?.user.name}</Typography>
          <Typography variant="body1">Package: {approveRejectDialog.request?.package.name_en}</Typography>
          <Typography variant="body1">Points: {(approveRejectDialog.request?.points_requested || 0).toLocaleString()}</Typography>
          <Typography variant="body1">Price: {approveRejectDialog.request?.formatted_price}</Typography>
          <Typography variant="body1">Payment Method: {approveRejectDialog.request?.formatted_payment_method}</Typography>
          <Typography variant="body1">Status: {approveRejectDialog.request?.status_label}</Typography>
                     <Typography variant="body1">Request Date: {approveRejectDialog.request?.requested_at ? formatDate(approveRejectDialog.request.requested_at, 'display') : 'N/A'}</Typography>

          {approveRejectDialog.type === 'approve' && (
            <TextField
              label="Admin Notes (Optional)"
              fullWidth
              margin="normal"
              multiline
              rows={2}
              value={approveRejectDialog.notes}
              onChange={(e) => setApproveRejectDialog({ ...approveRejectDialog, notes: e.target.value })}
            />
          )}
          {approveRejectDialog.type === 'reject' && (
            <TextField
              label="Rejection Reason"
              fullWidth
              margin="normal"
              multiline
              rows={2}
              value={approveRejectDialog.reason}
              onChange={(e) => setApproveRejectDialog({ ...approveRejectDialog, reason: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApproveRejectClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleApproveRejectConfirm} color="primary" variant="contained">
            {approveRejectDialog.type === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PointPurchaseRequestListPage;
