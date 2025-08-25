import React, { useMemo } from 'react';
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
  Star as StarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { usePointPackages, useDeletePointPackage } from '../../services/queries/points';
import { FilterState } from '../../constants/filters';
import { PointPackage } from '../../types/point';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PointPackageFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Point Packages',
  description: 'Manage point packages and their pricing',
  createButtonText: 'Add Point Package',
  createButtonPath: '/points/packages/create',
} as const;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const PointPackageListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Hooks
  const { filters, setFilter } = useFilters<PointPackageFilters>();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation, handleConfirmDelete } = useDeleteConfirmation();

  // Queries
  const { data: packagesData, isLoading, error, refetch } = usePointPackages();

  const deletePackageMutation = useDeletePointPackage();

  // Computed values
  const packages = packagesData?.data || [];
  const pagination = packagesData?.pagination;

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return packages.filter((item: PointPackage) => {
      const matchesSearch = filters.searchTerm === '' || 
        item.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.name_mm.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && item.is_active) ||
        (filters.statusFilter === 'inactive' && !item.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }, [packages, filters]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page, rowsPerPage]);

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Packages',
      value: pagination?.total?.toString() || '0',
      color: 'primary',
      icon: <StarIcon />,
    },
    {
      title: 'Active Packages',
      value: packages.filter(p => p.is_active).length.toString(),
      color: 'success',
      icon: <StarIcon />,
    },
    {
      title: 'Total Revenue',
      value: packages.reduce((sum, p) => sum + (p.total_revenue || 0), 0).toLocaleString() + ' MMK',
      color: 'info',
      icon: <MoneyIcon />,
    },
    {
      title: 'Total Purchases',
      value: packages.reduce((sum, p) => sum + (p.total_purchases || 0), 0).toString(),
      color: 'warning',
      icon: <MoneyIcon />,
    },
  ], [packages, pagination]);

  // Event handlers
  const handleCreate = () => navigate(PAGE_CONFIG.createButtonPath);
  const handleView = (pointPackage: PointPackage) => navigate(`/points/packages/${pointPackage.slug}`);
  const handleEdit = (pointPackage: PointPackage) => navigate(`/points/packages/${pointPackage.slug}/edit`);
  const handleDelete = (pointPackage: PointPackage) => {
    openDeleteConfirmation(pointPackage.name_en, 'point package', async (deletion_reason) => {
      try {
        const response = await deletePackageMutation.mutateAsync({ 
          slug: pointPackage.slug, 
          deletion_reason 
        });
        showSuccess(response.message || 'Point package deleted successfully!', true);
      } catch (error: any) {
        showError(error?.message || 'Failed to delete point package', true);
      }
    });
  };

  // Create mobile card actions for a specific package
  const createMobileCardActions = (pointPackage: PointPackage): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      onClick: () => handleView(pointPackage),
    },
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      onClick: () => handleEdit(pointPackage),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      onClick: () => handleDelete(pointPackage),
      color: 'error',
    },
  ];

  // Table columns
  const columns: TableColumn<PointPackage>[] = [
    {
      id: 'name_en',
      label: 'Name (English)',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row.name_mm}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'points',
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
      id: 'total_purchases',
      label: 'Purchases',
      align: 'center',
      render: (value) => (
        <Typography variant="body2" color="textSecondary">
          {value || 0}
        </Typography>
      ),
    },
    {
      id: 'total_revenue',
      label: 'Revenue',
      align: 'right',
      render: (value) => (
        <Typography variant="body2" color="info.main">
          {(value || 0).toLocaleString()} MMK
        </Typography>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      align: 'center',
      render: (value) => <StatusChip status={value ? 'active' : 'inactive'} />,
    },
    {
      id: 'created_at',
      label: 'Created',
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
    return <PageLoadingState title="Loading Point Packages" />;
  }

  if (error) {
    return (
      <PageErrorState
        title="Failed to Load Point Packages"
        message={error?.message || 'An error occurred while loading point packages'}
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
        onFilterChange={(key, value) => setFilter(key as keyof PointPackageFilters, value)}
        fields={FILTER_FIELDS}
      />

      {/* Content */}
      {filteredData.length === 0 ? (
        <PageEmptyState
          title="No Point Packages Found"
          message="No point packages match your current filters. Try adjusting your search criteria."
          actionButton={{
            text: 'Add Point Package',
            onClick: handleCreate,
          }}
        />
      ) : (
        <>
          {isMobile ? (
            <Box>
              {paginatedData.map((pointPackage) => (
                <MobileCard
                  key={pointPackage.id}
                  title={pointPackage.name_en}
                  subtitle={pointPackage.name_mm}
                  description={`${(pointPackage.points || 0).toLocaleString()} points • ${pointPackage.formatted_price}`}
                  avatar={<StarIcon />}
                  avatarColor="primary.main"
                  status={{
                    label: pointPackage.is_active ? 'Active' : 'Inactive',
                    color: pointPackage.is_active ? 'success' : 'error',
                  }}
                  chips={[
                    {
                      label: `${pointPackage.total_purchases || 0} purchases`,
                      color: 'info',
                    },
                    {
                      label: `${(pointPackage.total_revenue || 0).toLocaleString()} MMK revenue`,
                      color: 'primary',
                    },
                  ]}
                  actions={createMobileCardActions(pointPackage)}
                  onClick={() => handleView(pointPackage)}
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
        title="Delete Point Package"
        message={`Are you sure you want to delete "${deleteState.itemName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={closeDeleteConfirmation}
        isLoading={deletePackageMutation.isPending}
        reasonLabel="Deletion Reason"
        reasonPlaceholder="Enter reason for deletion (optional)"
      />
    </Box>
  );
};

export default PointPackageListPage;
