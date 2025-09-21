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
  AssignmentInd as AssignIcon,
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
import { Pagination, StatusChip, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ConfirmationDialog, RescheduleDialog, AssignAdminDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem, useManualSearch } from '../../hooks';
import { useBookings, useBookingStatistics, useDeleteBooking, useAcceptBooking, useRescheduleBooking, useCancelBooking, useAssignBooking, useAdminUsers } from '../../services/queries/bookings';
import { FilterState } from '../../constants/filters';
import { Booking } from '../../types/booking';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BookingFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  bookingTypeFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Booking Management',
  description: 'Manage customer appointment bookings',
  createButtonText: 'Add Booking',
  createButtonPath: '/bookings/create',
} as const;

// Filter fields configuration
const createFilterFields = (): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by user name, email, or property...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'rescheduled', label: 'Rescheduled' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'bookingTypeFilter',
    type: 'select',
    label: 'Booking Type',
    options: [
      { value: 'all', label: 'All Types' },
      { value: 'property_consultation', label: 'Property Consultation' },
      { value: 'general_service', label: 'General Service' },
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

const BookingListPage: React.FC = () => {
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

  const { filters, setFilter } = useFilters<BookingFilters>({
    searchTerm: '', // This will be overridden by manual search
    statusFilter: 'all',
    bookingTypeFilter: 'all',
    dateFromFilter: '',
    dateToFilter: '',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();


  // Action confirmation states
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [bookingToAction, setBookingToAction] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reschedule' | 'cancel' | 'assign' | null>(null);
  
  // Reschedule dialog state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  
  // Assign admin dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedBookingForMenu, setSelectedBookingForMenu] = useState<Booking | null>(null);

  // API Queries - Server-side filtering and pagination
  const { data: bookingsResponse, isLoading, error } = useBookings({
    page: page + 1, // API uses 1-based pagination
    per_page: rowsPerPage,
    search: searchTerm || undefined, // Use manual search term
    status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
    booking_type: filters.bookingTypeFilter !== 'all' ? filters.bookingTypeFilter : undefined,
    date_from: filters.dateFromFilter || undefined,
    date_to: filters.dateToFilter || undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Booking statistics for dashboard cards
  const { data: statistics } = useBookingStatistics();
  
  // Admin users for assignment
  const { data: adminUsersResponse, isLoading: loadingAdminUsers } = useAdminUsers();
  const adminUsers = adminUsersResponse?.data || [];

  // Delete and action mutations
  const deleteBookingMutation = useDeleteBooking();
  const acceptBookingMutation = useAcceptBooking();
  const rescheduleBookingMutation = useRescheduleBooking();
  const cancelBookingMutation = useCancelBooking();
  const assignBookingMutation = useAssignBooking();

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

  // Extract bookings data (already filtered and paginated by server)
  const bookings = bookingsResponse?.data || [];
  const pagination = bookingsResponse?.pagination;
  
  // Server-side filtering and pagination - no client-side processing needed
  const filteredBookings = bookings as Booking[];
  const paginatedBookings = bookings as Booking[]; // Already paginated by server

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Bookings',
      value: (statistics?.data as any)?.total_bookings || 0,
      color: 'primary',
      icon: <EventIcon />,
    },
    {
      title: 'Pending Bookings',
      value: (statistics?.data as any)?.pending_bookings || 0,
      color: 'warning',
      icon: <TimeIcon />,
    },
    {
      title: 'Accepted',
      value: (statistics?.data as any)?.accepted_bookings || 0,
      color: 'success',
      icon: <AcceptIcon />,
    },
    {
      title: 'Cancelled',
      value: (statistics?.data as any)?.cancelled_bookings || 0,
      color: 'error',
      icon: <CancelIcon />,
    },
  ], [statistics]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<Booking>[] = useMemo(() => [
    {
      id: 'user',
      label: 'User',
      width: '200px',
      render: (_value, booking) => {
        if (!booking) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {booking.user?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {booking.user?.email || 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'bookingType',
      label: 'Booking Type',
      render: (_value, booking) => {
        if (!booking) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {booking.booking_type === 'property_consultation' ? (
              <PropertyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            ) : (
              <EventIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
            )}
            <Typography variant="body2" fontWeight="500">
              {booking.booking_type === 'property_consultation' ? 'Property Consultation' : 'General Service'}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'appointment',
      label: 'Appointment',
      render: (_value, booking) => {
        if (!booking) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {formatDate(booking.appointment_date, 'display')}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {booking.appointment_time}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, booking) => {
        if (!booking) return <Typography variant="body2">No data</Typography>;
        return <StatusChip status={booking.status} />;
      },
    },
    {
      id: 'assignedAdmin',
      label: 'Assigned Admin',
      render: (_value, booking) => {
        if (!booking) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {booking.assigned_admin?.name || 'Unassigned'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, booking) => {
        if (!booking) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(booking.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, booking) => {
        if (!booking) return <Typography variant="body2">No data</Typography>;
        
        const isDeleted = booking.deleted_at;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Primary Action - View Details (always visible) */}
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/bookings/${booking.id}`)}
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
                    onClick={(e) => handleActionMenuOpen(e, booking)}
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
                  open={Boolean(actionMenuAnchor && selectedBookingForMenu?.id === booking.id)}
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
                  {/* Show different menu items based on booking status */}
                  {booking.status === 'pending' && (
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
                      <MenuItem onClick={() => handleMenuAction('assign')}>
                        <ListItemIcon>
                          <AssignIcon color="info" />
                        </ListItemIcon>
                        <ListItemText>Assign Admin</ListItemText>
                      </MenuItem>
                    </>
                  )}
                  
                  {booking.status === 'accepted' && (
                    <>
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
                      <MenuItem onClick={() => handleMenuAction('assign')}>
                        <ListItemIcon>
                          <AssignIcon color="info" />
                        </ListItemIcon>
                        <ListItemText>Assign Admin</ListItemText>
                      </MenuItem>
                    </>
                  )}
                  
                  {booking.status === 'rescheduled' && (
                    <>
                      <MenuItem onClick={() => handleMenuAction('cancel')}>
                        <ListItemIcon>
                          <CancelIcon color="error" />
                        </ListItemIcon>
                        <ListItemText>Cancel</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuAction('assign')}>
                        <ListItemIcon>
                          <AssignIcon color="info" />
                        </ListItemIcon>
                        <ListItemText>Assign Admin</ListItemText>
                      </MenuItem>
                    </>
                  )}
                  
                  {/* Delete action for all bookings */}
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
  ], [isMobile, navigate, acceptBookingMutation.isPending, rescheduleBookingMutation.isPending, cancelBookingMutation.isPending, assignBookingMutation.isPending, deleteBookingMutation.isPending, actionMenuAnchor, selectedBookingForMenu]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (booking: Booking): MobileCardAction[] => {
    const isDeleted = booking.deleted_at;
    
    const baseActions: MobileCardAction[] = [
      {
        icon: <ViewIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => navigate(`/bookings/${booking.id}`),
      },
    ];
    
    if (!isDeleted) {
      // Show different actions based on booking status (same logic as detail page)
      if (booking.status === 'pending') {
        baseActions.push(
          {
            icon: <AcceptIcon />,
            tooltip: 'Accept',
            color: 'success' as const,
            onClick: () => handleBookingAction(booking, 'accept'),
          },
          {
            icon: <RescheduleIcon />,
            tooltip: 'Reschedule',
            color: 'warning' as const,
            onClick: () => handleBookingAction(booking, 'reschedule'),
          },
          {
            icon: <CancelIcon />,
            tooltip: 'Cancel',
            color: 'error' as const,
            onClick: () => handleBookingAction(booking, 'cancel'),
          },
          {
            icon: <AssignIcon />,
            tooltip: 'Assign',
            color: 'info' as const,
            onClick: () => handleBookingAction(booking, 'assign'),
          }
        );
      } else if (booking.status === 'accepted') {
        baseActions.push(
          {
            icon: <RescheduleIcon />,
            tooltip: 'Reschedule',
            color: 'warning' as const,
            onClick: () => handleBookingAction(booking, 'reschedule'),
          },
          {
            icon: <CancelIcon />,
            tooltip: 'Cancel',
            color: 'error' as const,
            onClick: () => handleBookingAction(booking, 'cancel'),
          },
          {
            icon: <AssignIcon />,
            tooltip: 'Assign',
            color: 'info' as const,
            onClick: () => handleBookingAction(booking, 'assign'),
          }
        );
      } else if (booking.status === 'rescheduled') {
        baseActions.push(
          {
            icon: <CancelIcon />,
            tooltip: 'Cancel',
            color: 'error' as const,
            onClick: () => handleBookingAction(booking, 'cancel'),
          },
          {
            icon: <AssignIcon />,
            tooltip: 'Assign',
            color: 'info' as const,
            onClick: () => handleBookingAction(booking, 'assign'),
          }
        );
      }
      // For cancelled bookings, only show view and delete (no additional actions)
      
      baseActions.push({
        icon: <DeleteIcon />,
        tooltip: 'Delete',
        color: 'error' as const,
        onClick: () => handleDeleteBooking(booking),
      });
    }
    
    return baseActions;
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleDeleteBooking = (booking: Booking) => {
    openDeleteConfirmation(
      `Booking #${booking.id}`,
      'booking',
      async () => {
        try {
          await deleteBookingMutation.mutateAsync(booking.id);
          showSuccess(`Booking #${booking.id} deleted successfully!`, true);
        } catch (error: any) {
          showError(error.message || 'Failed to delete booking. Please try again.', true);
        }
      }
    );
  };

  const handleBookingAction = (booking: Booking, action: 'accept' | 'reschedule' | 'cancel' | 'assign') => {
    if (action === 'reschedule') {
      // Only open reschedule dialog if booking has valid date and time
      if (booking.appointment_date && booking.appointment_time) {
        setBookingToAction(booking);
        setRescheduleDialogOpen(true);
      } else {
        showError('Cannot reschedule booking: Missing appointment date or time.', true);
      }
    } else if (action === 'assign') {
      setBookingToAction(booking);
      setAssignDialogOpen(true);
    } else {
      setBookingToAction(booking);
      setActionType(action);
      setActionConfirmOpen(true);
    }
  };

  const handleConfirmAction = async (actionData?: any) => {
    if (!bookingToAction || !actionType) return;
    
    try {
      switch (actionType) {
        case 'accept':
          await acceptBookingMutation.mutateAsync({ 
            id: bookingToAction.id, 
            data: { admin_notes: actionData } 
          });
          break;
        case 'reschedule':
          await rescheduleBookingMutation.mutateAsync({ 
            id: bookingToAction.id, 
            data: { 
              appointment_date: actionData?.appointment_date || bookingToAction.appointment_date,
              appointment_time: actionData?.appointment_time || bookingToAction.appointment_time,
              admin_notes: actionData?.admin_notes 
            } 
          });
          break;
        case 'cancel':
          await cancelBookingMutation.mutateAsync({ 
            id: bookingToAction.id, 
            data: { 
              cancellation_reason: actionData || 'Cancelled by admin',
              admin_notes: actionData 
            } 
          });
          break;
        case 'assign':
          await assignBookingMutation.mutateAsync({ 
            id: bookingToAction.id, 
            data: { 
              assigned_admin_id: actionData?.assigned_admin_id || 1, // Default to admin ID 1
              admin_notes: actionData?.admin_notes 
            } 
          });
          break;
      }
      
      showSuccess(`Booking #${bookingToAction.id} ${actionType}ed successfully!`, true);
      setActionConfirmOpen(false);
      setBookingToAction(null);
      setActionType(null);
    } catch (error: any) {
      showError(error.message || `Failed to ${actionType} booking. Please try again.`, true);
    }
  };

  // Reschedule dialog handlers
  const handleRescheduleConfirm = async (data: { appointment_date: string; appointment_time: string; admin_notes?: string }) => {
    if (!bookingToAction) return;
    
    try {
      await rescheduleBookingMutation.mutateAsync({
        id: bookingToAction.id,
        data: {
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          admin_notes: data.admin_notes
        }
      });
      
      showSuccess(`Booking #${bookingToAction.id} rescheduled successfully!`, true);
      setRescheduleDialogOpen(false);
      setBookingToAction(null);
    } catch (error: any) {
      showError(error.message || 'Failed to reschedule booking. Please try again.', true);
    }
  };

  const handleRescheduleClose = () => {
    setRescheduleDialogOpen(false);
    setBookingToAction(null);
  };

  // Assign admin dialog handlers
  const handleAssignConfirm = async (adminId: number) => {
    if (!bookingToAction) return;
    
    try {
      await assignBookingMutation.mutateAsync({
        id: bookingToAction.id,
        data: { assigned_admin_id: adminId }
      });
      
      showSuccess(`Booking #${bookingToAction.id} assigned successfully!`, true);
      setAssignDialogOpen(false);
      setBookingToAction(null);
    } catch (error: any) {
      showError(error.message || 'Failed to assign booking. Please try again.', true);
    }
  };

  const handleAssignClose = () => {
    setAssignDialogOpen(false);
    setBookingToAction(null);
  };

  // Action menu handlers
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, booking: Booking) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedBookingForMenu(booking);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedBookingForMenu(null);
  };

  const handleMenuAction = (action: 'accept' | 'reschedule' | 'cancel' | 'assign' | 'delete') => {
    if (!selectedBookingForMenu) return;
    
    if (action === 'delete') {
      handleDeleteBooking(selectedBookingForMenu);
    } else {
      handleBookingAction(selectedBookingForMenu, action);
    }
    
    handleActionMenuClose();
  };

  const handleAddBooking = () => {
    navigate('/bookings/create');
  };


  // Custom filter change handler that handles search input specially
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      // Use manual search for search input
      handleInputChange(value);
    } else {
      // Use regular filter for other inputs
      setFilter(key as keyof BookingFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();
    
    // Reset all filters to default values
    setFilter('statusFilter', 'all');
    setFilter('bookingTypeFilter', 'all');
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
          title="Bookings"
          subtitle="Manage customer appointment bookings"
          actionButton={{
            text: "Refresh",
            icon: <RefreshIcon />,
            onClick: () => window.location.reload()
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Bookings"
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
        breadcrumbs="Dashboard / Booking Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddBooking
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
          ) : filteredBookings.length > 0 ? (
            paginatedBookings.map((booking, index) => (
              <MobileCard
                key={booking.id}
                title={`Booking #${booking.id}`}
                subtitle={booking.user?.name || 'N/A'}
                rowNumber={(page * rowsPerPage) + index + 1}
                showRowNumber={true}
                description={booking.user_notes || 'No notes'}
                avatar={<UserIcon />}
                avatarColor="primary.main"
                status={{
                  label: booking.status === 'pending' ? 'Pending' : 
                         booking.status === 'accepted' ? 'Accepted' : 
                         booking.status === 'rescheduled' ? 'Rescheduled' : 
                         booking.status === 'cancelled' ? 'Cancelled' : 'Unknown',
                  color: booking.status === 'pending' ? 'warning' : 
                         booking.status === 'accepted' ? 'success' : 
                         booking.status === 'rescheduled' ? 'info' : 
                         booking.status === 'cancelled' ? 'error' : 'default',
                }}
                chips={[
                  {
                    label: booking.booking_type === 'property_consultation' ? 'Property Consultation' : 'General Service',
                    color: booking.booking_type === 'property_consultation' ? 'primary' : 'secondary',
                  },
                  {
                    label: `${formatDate(booking.appointment_date, 'display')} at ${booking.appointment_time}`,
                    color: 'info',
                  },
                  {
                    label: booking.assigned_admin?.name || 'Unassigned',
                    color: 'default',
                  },
                ]}
                actions={createMobileCardActions(booking)}
                onClick={() => navigate(`/bookings/${booking.id}`)}
                clickable={true}
              />
            ))
          ) : (
            <PageEmptyState
              title="No Bookings Found"
              message="No bookings match your current filters. Try adjusting your search criteria."
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
        filteredBookings.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Bookings Found"
            message={searchTerm || filters.statusFilter !== 'all' || filters.bookingTypeFilter !== 'all'
              ? "No bookings match your current filters. Try adjusting your search criteria."
              : "No bookings have been created yet."
            }
          />
        ) : (
        <StandardTable
          columns={columns}
          data={paginatedBookings}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(booking) => booking.id}
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
        isLoading={deleteBookingMutation.isPending}
        error={deleteBookingMutation.error?.message}
      />

      {/* Action Confirmation Dialog */}
      <ConfirmationDialog
        open={actionConfirmOpen}
        onClose={() => {
          setActionConfirmOpen(false);
          setBookingToAction(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        itemName={`Booking #${bookingToAction?.id}`}
        itemType="booking"
        action="custom"
        actionLabel={actionType === 'accept' ? 'Accept' : 
                   actionType === 'reschedule' ? 'Reschedule' : 
                   actionType === 'cancel' ? 'Cancel' : 
                   actionType === 'assign' ? 'Assign' : 'Confirm'}
        actionColor={actionType === 'accept' ? 'success' : 
                    actionType === 'reschedule' ? 'warning' : 
                    actionType === 'cancel' ? 'error' : 
                    actionType === 'assign' ? 'info' : 'primary'}
        isLoading={
          acceptBookingMutation.isPending || 
          rescheduleBookingMutation.isPending || 
          cancelBookingMutation.isPending || 
          assignBookingMutation.isPending
        }
        error={
          acceptBookingMutation.error?.message || 
          rescheduleBookingMutation.error?.message || 
          cancelBookingMutation.error?.message || 
          assignBookingMutation.error?.message
        }
      />

      {/* Reschedule Dialog */}
      <RescheduleDialog
        open={rescheduleDialogOpen}
        onClose={handleRescheduleClose}
        onConfirm={handleRescheduleConfirm}
        currentDate={bookingToAction?.appointment_date || ''}
        currentTime={bookingToAction?.appointment_time || ''}
        isLoading={rescheduleBookingMutation.isPending}
        error={rescheduleBookingMutation.error?.message}
      />

      {/* Assign Admin Dialog */}
      <AssignAdminDialog
        open={assignDialogOpen}
        onClose={handleAssignClose}
        onConfirm={handleAssignConfirm}
        isLoading={assignBookingMutation.isPending}
        error={assignBookingMutation.error?.message}
        adminUsers={adminUsers}
        loadingAdminUsers={loadingAdminUsers}
        currentAssignedAdmin={bookingToAction?.assigned_admin}
      />
    </Box>
  );
};

export default BookingListPage;
