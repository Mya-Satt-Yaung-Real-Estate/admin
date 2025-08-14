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
  Visibility as ViewIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { usePropertyListingTypes, useDeletePropertyListingType } from '../../services/queries/properties';
import { FilterState } from '../../constants/filters';
import { PropertyListingType } from '../../types/property';


// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PropertyListingTypeFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Property Listing Type Management',
  description: 'Manage property listing types and categories',
  createButtonText: 'Add Listing Type',
  createButtonPath: '/property-listing-types/create',
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

const PropertyListingTypeListPage: React.FC = () => {
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
  } = useFilters<PropertyListingTypeFilters>({
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
  const { data: listingTypesResponse, isLoading, error } = usePropertyListingTypes({
    per_page: 100, // Get all listing types for client-side filtering
    sort_by: 'sort_order',
    sort_direction: 'asc',
  });

  // Delete mutation
  const deleteListingTypeMutation = useDeletePropertyListingType();

  // Extract listing types data
  const listingTypes = listingTypesResponse?.data || [];

  // Filter listing types using client-side filtering
  const filteredListingTypes = useMemo(() => {
    return listingTypes.filter((listingType) => {
      const matchesSearch = !filters.searchTerm || 
        listingType.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        listingType.name_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (listingType.description && listingType.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && listingType.is_active) ||
        (filters.statusFilter === 'inactive' && !listingType.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }, [listingTypes, filters]);

  // Paginate data
  const paginatedListingTypes = useMemo(() => {
    return filteredListingTypes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredListingTypes, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Listing Types',
      value: listingTypes.length,
      color: 'primary',
      icon: <ListIcon />,
    },
    {
      title: 'Active Types',
      value: listingTypes.filter(type => type.is_active).length,
      color: 'success',
      icon: <ListIcon />,
    },
    {
      title: 'Inactive Types',
      value: listingTypes.filter(type => !type.is_active).length,
      color: 'warning',
      icon: <ListIcon />,
    },
  ], [listingTypes]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<PropertyListingType>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      render: (_value, listingType) => {
        if (!listingType) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {listingType.name_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {listingType.name_mm}
            </Typography>
          </Box>
        );
      },
    },

    {
      id: 'description',
      label: 'Description',
      render: (_value, listingType) => {
        if (!listingType) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {listingType.description || 'No description'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'sortOrder',
      label: 'Sort Order',
      render: (_value, listingType) => {
        if (!listingType) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontWeight="500">
            {listingType.sort_order}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, listingType) => {
        if (!listingType) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={listingType.is_active ? 'active' : 'inactive'} 
            size="small"
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, listingType) => {
        if (!listingType) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/property-listing-types/${listingType.slug}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/property-listing-types/${listingType.slug}/edit`)}
                color="secondary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDeleteListingType(listingType)}
                color="error"
                disabled={deleteListingTypeMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [isMobile, navigate, deleteListingTypeMutation.isPending]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (listingType: PropertyListingType): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      color: 'primary' as const,
      onClick: () => navigate(`/property-listing-types/${listingType.slug}`),
    },
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary' as const,
      onClick: () => navigate(`/property-listing-types/${listingType.slug}/edit`),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      color: 'error' as const,
      onClick: () => handleDeleteListingType(listingType),
    },
  ];

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleDeleteListingType = (listingType: PropertyListingType) => {
    openDeleteConfirmation(
      `${listingType.name_en} (${listingType.name_mm})`,
      'listing type',
      async () => {
        try {
          await deleteListingTypeMutation.mutateAsync(listingType.slug);
          showSuccess(`${listingType.name_en} deleted successfully!`, true);
        } catch (error) {
          showError('Failed to delete listing type. Please try again.', true);
        }
      }
    );
  };

  const handleAddListingType = () => {
    navigate('/property-listing-types/create');
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Property Listing Types" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Property Listing Types"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / Property Listing Type Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddListingType
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof PropertyListingTypeFilters, value)}
        fields={FILTER_FIELDS}
      />

      {/* Empty state */}
      {filteredListingTypes.length === 0 && !isLoading && (
        <PageEmptyState
          title="No Property Listing Types Found"
          message={filters.searchTerm || filters.statusFilter !== 'all'
            ? "No listing types match your current filters. Try adjusting your search criteria."
            : "No listing types have been created yet."
          }
        />
      )}

      {/* Mobile Card Layout */}
      {isMobile && filteredListingTypes.length > 0 ? (
        <Box>
          {paginatedListingTypes.map((listingType) => (
            <MobileCard
              key={listingType.id}
              title={listingType.name_en}
              subtitle={listingType.name_mm}
              description={listingType.description || 'No description'}
              avatar={<ListIcon />}
              avatarColor="primary.main"
              status={{
                label: listingType.is_active ? 'Active' : 'Inactive',
                color: listingType.is_active ? 'success' : 'error',
              }}
              chips={[
                {
                  label: listingType.slug,
                  color: 'secondary',
                },
                {
                  label: `Order: ${listingType.sort_order}`,
                  color: 'info',
                },
              ]}
              actions={createMobileCardActions(listingType)}
              onClick={() => navigate(`/property-listing-types/${listingType.slug}`)}
              clickable={true}
            />
          ))}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredListingTypes.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        filteredListingTypes.length > 0 && (
          <StandardTable
            columns={columns}
            data={paginatedListingTypes}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredListingTypes.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(listingType) => listingType.id}
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
        isLoading={deleteListingTypeMutation.isPending}
        error={deleteListingTypeMutation.error?.message}
      />
    </Box>
  );
};

export default PropertyListingTypeListPage;
