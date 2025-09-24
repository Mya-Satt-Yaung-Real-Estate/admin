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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { 
  StatusChip, 
  PageLoadingState, 
  PageErrorState, 
  PageEmptyState, 
  DeleteConfirmationDialog, 
  ConfirmationDialog,
  ActionAlert 
} from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { 
  useEventCategories, 
  useDeleteEventCategory, 
  useRestoreEventCategory
} from '../../services/queries/events';
import { FilterState } from '../../constants/filters';
import { HousingEventCategory } from '../../types/event';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EventCategoryFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Event Category Management',
  description: 'Manage all event categories in the system',
  createButtonText: 'Add Category',
  createButtonPath: '/events/categories/create',
} as const;

const createFilterFields = (): FilterField[] => [
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
// MAIN COMPONENT
// ============================================================================

const EventCategoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  const { filters, setFilter } = useFilters<EventCategoryFilters>({
    searchTerm: '',
    statusFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Tab state for active/deleted categories
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [categoryToRestore, setCategoryToRestore] = useState<HousingEventCategory | null>(null);

  // API Queries
  const { data: eventCategoriesResponse, isLoading, error, refetch } = useEventCategories({
    per_page: 100, // Get all categories for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Mutations
  const deleteEventCategoryMutation = useDeleteEventCategory();
  const restoreEventCategoryMutation = useRestoreEventCategory();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete: handleDeleteConfirm,
  } = useDeleteConfirmation();

  // Handle success message from URL
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage));
      // Clear the success parameter from URL
      const newSearch = new URLSearchParams(location.search);
      newSearch.delete('success');
      navigate(`${location.pathname}${newSearch.toString() ? '?' + newSearch.toString() : ''}`, { replace: true });
    }
  }, [location.search, navigate, showSuccess]);

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract categories data
  const eventCategories = eventCategoriesResponse?.data || [];
  
  // Create filter fields
  const filterFields = createFilterFields();

  // Filter categories using client-side filtering
  const filteredCategories = useMemo(() => {
    if (!eventCategories || eventCategories.length === 0) return [];
    
    const validCategories = eventCategories.filter(category => category != null);
    
    return validCategories.filter(category => {
      // Check if category is deleted
      const isDeleted = category.deleted_at;
      
      // Apply tab filter (0 = Active, 1 = Deleted)
      if (activeTab === 0 && isDeleted) return false;
      if (activeTab === 1 && !isDeleted) return false;
      
      const matchesSearch = 
        category.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        category.name_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && category.is_active) ||
        (filters.statusFilter === 'inactive' && !category.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }, [eventCategories, filters, activeTab]);

  // Paginate data
  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCategories, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Categories',
      value: eventCategories.length,
      color: 'primary',
      icon: <CategoryIcon />,
    },
    {
      title: 'Active Categories',
      value: eventCategories.filter(category => !category.deleted_at).length,
      color: 'success',
      icon: <CategoryIcon />,
    },
    {
      title: 'Inactive Categories',
      value: eventCategories.filter(category => !category.is_active && !category.deleted_at).length,
      color: 'warning',
      icon: <CategoryIcon />,
    },
    {
      title: 'Deleted Categories',
      value: eventCategories.filter(category => category.deleted_at).length,
      color: 'error',
      icon: <CategoryIcon />,
    },
  ], [eventCategories]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<HousingEventCategory>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {category.name_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {category.name_mm}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary" noWrap>
            {category.description || '-'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'eventsCount',
      label: 'Events',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontWeight="500">
            {category.housing_events_count || 0}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        if (category.deleted_at) {
          return <StatusChip status="deleted" />;
        }
        return <StatusChip status={category.is_active ? 'active' : 'inactive'} />;
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(category.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        
        const isDeleted = category.deleted_at;
        
                    return (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {/* Show different actions based on deleted status */}
                        {!isDeleted ? (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(category)}
                                color="secondary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(category)}
                                color="error"
                                disabled={deleteEventCategoryMutation.isPending}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Restore">
                            <IconButton
                              size="small"
                              onClick={() => handleRestore(category)}
                              color="success"
                              disabled={restoreEventCategoryMutation.isPending}
                            >
                              <RestoreIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    );
      },
    },
  ], [isMobile]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const getMobileCardActions = (category: HousingEventCategory): MobileCardAction[] => {
    const actions: MobileCardAction[] = [];

    // Check if category is deleted
    const isDeleted = category.deleted_at;

    if (!isDeleted) {
      // Add actions for non-deleted categories
      actions.push(
        {
          tooltip: 'Edit',
          icon: <EditIcon />,
          onClick: () => handleEdit(category),
          color: 'primary',
        },
        {
          tooltip: 'Delete',
          icon: <DeleteIcon />,
          onClick: () => handleDelete(category),
          color: 'error',
        }
      );
    } else {
      // Add restore action for deleted categories
      actions.push(
        {
          tooltip: 'Restore',
          icon: <RestoreIcon />,
          onClick: () => handleRestore(category),
          color: 'success',
        }
      );
    }

    return actions;
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Reset to first page when switching tabs
    handleChangePage(event, 0);
  };


  const handleEdit = (category: HousingEventCategory) => {
    navigate(`/events/categories/${category.slug}/edit`);
  };

  const handleDelete = (category: HousingEventCategory) => {
    openDeleteConfirmation(
      category.name_en,
      'event category',
      async () => {
        try {
          await deleteEventCategoryMutation.mutateAsync(category.slug);
          showSuccess('Event category deleted successfully');
        } catch (error: any) {
          // Show API response error message if available, otherwise show generic message
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to delete event category';
          showError(errorMessage);
        }
      }
    );
  };

  const handleRestore = (category: HousingEventCategory) => {
    setCategoryToRestore(category);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!categoryToRestore) return;
    
    try {
      await restoreEventCategoryMutation.mutateAsync(categoryToRestore.slug);
      showSuccess(`${categoryToRestore.name_en} restored successfully`);
      setRestoreConfirmOpen(false);
      setCategoryToRestore(null);
    } catch (error: any) {
      showError(error.message || 'Failed to restore event category');
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return <PageLoadingState />;
  }

  if (error) {
    return <PageErrorState error={error} onRetry={refetch} />;
  }

  return (
    <Box>
      {/* Alert System */}
      <ActionAlert 
        success={alert.success}
        error={alert.error}
        onClose={clearAlert}
      />

      {/* Page Header */}
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        breadcrumbs="Dashboard / Events / Categories"
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: () => navigate(PAGE_CONFIG.createButtonPath),
        }}
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        fields={filterFields}
        filters={filters}
        onFilterChange={setFilter}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Active (${eventCategories.filter(c => !c.deleted_at).length})`} />
          <Tab label={`Deleted (${eventCategories.filter(c => c.deleted_at).length})`} />
        </Tabs>
      </Box>

      {/* Content */}
      {filteredCategories.length === 0 ? (
        <PageEmptyState
          title="No Event Categories Found"
          message="No event categories match your current filters."
          actionButton={{
            text: 'Add Category',
            icon: <AddIcon />,
            onClick: () => navigate(PAGE_CONFIG.createButtonPath),
          }}
        />
      ) : isMobile ? (
        // Mobile Cards
        <Box>
          {paginatedCategories.map((category: HousingEventCategory) => (
            <MobileCard
              key={category.id}
              title={category.name_en}
              subtitle={category.name_mm}
              description={category.description}
              actions={getMobileCardActions(category)}
              chips={[
                { label: category.is_active ? 'Active' : 'Inactive', color: category.is_active ? 'info' : 'default' },
                { label: `${category.housing_events_count || 0} events`, color: 'primary' },
              ]}
            />
          ))}
        </Box>
      ) : (
        // Desktop Table
        <StandardTable
          columns={columns}
          data={paginatedCategories}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredCategories.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Confirmation Dialogs */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteConfirmation}
        title="Delete Event Category"
        message={`Are you sure you want to delete "${deleteState.itemName}"? This action cannot be undone.`}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setCategoryToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        itemName={categoryToRestore?.name_en}
        itemType="event category"
        action="restore"
        isLoading={restoreEventCategoryMutation.isPending}
        error={restoreEventCategoryMutation.error?.message}
      />

    </Box>
  );
};

export default EventCategoryListPage;
