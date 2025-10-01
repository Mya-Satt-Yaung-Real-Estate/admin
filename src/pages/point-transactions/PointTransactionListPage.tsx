import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageErrorState, PageEmptyState, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useAlertSystem, useManualSearch } from '../../hooks';
import { usePointTransactions, usePointTransactionStatistics } from '../../services/queries/pointTransactions';
import { FilterState } from '../../constants/filters';
import { PointTransaction, TRANSACTION_TYPES, REFERENCE_TYPES } from '../../types/pointTransaction';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PointTransactionFilters extends FilterState {
  searchTerm: string;
  transactionTypeFilter: string;
  referenceTypeFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Point Transactions',
  description: 'View and manage point transactions',
} as const;

// Filter fields
const filterFields: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by user name, email, or description...',
  },
  {
    key: 'transactionTypeFilter',
    type: 'select',
    label: 'Transaction Type',
    options: [...TRANSACTION_TYPES],
  },
  {
    key: 'referenceTypeFilter',
    type: 'select',
    label: 'Reference Type',
    options: [...REFERENCE_TYPES],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PointTransactionListPage: React.FC = () => {
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

  const { filters, setFilter } = useFilters<PointTransactionFilters>({
    searchTerm: '', // This will be overridden by manual search
    transactionTypeFilter: 'all',
    referenceTypeFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // API Queries - Server-side filtering and pagination
  const { data: transactionsResponse, isLoading, error } = usePointTransactions({
    page: page + 1, // API uses 1-based pagination
    per_page: rowsPerPage,
    search: searchTerm || undefined, // Use manual search term
    transaction_type: filters.transactionTypeFilter !== 'all' ? filters.transactionTypeFilter : undefined,
    reference_type: filters.referenceTypeFilter !== 'all' ? filters.referenceTypeFilter : undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Point transaction statistics for dashboard cards
  const { data: statistics } = usePointTransactionStatistics();

  // Alert system hook
  const { alert, showSuccess, clearAlert } = useAlertSystem();

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract transactions data (already filtered and paginated by server)
  const transactions = transactionsResponse?.data || [];
  const pagination = transactionsResponse?.pagination;

  // Server-side filtering and pagination - no client-side processing needed
  const filteredTransactions = transactions;
  const paginatedTransactions = transactions; // Already paginated by server

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Transactions',
      value: statistics?.data?.total_transaction || 0,
      color: 'primary',
      icon: <AccountBalanceIcon />,
    },
    {
      title: 'Points Credited',
      value: statistics?.data?.total_credits || '0',
      color: 'success',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Points Debited',
      value: statistics?.data?.total_debits || '0',
      color: 'error',
      icon: <TrendingDownIcon />,
    },
    {
      title: 'Property Uploads',
      value: statistics?.data?.property_upload_transaction_count || 0,
      color: 'info',
      icon: <PeopleIcon />,
    },
  ], [statistics]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<PointTransaction>[] = useMemo(() => [
    {
      id: 'user',
      label: 'User',
      width: '200px',
      render: (_value, transaction) => {
        if (!transaction) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {transaction.user_name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {transaction.user_email}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'transactionType',
      label: 'Type',
      render: (_value, transaction) => {
        if (!transaction) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={transaction.transaction_type} 
            statusType="transaction_type"
          />
        );
      },
    },
    {
      id: 'pointsAmount',
      label: 'Points',
      render: (_value, transaction) => {
        if (!transaction) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {transaction.transaction_type === 'CREDIT' ? (
              <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography 
              variant="body2" 
              fontWeight="500"
              color={transaction.transaction_type === 'CREDIT' ? 'success.main' : 'error.main'}
            >
              {transaction.points_amount}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'balanceBefore',
      label: 'Balance Before',
      render: (_value, transaction) => {
        if (!transaction) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontWeight="500">
            {transaction.balance_before}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'balanceAfter',
      label: 'Balance After',
      render: (_value, transaction) => {
        if (!transaction) return <Typography variant="body2">No data</Typography>;
        const balanceAfter = transaction.transaction_type === 'CREDIT' 
          ? transaction.balance_before + transaction.points_amount
          : transaction.balance_before - transaction.points_amount;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" fontWeight="500" color="primary.main">
              {balanceAfter}
            </Typography>
            {transaction.transaction_type === 'CREDIT' ? (
              <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 14, color: 'error.main' }} />
            )}
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'referenceType',
      label: 'Reference Type',
      render: (_value, transaction) => {
        if (!transaction) return <Typography variant="body2">No data</Typography>;
        
        // Format reference type for display
        const formatReferenceType = (type: string) => {
          return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };
        
        return (
          <Chip
            label={formatReferenceType(transaction.reference_type)}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
      hidden: isMobile,
    },
    {
      id: 'referenceId',
      label: 'Reference ID',
      render: (_value, transaction) => {
        if (!transaction) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontWeight="500">
            #{transaction.reference_id}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, transaction) => {
        if (!transaction) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {transaction.description}
          </Typography>
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, transaction) => {
        if (!transaction) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(transaction.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
  ], [isMobile]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (transaction: PointTransaction): MobileCardAction[] => {
    return [
      {
        icon: <MoneyIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => {
          // For now, just show an alert. In the future, you might want to create a detail page
          showSuccess(`Transaction #${transaction.id} details`);
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
      setFilter(key as keyof PointTransactionFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();
    
    // Reset all filters to default values
    setFilter('transactionTypeFilter', 'all');
    setFilter('referenceTypeFilter', 'all');
    
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
          title="Point Transactions"
          subtitle="View point transaction history"
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Point Transactions"
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
        breadcrumbs="Dashboard / Point Transactions"
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
          ) : filteredTransactions.length > 0 ? (
            paginatedTransactions.map((transaction, index) => {
              const balanceAfter = transaction.transaction_type === 'CREDIT' 
                ? transaction.balance_before + transaction.points_amount
                : transaction.balance_before - transaction.points_amount;
              
              return (
                <MobileCard
                  key={transaction.id}
                  title={`${transaction.transaction_type} - ${transaction.points_amount} points`}
                  subtitle={transaction.user_name}
                  rowNumber={(page * rowsPerPage) + index + 1}
                  showRowNumber={true}
                  description={transaction.description}
                  avatar={transaction.transaction_type === 'CREDIT' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                  avatarColor={transaction.transaction_type === 'CREDIT' ? 'success.main' : 'error.main'}
                  status={{
                    label: transaction.transaction_type,
                    color: transaction.transaction_type === 'CREDIT' ? 'success' : 'error',
                  }}
                  chips={[
                    {
                      label: `Before: ${transaction.balance_before}`,
                      color: 'info',
                    },
                    {
                      label: `After: ${balanceAfter}`,
                      color: 'primary',
                    },
                    {
                      label: transaction.reference_type
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' '),
                      color: 'secondary',
                    },
                    {
                      label: `#${transaction.reference_id}`,
                      color: 'default',
                    },
                    {
                      label: formatDate(transaction.created_at, 'display'),
                      color: 'default',
                    },
                  ]}
                  actions={createMobileCardActions(transaction)}
                  onClick={() => {
                    // For now, just show an alert. In the future, you might want to create a detail page
                    showSuccess(`Transaction #${transaction.id} details`);
                  }}
                  clickable={true}
                />
              );
            })
          ) : (
            <PageEmptyState
              title="No Point Transactions Found"
              message="No point transactions match your current filters. Try adjusting your search criteria."
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
        filteredTransactions.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Point Transactions Found"
            message={searchTerm || filters.transactionTypeFilter !== 'all' || filters.referenceTypeFilter !== 'all'
              ? "No point transactions match your current filters. Try adjusting your search criteria."
              : "No point transactions have been recorded yet."
            }
          />
        ) : (
        <StandardTable
          columns={columns}
          data={paginatedTransactions}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(transaction) => transaction.id}
          loading={isLoading}
          showRowNumbers={true}
          rowNumberLabel="No."
        />
        )
      )}
    </Box>
  );
};

export default PointTransactionListPage;
