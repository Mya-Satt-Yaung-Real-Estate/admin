import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  AttachMoney as MoneyIcon,
  Star as PointsIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageErrorState, PageEmptyState, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useAlertSystem, useManualSearch } from '../../hooks';
import { usePointOrders } from '../../services/queries/pointOrders';
import { FilterState } from '../../constants/filters';
import { PointOrder } from '../../types/point';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PointOrderFilters extends FilterState {
  searchTerm: string;
  paymentStatusFilter: string;
  statusFilter: string;
  dingerProviderFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Point Orders (Payment)',
  description: 'View and manage point orders from payment gateway',
} as const;

// Filter fields
const filterFields: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by order ID, transaction ID, user name, or phone...',
  },
  {
    key: 'paymentStatusFilter',
    type: 'select',
    label: 'Payment Status',
    options: [
      { value: 'all', label: 'All Payment Statuses' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'SUCCESS', label: 'Success' },
      { value: 'ERROR', label: 'Error' },
      { value: 'CANCELLED', label: 'Cancelled' },
      { value: 'TIMEOUT', label: 'Timeout' },
      { value: 'DECLINED', label: 'Declined' },
      { value: 'SYSTEM_ERROR', label: 'System Error' },
    ],
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Order Status',
    options: [
      { value: 'all', label: 'All Order Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'failed', label: 'Failed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'dingerProviderFilter',
    type: 'select',
    label: 'Payment Method',
    options: [
      { value: 'all', label: 'All Methods' },
      { value: 'AYA Pay', label: 'AYA Pay' },
      { value: 'OK$', label: 'OK$' },
      { value: 'Sai Sai Pay', label: 'Sai Sai Pay' },
      { value: 'Onepay', label: 'Onepay' },
      { value: 'MPitesan', label: 'MPitesan' },
      { value: 'MPT Pay', label: 'MPT Pay' },
      { value: 'CB Pay', label: 'CB Pay' },
      { value: 'UAB Pay', label: 'UAB Pay' },
      { value: 'KBZ Pay', label: 'KBZ Pay' },
      { value: 'Wave Pay', label: 'Wave Pay' },
      { value: 'Visa', label: 'Visa' },
      { value: 'Master', label: 'Master' },
      { value: 'JCB', label: 'JCB' },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PointOrderListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  // Manual search: only triggers on Enter key or search button click
  const {
    searchValue,
    searchTerm,
    handleInputChange,
    triggerSearch,
    clearSearch,
    handleKeyPress,
  } = useManualSearch('');

  const { filters, setFilter } = useFilters<PointOrderFilters>({
    searchTerm: '', // This will be overridden by manual search
    paymentStatusFilter: 'all',
    statusFilter: 'all',
    dingerProviderFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // API Queries - Server-side filtering and pagination
  const { data: ordersResponse, isLoading, error } = usePointOrders({
    page: page + 1, // API uses 1-based pagination
    per_page: rowsPerPage,
    search: searchTerm || undefined, // Use manual search term
    payment_status: filters.paymentStatusFilter !== 'all' ? filters.paymentStatusFilter : undefined,
    status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
    dinger_provider_name: filters.dingerProviderFilter !== 'all' ? filters.dingerProviderFilter : undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Alert system hook
  const { alert, showSuccess, clearAlert } = useAlertSystem();

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract orders data (already filtered and paginated by server)
  // ordersResponse is PointOrdersResponse (from API service which extracts response.data)
  // Structure: { success, message, data: PointOrder[], pagination, summary }
  const orders = (ordersResponse?.data || []) as PointOrder[];
  const pagination = ordersResponse?.pagination;
  const summary = ordersResponse?.summary;

  // Server-side filtering and pagination - no client-side processing needed
  const filteredOrders = orders;
  const paginatedOrders = orders; // Already paginated by server

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Orders',
      value: summary?.total_orders || 0,
      color: 'primary',
      icon: <OrderIcon />,
    },
    {
      title: 'Pending',
      value: summary?.pending_orders || 0,
      color: 'warning',
      icon: <PendingIcon />,
    },
    {
      title: 'Success',
      value: summary?.success_orders || 0,
      color: 'success',
      icon: <SuccessIcon />,
    },
    {
      title: 'Failed',
      value: summary?.failed_orders || 0,
      color: 'error',
      icon: <ErrorIcon />,
    },
    {
      title: 'Total Revenue',
      value: `${(summary?.total_revenue || 0).toLocaleString()} MMK`,
      color: 'info',
      icon: <MoneyIcon />,
    },
    {
      title: 'Points Allocated',
      value: summary?.total_points_allocated || 0,
      color: 'secondary',
      icon: <PointsIcon />,
    },
  ], [summary]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<PointOrder>[] = useMemo(() => [
    {
      id: 'orderId',
      label: 'Order ID',
      width: '180px',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontWeight="600" fontFamily="monospace">
            {order.order_id}
          </Typography>
        );
      },
    },
    {
      id: 'user',
      label: 'User',
      width: '200px',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {order.user?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {order.user?.phone || 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'package',
      label: 'Package',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {order.package?.name_en || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {order.package?.points || 0} points
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'pointAmount',
      label: 'Points',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontWeight="600" color="primary.main">
            {order.point_amount}
          </Typography>
        );
      },
    },
    {
      id: 'price',
      label: 'Price',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontWeight="500">
            {order.formatted_price}
          </Typography>
        );
      },
    },
    {
      id: 'paymentStatus',
      label: 'Payment Status',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        // Map payment status to standard status for StatusChip
        const statusMap: Record<string, string> = {
          'PENDING': 'pending',
          'SUCCESS': 'approved',
          'ERROR': 'rejected',
          'CANCELLED': 'cancelled',
          'TIMEOUT': 'rejected',
          'DECLINED': 'rejected',
          'SYSTEM_ERROR': 'rejected',
        };
        const mappedStatus = statusMap[order.payment_status] || order.payment_status.toLowerCase();
        return (
          <StatusChip 
            status={mappedStatus} 
            statusType="status"
            label={order.formatted_payment_status}
          />
        );
      },
    },
    {
      id: 'orderStatus',
      label: 'Order Status',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={order.status} 
            statusType="status"
            label={order.status_label}
          />
        );
      },
      hidden: isMobile,
    },
    {
      id: 'paymentProvider',
      label: 'Provider',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {order.dinger_provider_name || order.formatted_payment_provider || 'N/A'}
            </Typography>
            {order.dinger_method_name && (
              <Typography variant="caption" color="textSecondary">
                {order.dinger_method_name}
              </Typography>
            )}
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'dingerTransactionId',
      label: 'Transaction ID',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
            {order.dinger_transaction_id || 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'paymentCompletedAt',
      label: 'Payment Completed',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {order.payment_completed_at ? formatDate(order.payment_completed_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'pointsAllocatedAt',
      label: 'Points Allocated',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {order.points_allocated_at ? formatDate(order.points_allocated_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, order) => {
        if (!order) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(order.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
  ], [isMobile]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (order: PointOrder): MobileCardAction[] => {
    return [
      {
        icon: <OrderIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => {
          // Navigate to detail page if needed
          showSuccess(`Order ${order.order_id} details`);
        },
      },
    ];
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  // Custom filter change handler that handles search input specially
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      // Use manual search for search input
      handleInputChange(value);
    } else {
      // Use regular filter for other inputs
      setFilter(key as keyof PointOrderFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();
    
    // Reset all filters to default values
    setFilter('paymentStatusFilter', 'all');
    setFilter('statusFilter', 'all');
    setFilter('dingerProviderFilter', 'all');
    
    // Reset to first page
    handleChangePage({} as any, 0);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Error state - show inline error instead of full page error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title={PAGE_CONFIG.title}
          subtitle={PAGE_CONFIG.description}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Point Orders"
            message={error.message}
            onRetry={() => window.location.reload()}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / Points / Orders (Payment)"
        subtitle={PAGE_CONFIG.description}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={{
          ...filters,
          searchTerm: searchValue, // Use current search value for immediate UI feedback
        }}
        onFilterChange={handleFilterChange}
        fields={filterFields}
        searchHelperText={undefined}
        onSearchKeyPress={handleKeyPress}
        onSearchClick={triggerSearch}
        showSearchButton={true}
        onClearFilters={handleClearFilters}
        showClearButton={true}
      />

      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box>
          {isLoading ? (
            // Loading skeleton cards for mobile
            Array.from({ length: rowsPerPage }).map((_, index) => (
              <MobileCard
                key={`skeleton-${index}`}
                title=""
                loading={true}
                showRowNumber={true}
              />
            ))
          ) : filteredOrders.length > 0 ? (
            paginatedOrders.map((order, index) => (
              <MobileCard
                key={order.id}
                title={`${order.order_id}`}
                subtitle={order.user?.name || 'N/A'}
                rowNumber={(page * rowsPerPage) + index + 1}
                showRowNumber={true}
                description={`${order.point_amount} points - ${order.formatted_price}`}
                avatar={<OrderIcon />}
                avatarColor="primary.main"
                status={{
                  label: order.formatted_payment_status,
                  color: order.payment_status === 'SUCCESS' ? 'success' : 
                         order.payment_status === 'PENDING' ? 'warning' : 'error',
                }}
                chips={[
                  {
                    label: order.package?.name_en || 'N/A',
                    color: 'info',
                  },
                  {
                    label: order.status_label,
                    color: order.status === 'approved' ? 'info' : 'default',
                  },
                  {
                    label: order.dinger_provider_name || 'N/A',
                    color: 'secondary',
                  },
                  ...(order.dinger_transaction_id ? [{
                    label: `Txn: ${order.dinger_transaction_id}`,
                    color: 'default' as const,
                  }] : []),
                  ...(order.payment_completed_at ? [{
                    label: `Paid: ${formatDate(order.payment_completed_at, 'display')}`,
                    color: 'info' as const,
                  }] : []),
                  ...(order.points_allocated_at ? [{
                    label: `Allocated: ${formatDate(order.points_allocated_at, 'display')}`,
                    color: 'primary' as const,
                  }] : []),
                  {
                    label: formatDate(order.created_at, 'display'),
                    color: 'default',
                  },
                ]}
                actions={createMobileCardActions(order)}
                onClick={() => {
                  showSuccess(`Order ${order.order_id} details`);
                }}
                clickable={true}
              />
            ))
          ) : (
            <PageEmptyState
              title="No Point Orders Found"
              message="No point orders match your current filters. Try adjusting your search criteria."
            />
          )}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={pagination?.total || 0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        filteredOrders.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Point Orders Found"
            message={searchTerm || filters.paymentStatusFilter !== 'all' || filters.statusFilter !== 'all' || filters.dingerProviderFilter !== 'all'
              ? "No point orders match your current filters. Try adjusting your search criteria."
              : "No point orders have been recorded yet."
            }
          />
        ) : (
        <StandardTable
          columns={columns}
          data={paginatedOrders}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(order) => order.id}
          loading={isLoading}
          showRowNumbers={true}
          rowNumberLabel="No."
        />
        )
      )}
    </Box>
  );
};

export default PointOrderListPage;

