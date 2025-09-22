import React, { useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  CheckCircle as AcceptIcon,
  Schedule as RescheduleIcon,
  Cancel as CancelIcon,
  AssignmentTurnedIn as CompleteIcon,
  Person as UserIcon,
  Home as PropertyIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ConfirmationDialog, RescheduleDialog, AppointmentRescheduleDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem, useManualSearch } from '../../hooks';
import { useAppointments, useAppointmentStatistics, useDeleteAppointment, useAcceptAppointment, useRescheduleAppointment, useCancelAppointment, useCompleteAppointment, useAppointmentTimeSlots } from '../../services/queries/appointments';
import { FilterState } from '../../constants/filters';
import { Appointment } from '../../types/appointment';
import { formatDate } from '../../constants/dateFormats';
import dayjs from 'dayjs';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AppointmentFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  propertyTypeFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Appointment Management',
  description: 'Manage customer appointment requests',
  createButtonText: 'Add Appointment',
  createButtonPath: '/appointments/create',
} as const;

// Filter fields configuration
const createFilterFields = (): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by user name, email, or contact details...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'rescheduled', label: 'Rescheduled' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'propertyTypeFilter',
    type: 'select',
    label: 'Property Type',
    options: [
      { value: 'all', label: 'All Types' },
      // This would be populated from API
    ],
  },
  {
    key: 'dateFromFilter',
    type: 'date',
    label: 'From Date',
  },
  {
    key: 'dateToFilter',
    type: 'date',
    label: 'To Date',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AppointmentListPage: React.FC = () => {
  const navigate = useNavigate();
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

  const { filters, setFilter } = useFilters<AppointmentFilters>({
    searchTerm: '', // This will be overridden by manual search
    statusFilter: 'all',
    propertyTypeFilter: 'all',
    dateFromFilter: '',
    dateToFilter: '',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Action confirmation states
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [appointmentToAction, setAppointmentToAction] = useState<Appointment | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reschedule' | 'cancel' | 'complete' | null>(null);
  
  // Reschedule dialog state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  
  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAppointmentForMenu, setSelectedAppointmentForMenu] = useState<Appointment | null>(null);

  // API Queries - Server-side filtering and pagination
  const { data: appointmentsResponse, isLoading, error } = useAppointments({
    page: page + 1, // API uses 1-based pagination
    per_page: rowsPerPage,
    search: searchTerm || undefined, // Use manual search term
    status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
    property_listing_type_id: filters.propertyTypeFilter !== 'all' ? parseInt(filters.propertyTypeFilter) : undefined,
    date_from: filters.dateFromFilter || undefined,
    date_to: filters.dateToFilter || undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Appointment statistics for dashboard cards
  const { data: statistics } = useAppointmentStatistics();
  
  // Time slots for reschedule dialog
  const { data: timeSlots } = useAppointmentTimeSlots();

  // Delete and action mutations
  const deleteAppointmentMutation = useDeleteAppointment();
  const acceptAppointmentMutation = useAcceptAppointment();
  const rescheduleAppointmentMutation = useRescheduleAppointment();
  const cancelAppointmentMutation = useCancelAppointment();
  const completeAppointmentMutation = useCompleteAppointment();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract appointments data (already filtered and paginated by server)
  const appointments = appointmentsResponse?.data || [];
  const pagination = appointmentsResponse?.pagination;
  
  // Server-side filtering and pagination - no client-side processing needed
  const filteredAppointments = appointments as Appointment[];
  const paginatedAppointments = appointments as Appointment[]; // Already paginated by server

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Appointments',
      value: (statistics?.data as any)?.total_appointments || 0,
      color: 'primary',
      icon: <EventIcon />,
    },
    {
      title: 'Pending Appointments',
      value: (statistics?.data as any)?.pending_appointments || 0,
      color: 'warning',
      icon: <TimeIcon />,
    },
    {
      title: 'Confirmed',
      value: (statistics?.data as any)?.confirmed_appointments || 0,
      color: 'success',
      icon: <AcceptIcon />,
    },
    {
      title: 'Completed',
      value: (statistics?.data as any)?.completed_appointments || 0,
      color: 'info',
      icon: <CompleteIcon />,
    },
  ], [statistics]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<Appointment>[] = useMemo(() => [
    {
      id: 'user',
      label: 'User',
      width: '200px',
      render: (_value, appointment) => {
        if (!appointment) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {appointment.contact_name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {appointment.contact_email || 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'propertyType',
      label: 'Property Type',
      render: (_value, appointment) => {
        if (!appointment) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PropertyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight="500">
              {appointment.property_listing_type?.name_en || 'N/A'}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'appointment',
      label: 'Prefer Date & Time',
      render: (_value, appointment) => {
        if (!appointment) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {formatDate(appointment.date, 'display')}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {appointment.prefer_time_range || 'No time set'}
            </Typography>
          </Box>
        );
      },
    },    
    {
      id: 'status',
      label: 'Status',
      render: (_value, appointment) => {
        if (!appointment) return <Typography variant="body2">No data</Typography>;
        return <StatusChip status={appointment.status} />;
      },
    },
    {
      id: 'scheduleTime',
      label: 'Reschedule Date & Time',
      render: (_value, appointment) => {
        if (!appointment) return <Typography variant="body2">No data</Typography>;
        
        // If not scheduled, show dash
        if (!appointment.schedule_date && !appointment.schedule_time_range) {
          return <Typography variant="body2" color="textSecondary">-</Typography>;
        }
        
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {appointment.schedule_date ? formatDate(appointment.schedule_date, 'display') : '-'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {appointment.schedule_time_range || '-'}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, appointment) => {
        if (!appointment) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(appointment.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, appointment) => {
        if (!appointment) return <Typography variant="body2">No data</Typography>;
        
        const isDeleted = appointment.deleted_at;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Primary Action - View Details (always visible) */}
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/appointments/${appointment.id}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            
            {/* Secondary Actions - Dropdown Menu */}
            {!isDeleted && (
              <>
                <Tooltip title="More Actions">
                  <IconButton
                    size="small"
                    onClick={(e) => handleActionMenuOpen(e, appointment)}
                    color="default"
                    sx={{ 
                      bgcolor: 'grey.100', 
                      '&:hover': { bgcolor: 'grey.200' } 
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
                
                {/* Action Menu */}
                <Menu
                  anchorEl={actionMenuAnchor}
                  open={Boolean(actionMenuAnchor && selectedAppointmentForMenu?.id === appointment.id)}
                  onClose={handleActionMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {/* Show different menu items based on appointment status */}
                  {appointment.status === 'pending' && (
                    <>
                      <MenuItem onClick={() => handleMenuAction('accept')}>
                        <ListItemIcon>
                          <AcceptIcon color="success" />
                        </ListItemIcon>
                        <ListItemText>Accept</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuAction('reschedule')}>
                        <ListItemIcon>
                          <RescheduleIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText>Reschedule</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuAction('cancel')}>
                        <ListItemIcon>
                          <CancelIcon color="error" />
                        </ListItemIcon>
                        <ListItemText>Cancel</ListItemText>
                      </MenuItem>
                    </>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <>
                      <MenuItem onClick={() => handleMenuAction('reschedule')}>
                        <ListItemIcon>
                          <RescheduleIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText>Reschedule</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuAction('complete')}>
                        <ListItemIcon>
                          <CompleteIcon color="info" />
                        </ListItemIcon>
                        <ListItemText>Complete</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuAction('cancel')}>
                        <ListItemIcon>
                          <CancelIcon color="error" />
                        </ListItemIcon>
                        <ListItemText>Cancel</ListItemText>
                      </MenuItem>
                    </>
                  )}
                  
                  {appointment.status === 'rescheduled' && (
                    <>
                      <MenuItem onClick={() => handleMenuAction('complete')}>
                        <ListItemIcon>
                          <CompleteIcon color="info" />
                        </ListItemIcon>
                        <ListItemText>Complete</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuAction('cancel')}>
                        <ListItemIcon>
                          <CancelIcon color="error" />
                        </ListItemIcon>
                        <ListItemText>Cancel</ListItemText>
                      </MenuItem>
                    </>
                  )}
                  
                  {/* Delete action for all appointments */}
                  <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                      <DeleteIcon color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
            
            {isDeleted && (
              <Typography variant="caption" color="textSecondary">
                Deleted
              </Typography>
            )}
          </Box>
        );
      },
    },
  ], [isMobile, navigate, acceptAppointmentMutation.isPending, rescheduleAppointmentMutation.isPending, cancelAppointmentMutation.isPending, completeAppointmentMutation.isPending, deleteAppointmentMutation.isPending, actionMenuAnchor, selectedAppointmentForMenu]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (appointment: Appointment): MobileCardAction[] => {
    const isDeleted = appointment.deleted_at;
    
    const baseActions: MobileCardAction[] = [
      {
        icon: <ViewIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => navigate(`/appointments/${appointment.id}`),
      },
    ];
    
    if (!isDeleted) {
      // Show different actions based on appointment status
      if (appointment.status === 'pending') {
        baseActions.push(
          {
            icon: <AcceptIcon />,
            tooltip: 'Accept',
            color: 'success' as const,
            onClick: () => handleAppointmentAction(appointment, 'accept'),
          },
          {
            icon: <RescheduleIcon />,
            tooltip: 'Reschedule',
            color: 'warning' as const,
            onClick: () => handleAppointmentAction(appointment, 'reschedule'),
          },
          {
            icon: <CancelIcon />,
            tooltip: 'Cancel',
            color: 'error' as const,
            onClick: () => handleAppointmentAction(appointment, 'cancel'),
          }
        );
      } else if (appointment.status === 'confirmed') {
        baseActions.push(
          {
            icon: <RescheduleIcon />,
            tooltip: 'Reschedule',
            color: 'warning' as const,
            onClick: () => handleAppointmentAction(appointment, 'reschedule'),
          },
          {
            icon: <CompleteIcon />,
            tooltip: 'Complete',
            color: 'info' as const,
            onClick: () => handleAppointmentAction(appointment, 'complete'),
          },
          {
            icon: <CancelIcon />,
            tooltip: 'Cancel',
            color: 'error' as const,
            onClick: () => handleAppointmentAction(appointment, 'cancel'),
          }
        );
      } else if (appointment.status === 'rescheduled') {
        baseActions.push(
          {
            icon: <CompleteIcon />,
            tooltip: 'Complete',
            color: 'info' as const,
            onClick: () => handleAppointmentAction(appointment, 'complete'),
          },
          {
            icon: <CancelIcon />,
            tooltip: 'Cancel',
            color: 'error' as const,
            onClick: () => handleAppointmentAction(appointment, 'cancel'),
          }
        );
      }
      
      baseActions.push({
        icon: <DeleteIcon />,
        tooltip: 'Delete',
        color: 'error' as const,
        onClick: () => handleDeleteAppointment(appointment),
      });
    }
    
    return baseActions;
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleDeleteAppointment = (appointment: Appointment) => {
    openDeleteConfirmation(
      `Appointment #${appointment.id}`,
      'appointment',
      async () => {
        try {
          await deleteAppointmentMutation.mutateAsync(appointment.id);
          showSuccess(`Appointment #${appointment.id} deleted successfully!`, true);
        } catch (error: any) {
          showError(error.message || 'Failed to delete appointment. Please try again.', true);
        }
      }
    );
  };

  const handleAppointmentAction = (appointment: Appointment, action: 'accept' | 'reschedule' | 'cancel' | 'complete') => {
    if (action === 'reschedule') {
      // Only open reschedule dialog if appointment has valid date
      if (appointment.date) {
        setAppointmentToAction(appointment);
        setRescheduleDialogOpen(true);
      } else {
        showError('Cannot reschedule appointment: Missing appointment date.', true);
      }
    } else {
      setAppointmentToAction(appointment);
      setActionType(action);
      setActionConfirmOpen(true);
    }
  };

  const handleConfirmAction = async (actionData?: any) => {
    if (!appointmentToAction || !actionType) return;
    
    try {
      switch (actionType) {
        case 'accept':
          await acceptAppointmentMutation.mutateAsync({ 
            id: appointmentToAction.id, 
            data: { admin_notes: actionData } 
          });
          break;
        case 'reschedule':
          await rescheduleAppointmentMutation.mutateAsync({ 
            id: appointmentToAction.id, 
            data: { 
              date: actionData?.date || appointmentToAction.date,
              schedule_start_time: actionData?.schedule_start_time || '09:00:00',
              schedule_end_time: actionData?.schedule_end_time || '11:00:00',
              admin_notes: actionData?.admin_notes 
            } 
          });
          break;
        case 'cancel':
          await cancelAppointmentMutation.mutateAsync({ 
            id: appointmentToAction.id, 
            data: { 
              admin_notes: actionData || 'Cancelled by admin'
            } 
          });
          break;
        case 'complete':
          await completeAppointmentMutation.mutateAsync({ 
            id: appointmentToAction.id, 
            data: { 
              admin_notes: actionData || 'Completed by admin'
            } 
          });
          break;
      }
      
      showSuccess(`Appointment #${appointmentToAction.id} ${actionType}ed successfully!`, true);
      setActionConfirmOpen(false);
      setAppointmentToAction(null);
      setActionType(null);
    } catch (error: any) {
      showError(error.message || `Failed to ${actionType} appointment. Please try again.`, true);
    }
  };

  // Reschedule dialog handlers
  const handleRescheduleConfirm = async (data: { schedule_date: string; schedule_start_time: string; schedule_end_time: string; admin_notes?: string }) => {
    if (!appointmentToAction) return;
    
    try {
      await rescheduleAppointmentMutation.mutateAsync({
        id: appointmentToAction.id,
        data: {
          schedule_date: data.schedule_date,
          schedule_start_time: data.schedule_start_time,
          schedule_end_time: data.schedule_end_time,
          admin_notes: data.admin_notes
        }
      });
      
      showSuccess(`Appointment #${appointmentToAction.id} rescheduled successfully!`, true);
      setRescheduleDialogOpen(false);
      setAppointmentToAction(null);
    } catch (error: any) {
      showError(error.message || 'Failed to reschedule appointment. Please try again.', true);
    }
  };

  const handleRescheduleClose = () => {
    setRescheduleDialogOpen(false);
    setAppointmentToAction(null);
  };

  // Action menu handlers
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, appointment: Appointment) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedAppointmentForMenu(appointment);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedAppointmentForMenu(null);
  };

  const handleMenuAction = (action: 'accept' | 'reschedule' | 'cancel' | 'complete' | 'delete') => {
    if (!selectedAppointmentForMenu) return;
    
    if (action === 'delete') {
      handleDeleteAppointment(selectedAppointmentForMenu);
    } else {
      handleAppointmentAction(selectedAppointmentForMenu, action);
    }
    
    handleActionMenuClose();
  };

  // Custom filter change handler that handles search input specially
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      // Use manual search for search input
      handleInputChange(value);
    } else {
      // Use regular filter for other inputs
      setFilter(key as keyof AppointmentFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();
    
    // Reset all filters to default values
    setFilter('statusFilter', 'all');
    setFilter('propertyTypeFilter', 'all');
    setFilter('dateFromFilter', '');
    setFilter('dateToFilter', '');
    
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
          title="Appointments"
          subtitle="Manage customer appointment requests"
          actionButton={{
            text: "Refresh",
            icon: <RefreshIcon />,
            onClick: () => window.location.reload()
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Appointments"
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
        breadcrumbs="Dashboard / Appointment Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: () => navigate('/appointments/create')
        }}
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
        fields={createFilterFields()}
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
          ) : filteredAppointments.length > 0 ? (
            paginatedAppointments.map((appointment, index) => (
              <MobileCard
                key={appointment.id}
                title={`Appointment #${appointment.id}`}
                subtitle={appointment.contact_name || 'N/A'}
                rowNumber={(page * rowsPerPage) + index + 1}
                showRowNumber={true}
                description={appointment.message || 'No message'}
                avatar={<UserIcon />}
                avatarColor="primary.main"
                status={{
                  label: appointment.status === 'pending' ? 'Pending' : 
                         appointment.status === 'confirmed' ? 'Confirmed' : 
                         appointment.status === 'rescheduled' ? 'Rescheduled' : 
                         appointment.status === 'completed' ? 'Completed' : 
                         appointment.status === 'cancelled' ? 'Cancelled' : 'Unknown',
                  color: appointment.status === 'pending' ? 'warning' : 
                         appointment.status === 'confirmed' ? 'success' : 
                         appointment.status === 'rescheduled' ? 'info' : 
                         appointment.status === 'completed' ? 'info' : 
                         appointment.status === 'cancelled' ? 'error' : 'default',
                }}
                chips={[
                  {
                    label: appointment.property_listing_type?.name_en || 'N/A',
                    color: 'primary',
                  },
                  {
                    label: `${formatDate(appointment.date, 'display')} - ${appointment.display_time_range || 'No time'}`,
                    color: 'info',
                  },
                  {
                    label: `Schedule: ${appointment.schedule_time_range || 'No Schedule'}`,
                    color: 'secondary',
                  },
                ]}
                actions={createMobileCardActions(appointment)}
                onClick={() => navigate(`/appointments/${appointment.id}`)}
                clickable={true}
              />
            ))
          ) : (
            <PageEmptyState
              title="No Appointments Found"
              message="No appointments match your current filters. Try adjusting your search criteria."
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
        filteredAppointments.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Appointments Found"
            message={searchTerm || filters.statusFilter !== 'all' || filters.propertyTypeFilter !== 'all'
              ? "No appointments match your current filters. Try adjusting your search criteria."
              : "No appointments have been created yet."
            }
          />
        ) : (
        <StandardTable
          columns={columns}
          data={paginatedAppointments}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(appointment) => appointment.id}
          loading={isLoading}
          showRowNumbers={true}
          rowNumberLabel="No."
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
        isLoading={deleteAppointmentMutation.isPending}
        error={deleteAppointmentMutation.error?.message}
      />

      {/* Action Confirmation Dialog */}
      <ConfirmationDialog
        open={actionConfirmOpen}
        onClose={() => {
          setActionConfirmOpen(false);
          setAppointmentToAction(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        itemName={`Appointment #${appointmentToAction?.id}`}
        itemType="appointment"
        action="custom"
        actionLabel={actionType === 'accept' ? 'Accept' : 
                   actionType === 'reschedule' ? 'Reschedule' : 
                   actionType === 'cancel' ? 'Cancel' : 
                   actionType === 'complete' ? 'Complete' : 'Confirm'}
        actionColor={actionType === 'accept' ? 'success' : 
                    actionType === 'reschedule' ? 'warning' : 
                    actionType === 'cancel' ? 'error' : 
                    actionType === 'complete' ? 'info' : 'primary'}
        isLoading={
          acceptAppointmentMutation.isPending || 
          rescheduleAppointmentMutation.isPending || 
          cancelAppointmentMutation.isPending || 
          completeAppointmentMutation.isPending
        }
        error={
          acceptAppointmentMutation.error?.message || 
          rescheduleAppointmentMutation.error?.message || 
          cancelAppointmentMutation.error?.message || 
          completeAppointmentMutation.error?.message
        }
      />

      {/* Reschedule Dialog */}
      <AppointmentRescheduleDialog
        open={rescheduleDialogOpen}
        onClose={handleRescheduleClose}
        onConfirm={handleRescheduleConfirm}
        currentDate={appointmentToAction?.date ? dayjs(appointmentToAction.date).format('YYYY-MM-DD') : ''}
        currentTime={appointmentToAction?.schedule_time_range && appointmentToAction?.schedule_time_range !== '-' 
          ? appointmentToAction?.schedule_time_range 
          : appointmentToAction?.prefer_time_range || ''}
        preferTimeSlots={timeSlots || []}
        isLoading={rescheduleAppointmentMutation.isPending}
        error={rescheduleAppointmentMutation.error?.message}
      />
    </Box>
  );
};

export default AppointmentListPage;
