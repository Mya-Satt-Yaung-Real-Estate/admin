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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
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
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem, useEventRegistrationModal } from '../../hooks';
import {
  useEvents,
  useDeleteEvent,
  useRestoreEvent,
  useEventCategories
} from '../../services/queries/events';
import EventRegistrationModal from '../../components/modals/EventRegistrationModal';
import { FilterState } from '../../constants/filters';
import { HousingEvent } from '../../types/event';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EventFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Event Management',
  description: 'Manage all events in the system',
  createButtonText: 'Add Event',
  createButtonPath: '/events/create',
} as const;

const createFilterFields = (categories: any[] = []): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name, description, or location...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'done', label: 'Done' },
    ],
  },
  {
    key: 'categoryFilter',
    type: 'select',
    label: 'Category',
    options: [
      { value: 'all', label: 'All Categories' },
      ...categories.map(category => ({
        value: category.id.toString(),
        label: category.name_en
      }))
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EventListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  const { filters, setFilter } = useFilters<EventFilters>({
    searchTerm: '',
    statusFilter: 'all',
    categoryFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Tab state for active/deleted events
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [eventToRestore, setEventToRestore] = useState<HousingEvent | null>(null);

  // API Queries
  const { data: eventsResponse, isLoading, error, refetch } = useEvents({
    per_page: 100, // Get all events for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Fetch event categories for filter dropdown
  const { data: categoriesResponse } = useEventCategories({
    per_page: 100, // Get all categories
    sort_by: 'name_en',
    sort_direction: 'asc',
  });

  // Get events data
  const events = eventsResponse?.data || [];

  // Registration modal hook
  const {
    modalOpen: registrationModalOpen,
    registrationData,
    registrationLoading,
    registrationError,
    currentPage,
    perPage,
    pagination,
    openModal: openRegistrationModal,
    closeModal: closeRegistrationModal,
    handlePageChange,
    handlePerPageChange,
  } = useEventRegistrationModal({ events });

  // Mutations
  const deleteEventMutation = useDeleteEvent();
  const restoreEventMutation = useRestoreEvent();

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
  const categories = categoriesResponse?.data || [];

  // Create filter fields
  const filterFields = createFilterFields(categories);

  // Filter events using client-side filtering
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    const validEvents = events.filter(event => event != null);

    return validEvents.filter(event => {
      // Check if event is deleted
      const isDeleted = event.deleted_at;

      // Apply tab filter (0 = Active, 1 = Deleted)
      if (activeTab === 0 && isDeleted) return false;
      if (activeTab === 1 && !isDeleted) return false;

      const matchesSearch =
        event.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        event.name_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      const matchesStatus = filters.statusFilter === 'all' || event.status === filters.statusFilter;

      const matchesCategory = filters.categoryFilter === 'all' || 
        event.category?.id.toString() === filters.categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [events, filters, activeTab]);

  // Paginate data
  const paginatedEvents = useMemo(() => {
    return filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredEvents, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Events',
      value: events.length,
      color: 'primary',
      icon: <EventIcon />,
    },
    {
      title: 'Published Events',
      value: events.filter(event => event.status === 'published' && !event.deleted_at).length,
      color: 'success',
      icon: <EventIcon />,
    },
    {
      title: 'Draft Events',
      value: events.filter(event => event.status === 'draft' && !event.deleted_at).length,
      color: 'warning',
      icon: <EventIcon />,
    },
    {
      title: 'Deleted Events',
      value: events.filter(event => event.deleted_at).length,
      color: 'error',
      icon: <EventIcon />,
    },
  ], [events]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<HousingEvent>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {event.name_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {event.name_mm}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'tag',
      label: 'Tag',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {event.tag && event.tag.length > 0 ? (
              event.tag.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                -
              </Typography>
            )}
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'date',
      label: 'Date & Time',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {formatDate(event.date, 'display')}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {event.start_time} - {event.end_time}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'location',
      label: 'Location',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary" noWrap>
            {event.location || '-'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'is_online',
      label: 'Online',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontWeight="500">
            {event.is_online ? 'Yes' : 'No'}
          </Typography>
        );
      },
    },
    {
      id: 'category',
      label: 'Category',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        return (
          <Chip
            label={event.category?.name_en || 'Unknown'}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
      hidden: isMobile,
    },
    {
      id: 'is_active',
      label: 'Active',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        if (event.deleted_at) {
          return <StatusChip status="deleted" />;
        }
        return (
          <Chip
            label={event.is_active ? 'Yes' : 'No'}
            size="small"
            color={event.is_active ? 'success' : 'error'}
            variant="filled"
          />
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(event.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'is_free',
      label: 'Free',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" fontWeight="500">
            {event.is_free ? 'Yes' : 'No'}
          </Typography>
        );
      },
    },
    {
      id: 'need_registration',
      label: 'Registration',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        return (
          <Chip
            label={event.need_registration ? 'Required' : 'Not Required'}
            size="small"
            color={event.need_registration ? 'info' : 'default'}
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'registration_info',
      label: 'Registrations',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;
        
        if (!event.need_registration) {
          return (
            <Typography variant="body2" color="textSecondary">
              -
            </Typography>
          );
        }
        
        const currentCount = event.registration_user_count || 0;
        const capacity = event.user_capacity || 0;
        
        return (
          <Tooltip title="View all registration users" arrow>
            <Box
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                  p: 0.5,
                  mx: -0.5,
                },
              }}
              onClick={() => handleViewRegistrations(event)}
            >
              <Typography variant="body2" fontWeight="500" color="primary">
                {currentCount}/{capacity || '∞'}
              </Typography>
              {capacity > 0 && (
                <Typography variant="caption" color="textSecondary">
                  {Math.round((currentCount / capacity) * 100)}% full
                </Typography>
              )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, event) => {
        if (!event) return <Typography variant="body2">No data</Typography>;

        const isDeleted = event.deleted_at;

        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => handleView(event)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>

            {/* Show different actions based on deleted status */}
            {!isDeleted ? (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(event)}
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(event)}
                    color="error"
                    disabled={deleteEventMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={() => handleRestore(event)}
                  color="success"
                  disabled={restoreEventMutation.isPending}
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

  const getMobileCardActions = (event: HousingEvent): MobileCardAction[] => {
    const actions: MobileCardAction[] = [
      {
        tooltip: 'View',
        icon: <ViewIcon />,
        onClick: () => handleView(event),
        color: 'primary',
      },
    ];

    // Check if event is deleted
    const isDeleted = event.deleted_at;

    if (!isDeleted) {
      // Add actions for non-deleted events
      actions.push(
        {
          tooltip: 'Edit',
          icon: <EditIcon />,
          onClick: () => handleEdit(event),
          color: 'primary',
        },
        {
          tooltip: 'Delete',
          icon: <DeleteIcon />,
          onClick: () => handleDelete(event),
          color: 'error',
        }
      );
    } else {
      // Add restore action for deleted events
      actions.push(
        {
          tooltip: 'Restore',
          icon: <RestoreIcon />,
          onClick: () => handleRestore(event),
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

  const handleView = (event: HousingEvent) => {
    navigate(`/events/${event.slug}`);
  };

  const handleEdit = (event: HousingEvent) => {
    navigate(`/events/${event.slug}/edit`);
  };

  const handleDelete = (event: HousingEvent) => {
    openDeleteConfirmation(
      event.name_en,
      'event',
      async () => {
        try {
          await deleteEventMutation.mutateAsync(event.slug);
          showSuccess('Event deleted successfully');
        } catch (error: any) {
          // Show API response error message if available, otherwise show generic message
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to delete event';
          showError(errorMessage);
        }
      }
    );
  };

  const handleRestore = (event: HousingEvent) => {
    setEventToRestore(event);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!eventToRestore) return;

    try {
      await restoreEventMutation.mutateAsync(eventToRestore.slug);
      showSuccess(`${eventToRestore.name_en} restored successfully`);
      setRestoreConfirmOpen(false);
      setEventToRestore(null);
    } catch (error: any) {
      showError(error.message || 'Failed to restore event');
    }
  };

  // Registration modal handlers
  const handleViewRegistrations = (event: HousingEvent) => {
    if (event.need_registration) {
      openRegistrationModal(event.slug);
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
        breadcrumbs="Dashboard / Events"
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
          <Tab label={`Active (${events.filter(e => !e.deleted_at).length})`} />
          <Tab label={`Deleted (${events.filter(e => e.deleted_at).length})`} />
        </Tabs>
      </Box>

      {/* Content */}
      {filteredEvents.length === 0 ? (
        <PageEmptyState
          title="No Events Found"
          message="No events match your current filters."
          actionButton={{
            text: 'Add Event',
            icon: <AddIcon />,
            onClick: () => navigate(PAGE_CONFIG.createButtonPath),
          }}
        />
      ) : isMobile ? (
        // Mobile Cards
        <Box>
          {paginatedEvents.map((event: HousingEvent) => (
            <MobileCard
              key={event.id}
              title={event.name_en}
              subtitle={event.name_mm}
              description={event.description}
              actions={getMobileCardActions(event)}
              chips={[
                { label: event.is_active ? 'Active' : 'Inactive', color: event.is_active ? 'info' : 'error' },
                { label: event.category?.name_en || 'Unknown', color: 'primary' },
                { label: event.is_online ? 'Yes' : 'No', color: event.is_online ? 'info' : 'default' },
                { label: event.is_free ? 'Yes' : 'No', color: event.is_free ? 'info' : 'warning' },
                { 
                  label: event.need_registration ? 'Registration Required' : 'No Registration', 
                  color: event.need_registration ? 'info' : 'default' 
                },
                ...(event.need_registration ? [{
                  label: `${event.registration_user_count || 0}/${event.user_capacity || '∞'}`,
                  color: 'secondary' as const
                }] : [])
              ]}
            />
          ))}
        </Box>
      ) : (
        // Desktop Table
        <StandardTable
          columns={columns}
          data={paginatedEvents}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredEvents.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Confirmation Dialogs */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteConfirmation}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteState.itemName}"? This action cannot be undone.`}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setEventToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        itemName={eventToRestore?.name_en}
        itemType="event"
        action="restore"
        isLoading={restoreEventMutation.isPending}
        error={restoreEventMutation.error?.message}
      />

      {/* Registration Modal */}
      <EventRegistrationModal
        open={registrationModalOpen}
        onClose={closeRegistrationModal}
        data={registrationData}
        loading={registrationLoading}
        error={registrationError}
        currentPage={currentPage}
        perPage={perPage}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

    </Box>
  );
};

export default EventListPage;
