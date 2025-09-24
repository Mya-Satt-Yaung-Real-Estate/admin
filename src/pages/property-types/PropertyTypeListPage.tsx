import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { usePropertyTypes, useDeletePropertyType } from '../../services/queries/properties';
import { FilterState } from '../../constants/filters';
import { PropertyType } from '../../types/property';


// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PropertyTypeFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Property Type Management',
  description: 'Manage property types and categories',
  createButtonText: 'Add Property Type',
  createButtonPath: '/property-types/create',
} as const;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name or description...',
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

const PropertyTypeListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Pagination hook
  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination();

  // Filters hook
  const {
    filters,
    setFilter,
  } = useFilters<PropertyTypeFilters>({
    searchTerm: '',
    statusFilter: 'all',
  });

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // API Queries
  const { data: propertyTypesResponse, isLoading, error } = usePropertyTypes({
    per_page: 100, // Get all property types for client-side filtering
    sort_by: 'name_en',
    sort_direction: 'asc',
  });

  // Delete mutation
  const deletePropertyTypeMutation = useDeletePropertyType();

  // Extract property types data
  const propertyTypes = propertyTypesResponse?.data || [];

  // Filter property types using client-side filtering
  const filteredPropertyTypes = useMemo(() => {
    return propertyTypes.filter((propertyType) => {
      const matchesSearch = !filters.searchTerm || 
        propertyType.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        propertyType.name_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (propertyType.description && propertyType.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && propertyType.is_active) ||
        (filters.statusFilter === 'inactive' && !propertyType.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }, [propertyTypes, filters]);

  // Paginate data
  const paginatedPropertyTypes = useMemo(() => {
    return filteredPropertyTypes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredPropertyTypes, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Property Types',
      value: propertyTypes.length,
      color: 'primary',
      icon: <CategoryIcon />,
    },
    {
      title: 'Active Types',
      value: propertyTypes.filter(type => type.is_active).length,
      color: 'success',
      icon: <CategoryIcon />,
    },
    {
      title: 'Inactive Types',
      value: propertyTypes.filter(type => !type.is_active).length,
      color: 'warning',
      icon: <CategoryIcon />,
    },
  ], [propertyTypes]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<PropertyType>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      render: (_value, propertyType) => {
        if (!propertyType) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {propertyType.name_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {propertyType.name_mm}
            </Typography>
          </Box>
        );
      },
    },

    {
      id: 'description',
      label: 'Description',
      render: (_value, propertyType) => {
        if (!propertyType) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {propertyType.description || 'No description'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, propertyType) => {
        if (!propertyType) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={propertyType.is_active ? 'active' : 'inactive'} 
            size="small"
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, propertyType) => {
        if (!propertyType) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/property-types/${propertyType.slug}/edit`)}
                color="secondary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDeletePropertyType(propertyType)}
                color="error"
                disabled={deletePropertyTypeMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [isMobile, navigate, deletePropertyTypeMutation.isPending]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (propertyType: PropertyType): MobileCardAction[] => [
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary' as const,
      onClick: () => navigate(`/property-types/${propertyType.slug}/edit`),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      color: 'error' as const,
      onClick: () => handleDeletePropertyType(propertyType),
    },
  ];

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleDeletePropertyType = (propertyType: PropertyType) => {
    openDeleteConfirmation(
      `${propertyType.name_en} (${propertyType.name_mm})`,
      'property type',
      async () => {
        try {
          await deletePropertyTypeMutation.mutateAsync(propertyType.slug);
          showSuccess(`${propertyType.name_en} deleted successfully!`, true);
        } catch (error) {
          showError('Failed to delete property type. Please try again.', true);
        }
      }
    );
  };

  const handleAddPropertyType = () => {
    navigate('/property-types/create');
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Property Types" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Property Types"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / Property Type Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddPropertyType
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof PropertyTypeFilters, value)}
        fields={FILTER_FIELDS}
      />

      {/* Empty state */}
      {filteredPropertyTypes.length === 0 && !isLoading && (
        <PageEmptyState
          title="No Property Types Found"
          message={filters.searchTerm || filters.statusFilter !== 'all'
            ? "No property types match your current filters. Try adjusting your search criteria."
            : "No property types have been created yet."
          }
        />
      )}

      {/* Mobile Card Layout */}
      {isMobile && filteredPropertyTypes.length > 0 ? (
        <Box>
          {paginatedPropertyTypes.map((propertyType) => (
            <MobileCard
              key={propertyType.id}
              title={propertyType.name_en}
              subtitle={propertyType.name_mm}
              description={propertyType.description || 'No description'}
              avatar={<CategoryIcon />}
              avatarColor="primary.main"
              status={{
                label: propertyType.is_active ? 'Active' : 'Inactive',
                color: propertyType.is_active ? 'success' : 'error',
              }}
              chips={[
                {
                  label: propertyType.slug,
                  color: 'secondary',
                },
              ]}
              actions={createMobileCardActions(propertyType)}
            />
          ))}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredPropertyTypes.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        filteredPropertyTypes.length > 0 && (
          <StandardTable
            columns={columns}
            data={paginatedPropertyTypes}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredPropertyTypes.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(propertyType) => propertyType.id}
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
        isLoading={deletePropertyTypeMutation.isPending}
        error={deletePropertyTypeMutation.error?.message}
      />
    </Box>
  );
};

export default PropertyTypeListPage;
