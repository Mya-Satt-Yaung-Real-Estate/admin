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
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
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
  useAppointmentPreferTimesWithTrashed,
  useDeleteAppointmentPreferTime,
  useRestoreAppointmentPreferTime,
} from '../../services/queries/appointmentPreferTimes';
import { AppointmentPreferTime } from '../../services/api/appointmentPreferTimes';
import { FilterState } from '../../constants/filters';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AppointmentPreferTimeFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Appointment Prefer Times',
  description: 'Manage appointment time slots',
  createButtonText: 'Add Time Slot',
  createButtonPath: '/appointment-prefer-times/create',
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

const AppointmentPreferTimeListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  const { filters, setFilter } = useFilters<AppointmentPreferTimeFilters>({
    searchTerm: '',
    statusFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Tab state for active/deleted time slots
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [timeSlotToRestore, setTimeSlotToRestore] = useState<AppointmentPreferTime | null>(null);

  // API Queries
  const { data: timeSlotsResponse, isLoading, error, refetch } = useAppointmentPreferTimesWithTrashed();

  // Mutations
  const deleteTimeSlotMutation = useDeleteAppointmentPreferTime();
  const restoreTimeSlotMutation = useRestoreAppointmentPreferTime();

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

  // Extract time slots data
  const timeSlots = timeSlotsResponse?.data || [];
  
  // Create filter fields
  const filterFields = createFilterFields();

  // Filter time slots using client-side filtering
  const filteredTimeSlots = useMemo(() => {
    if (!timeSlots || timeSlots.length === 0) return [];
    
    const validTimeSlots = timeSlots.filter(timeSlot => timeSlot != null);
    
    return validTimeSlots.filter(timeSlot => {
      // Check if time slot is deleted
      const isDeleted = timeSlot.deleted_at;
      
      // Apply tab filter (0 = Active, 1 = Deleted)
      if (activeTab === 0 && isDeleted) return false;
      if (activeTab === 1 && !isDeleted) return false;
      
      const matchesSearch = 
        timeSlot.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (timeSlot.description && timeSlot.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && timeSlot.is_active) ||
        (filters.statusFilter === 'inactive' && !timeSlot.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }, [timeSlots, filters, activeTab]);

  // Paginate data
  const paginatedTimeSlots = useMemo(() => {
    return filteredTimeSlots.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTimeSlots, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Time Slots',
      value: timeSlots.length,
      color: 'primary',
      icon: <TimeIcon />,
    },
    {
      title: 'Active Time Slots',
      value: timeSlots.filter(timeSlot => !timeSlot.deleted_at).length,
      color: 'success',
      icon: <ScheduleIcon />,
    },
    {
      title: 'Inactive Time Slots',
      value: timeSlots.filter(timeSlot => !timeSlot.is_active && !timeSlot.deleted_at).length,
      color: 'warning',
      icon: <ScheduleIcon />,
    },
    {
      title: 'Deleted Time Slots',
      value: timeSlots.filter(timeSlot => timeSlot.deleted_at).length,
      color: 'error',
      icon: <DeleteIcon />,
    },
  ], [timeSlots]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<AppointmentPreferTime>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      render: (_value, timeSlot) => {
        if (!timeSlot) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon color="action" />
            <Typography variant="subtitle2" fontWeight="600">
              {timeSlot.name}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'timeRange',
      label: 'Time Range',
      render: (_value, timeSlot) => {
        if (!timeSlot) return <Typography variant="body2">No data</Typography>;
        const formatTime = (time: string) => {
          return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        };
        return (
          <Typography variant="body2">
            {formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}
          </Typography>
        );
      },
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, timeSlot) => {
        if (!timeSlot) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary" noWrap>
            {timeSlot.description || '-'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, timeSlot) => {
        if (!timeSlot) return <Typography variant="body2">No data</Typography>;
        if (timeSlot.deleted_at) {
          return <StatusChip status="deleted" />;
        }
        return <StatusChip status={timeSlot.is_active ? 'active' : 'inactive'} />;
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, timeSlot) => {
        if (!timeSlot) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(timeSlot.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, timeSlot) => {
        if (!timeSlot) return <Typography variant="body2">No data</Typography>;
        
        const isDeleted = timeSlot.deleted_at;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Show different actions based on deleted status */}
            {!isDeleted ? (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(timeSlot)}
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(timeSlot)}
                    color="error"
                    disabled={deleteTimeSlotMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={() => handleRestore(timeSlot)}
                  color="success"
                  disabled={restoreTimeSlotMutation.isPending}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ], [isMobile, deleteTimeSlotMutation.isPending, restoreTimeSlotMutation.isPending]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const getMobileCardActions = (timeSlot: AppointmentPreferTime): MobileCardAction[] => {
    const actions: MobileCardAction[] = [];

    // Check if time slot is deleted
    const isDeleted = timeSlot.deleted_at;

    if (!isDeleted) {
      // Add actions for non-deleted time slots
      actions.push(
        {
          tooltip: 'Edit',
          icon: <EditIcon />,
          onClick: () => handleEdit(timeSlot),
          color: 'primary',
        },
        {
          tooltip: 'Delete',
          icon: <DeleteIcon />,
          onClick: () => handleDelete(timeSlot),
          color: 'error',
        }
      );
    } else {
      // Add restore action for deleted time slots
      actions.push(
        {
          tooltip: 'Restore',
          icon: <RestoreIcon />,
          onClick: () => handleRestore(timeSlot),
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

  const handleEdit = (timeSlot: AppointmentPreferTime) => {
    navigate(`/appointment-prefer-times/${timeSlot.id}/edit`);
  };

  const handleDelete = (timeSlot: AppointmentPreferTime) => {
    openDeleteConfirmation(
      timeSlot.name,
      'time slot',
      async () => {
        try {
          await deleteTimeSlotMutation.mutateAsync(timeSlot.id);
          showSuccess('Time slot deleted successfully');
        } catch (error: any) {
          // Show API response error message if available, otherwise show generic message
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to delete time slot';
          showError(errorMessage);
        }
      }
    );
  };

  const handleRestore = (timeSlot: AppointmentPreferTime) => {
    setTimeSlotToRestore(timeSlot);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!timeSlotToRestore) return;
    
    try {
      await restoreTimeSlotMutation.mutateAsync(timeSlotToRestore.id);
      showSuccess(`${timeSlotToRestore.name} restored successfully`);
      setRestoreConfirmOpen(false);
      setTimeSlotToRestore(null);
    } catch (error: any) {
      showError(error.message || 'Failed to restore time slot');
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
          <Tab label={`Active (${timeSlots.filter(t => !t.deleted_at).length})`} />
          <Tab label={`Deleted (${timeSlots.filter(t => t.deleted_at).length})`} />
        </Tabs>
      </Box>

      {/* Content */}
      {filteredTimeSlots.length === 0 ? (
        <PageEmptyState
          title="No Time Slots Found"
          message="No time slots match your current filters."
          actionButton={{
            text: 'Add Time Slot',
            icon: <AddIcon />,
            onClick: () => navigate(PAGE_CONFIG.createButtonPath),
          }}
        />
      ) : isMobile ? (
        // Mobile Cards
        <Box>
          {paginatedTimeSlots.map((timeSlot: AppointmentPreferTime) => {
            const formatTime = (time: string) => {
              return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
            };
            return (
              <MobileCard
                key={timeSlot.id}
                title={timeSlot.name}
                subtitle={`${formatTime(timeSlot.start_time)} - ${formatTime(timeSlot.end_time)}`}
                description={timeSlot.description}
                actions={getMobileCardActions(timeSlot)}
                chips={[
                  { 
                    label: timeSlot.is_active ? 'Active' : 'Inactive', 
                    color: timeSlot.is_active ? 'info' : 'default' 
                  },
                  { 
                    label: timeSlot.deleted_at ? 'Deleted' : 'Available', 
                    color: timeSlot.deleted_at ? 'error' : 'info' 
                  },
                ]}
              />
            );
          })}
        </Box>
      ) : (
        // Desktop Table
        <StandardTable
          columns={columns}
          data={paginatedTimeSlots}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredTimeSlots.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Confirmation Dialogs */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteConfirmation}
        title="Delete Time Slot"
        message={`Are you sure you want to delete "${deleteState.itemName}"? This action cannot be undone.`}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setTimeSlotToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        itemName={timeSlotToRestore?.name}
        itemType="time slot"
        action="restore"
        isLoading={restoreTimeSlotMutation.isPending}
        error={restoreTimeSlotMutation.error?.message}
      />

    </Box>
  );
};

export default AppointmentPreferTimeListPage;
