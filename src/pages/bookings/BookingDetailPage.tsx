import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as AcceptIcon,
  Schedule as RescheduleIcon,
  Cancel as CancelIcon,
  AssignmentInd as AssignIcon,
  Person as UserIcon,
  Home as PropertyIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Notes as NotesIcon,
  AdminPanelSettings as AdminIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StatusChip, ActionAlert, DeleteConfirmationDialog, ConfirmationDialog, RescheduleDialog, AssignAdminDialog } from '../../components/ui';
import { useBooking, useDeleteBooking, useAcceptBooking, useRescheduleBooking, useCancelBooking, useAssignBooking, useAdminUsers } from '../../services/queries/bookings';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BookingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  const bookingId = parseInt(id || '0');

  // API Queries
  const { data: bookingResponse, isLoading, error } = useBooking(bookingId);
  const booking = bookingResponse?.data;
  
  // Admin users for assignment
  const { data: adminUsersResponse, isLoading: loadingAdminUsers } = useAdminUsers();
  const adminUsers = adminUsersResponse?.data || [];

  // Mutations
  const deleteBookingMutation = useDeleteBooking();
  const acceptBookingMutation = useAcceptBooking();
  const rescheduleBookingMutation = useRescheduleBooking();
  const cancelBookingMutation = useCancelBooking();
  const assignBookingMutation = useAssignBooking();

  // Alert system
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Delete confirmation
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // Action confirmation states
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reschedule' | 'cancel' | 'assign' | null>(null);
  
  // Reschedule dialog state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  
  // Assign admin dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleBack = () => {
    navigate('/bookings');
  };

  const handleEdit = () => {
    navigate(`/bookings/${bookingId}/edit`);
  };

  const handleDelete = () => {
    if (!booking) return;
    openDeleteConfirmation(
      `Booking #${booking.id}`,
      'booking',
      async () => {
        try {
          await deleteBookingMutation.mutateAsync(booking.id);
          showSuccess(`Booking #${booking.id} deleted successfully!`, true);
          navigate('/bookings');
        } catch (error: any) {
          showError(error.message || 'Failed to delete booking. Please try again.', true);
        }
      }
    );
  };

  const handleBookingAction = (action: 'accept' | 'reschedule' | 'cancel' | 'assign') => {
    if (action === 'reschedule') {
      setRescheduleDialogOpen(true);
    } else if (action === 'assign') {
      setAssignDialogOpen(true);
    } else {
      setActionType(action);
      setActionConfirmOpen(true);
    }
  };
  
  // Navigation handlers
  const handleUserClick = () => {
    if (booking?.user?.slug) {
      navigate(`/users/${booking.user.slug}`);
    }
  };
  
  const handlePropertyClick = () => {
    if (booking?.property?.id) {
      navigate(`/properties/${booking.property.id}`);
    }
  };

  // Reschedule dialog handlers
  const handleRescheduleConfirm = async (data: { appointment_date: string; appointment_time: string; admin_notes?: string }) => {
    if (!booking) return;
    
    try {
      await rescheduleBookingMutation.mutateAsync({
        id: booking.id,
        data: {
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          admin_notes: data.admin_notes
        }
      });
      
      
      showSuccess(`Booking #${booking.id} rescheduled successfully!`, true);
      setRescheduleDialogOpen(false);
    } catch (error: any) {
      showError(error.message || 'Failed to reschedule booking. Please try again.', true);
    }
  };

  const handleRescheduleClose = () => {
    setRescheduleDialogOpen(false);
  };

  // Assign admin dialog handlers
  const handleAssignConfirm = async (adminId: number) => {
    if (!booking) return;
    
    try {
      await assignBookingMutation.mutateAsync({
        id: booking.id,
        data: { assigned_admin_id: adminId }
      });
      
      showSuccess(`Booking #${booking.id} assigned successfully!`, true);
      setAssignDialogOpen(false);
    } catch (error: any) {
      showError(error.message || 'Failed to assign booking. Please try again.', true);
    }
  };

  const handleAssignClose = () => {
    setAssignDialogOpen(false);
  };

  const handleConfirmAction = async (actionData?: any) => {
    if (!booking || !actionType) return;
    
    try {
      switch (actionType) {
        case 'accept':
          await acceptBookingMutation.mutateAsync({ 
            id: booking.id, 
            data: { admin_notes: actionData } 
          });
          break;
        case 'reschedule':
          await rescheduleBookingMutation.mutateAsync({ 
            id: booking.id, 
            data: { 
              appointment_date: actionData?.appointment_date || booking.appointment_date,
              appointment_time: actionData?.appointment_time || booking.appointment_time,
              admin_notes: actionData?.admin_notes 
            } 
          });
          break;
        case 'cancel':
          await cancelBookingMutation.mutateAsync({ 
            id: booking.id, 
            data: { 
              cancellation_reason: actionData || 'Cancelled by admin',
              admin_notes: actionData 
            } 
          });
          break;
        case 'assign':
          await assignBookingMutation.mutateAsync({ 
            id: booking.id, 
            data: { 
              assigned_admin_id: actionData?.assigned_admin_id || 1,
              admin_notes: actionData?.admin_notes 
            } 
          });
          break;
      }
      
      showSuccess(`Booking #${booking.id} ${actionType}ed successfully!`, true);
      setActionConfirmOpen(false);
      setActionType(null);
    } catch (error: any) {
      showError(error.message || `Failed to ${actionType} booking. Please try again.`, true);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader
          title="Loading Booking..."
          breadcrumbs="Dashboard / Booking Management / Loading..."
          subtitle="Please wait while we load the booking details"
        />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Loading booking details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader
          title="Booking Not Found"
          breadcrumbs="Dashboard / Booking Management / Not Found"
          subtitle="The requested booking could not be found"
          actionButton={{
            text: "Back to Bookings",
            icon: <ArrowBackIcon />,
            onClick: handleBack
          }}
        />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error?.message || 'Booking not found'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Bookings
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={`Booking #${booking.id}`}
        breadcrumbs="Dashboard / Booking Management / Booking Details"
        subtitle={`${booking.booking_type === 'property_consultation' ? 'Property Consultation' : 'General Service'} - ${booking.user?.name || 'Unknown User'}`}
        actionButton={{
          text: "Back to Bookings",
          icon: <ArrowBackIcon />,
          onClick: handleBack
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Grid container spacing={3}>
        {/* Left Column - Main Details */}
        <Grid item xs={12} lg={8}>
          {/* Booking Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="600">
                Booking Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Edit Booking">
                  <IconButton onClick={handleEdit} color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Booking">
                  <IconButton onClick={handleDelete} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Primary Information */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EventIcon color="primary" />
                  <Typography variant="subtitle2" color="textSecondary">
                    Booking Type
                  </Typography>
                </Box>
                <Chip
                  label={booking.booking_type_label || (booking.booking_type === 'property_consultation' ? 'Property Consultation' : 'General Service')}
                  color={booking.booking_type === 'property_consultation' ? 'primary' : 'secondary'}
                  icon={booking.booking_type === 'property_consultation' ? <PropertyIcon /> : <EventIcon />}
                  size="small"
                  sx={{ fontSize: '0.75rem', height: '24px' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InfoIcon color="primary" />
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StatusChip status={booking.status} />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon color="primary" />
                  <Typography variant="subtitle2" color="textSecondary">
                    Appointment Date
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="500">
                  {formatDate(booking.appointment_date, 'display')}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TimeIcon color="primary" />
                  <Typography variant="subtitle2" color="textSecondary">
                    Appointment Time
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="500">
                  {booking.appointment_time}
                </Typography>
              </Grid>
            </Grid>

            {/* Notes and Additional Information */}
            <Box sx={{ borderTop: '1px solid', borderColor: 'grey.200', pt: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: 'text.secondary' }}>
                Additional Information
              </Typography>
              <Grid container spacing={3}>
                {booking.user_notes && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <NotesIcon color="primary" />
                    <Typography variant="subtitle2" color="textSecondary">
                      User Notes
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1, 
                    border: '1px solid', 
                    borderColor: 'grey.200'
                  }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {booking.user_notes}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {booking.admin_notes && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AdminIcon color="primary" />
                    <Typography variant="subtitle2" color="textSecondary">
                      Admin Notes
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'info.50', 
                    borderRadius: 1, 
                    border: '1px solid', 
                    borderColor: 'info.200'
                  }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {booking.admin_notes}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {booking.cancellation_reason && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CancelIcon color="error" />
                    <Typography variant="subtitle2" color="textSecondary">
                      Cancellation Reason
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'error.50', 
                    borderRadius: 1, 
                    border: '1px solid', 
                    borderColor: 'error.200'
                  }}>
                    <Typography variant="body1" color="error.main" sx={{ whiteSpace: 'pre-wrap' }}>
                      {booking.cancellation_reason}
                    </Typography>
                  </Box>
                </Grid>
              )}
              </Grid>
            </Box>
          </Paper>

          {/* User and Property Information - Horizontal Layout */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* User Information */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  cursor: booking?.user?.slug ? 'pointer' : 'default',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': booking?.user?.slug ? {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    bgcolor: 'action.hover'
                  } : {}
                }}
                onClick={handleUserClick}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="600">
                    User Information
                  </Typography>
                  {booking?.user?.slug && (
                    <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                      View Details →
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <UserIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="500">
                      {booking.user?.name || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {booking.user?.user_type_label || (booking.user?.user_type === 'individual' ? 'Individual User' : 'Company User')}
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={booking.user?.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={booking.user?.phone || 'N/A'}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Property Information (if applicable) */}
            {booking.property && (
              <Grid item xs={12} md={6}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    cursor: booking?.property?.id ? 'pointer' : 'default',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': booking?.property?.id ? {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      bgcolor: 'action.hover'
                    } : {}
                  }}
                  onClick={handlePropertyClick}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">
                      Property Information
                    </Typography>
                    {booking?.property?.id && (
                      <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                        View Details →
                      </Typography>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        Property Title
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {booking.property.title}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        Property Code
                      </Typography>
                      <Typography variant="body1">
                        {booking.property.code || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        Price
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {booking.property.price ? `$${parseFloat(booking.property.price).toLocaleString()}` : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        Status
                      </Typography>
                      <StatusChip status={booking.property.status || 'unknown'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        Verification Status
                      </Typography>
                      <StatusChip status={booking.property.verification_status || 'unknown'} statusType="verification_status" />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {booking.property.location || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Right Column - User Info & Actions */}
        <Grid item xs={12} lg={4}>

          {/* Assigned Admin */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Assigned Admin
            </Typography>
            {booking.assigned_admin ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <AdminIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="500">
                    {booking.assigned_admin.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {booking.assigned_admin.email}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No admin assigned
              </Typography>
            )}
          </Paper>

          {/* Booking Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Booking Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Show different actions based on booking status */}
              {booking.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AcceptIcon />}
                    onClick={() => handleBookingAction('accept')}
                    disabled={acceptBookingMutation.isPending}
                    fullWidth
                  >
                    Accept Booking
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<RescheduleIcon />}
                    onClick={() => handleBookingAction('reschedule')}
                    disabled={rescheduleBookingMutation.isPending}
                    fullWidth
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleBookingAction('cancel')}
                    disabled={cancelBookingMutation.isPending}
                    fullWidth
                  >
                    Cancel Booking
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<AssignIcon />}
                    onClick={() => handleBookingAction('assign')}
                    disabled={assignBookingMutation.isPending}
                    fullWidth
                  >
                    Assign Admin
                  </Button>
                </>
              )}
              
              {booking.status === 'accepted' && (
                <>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<RescheduleIcon />}
                    onClick={() => handleBookingAction('reschedule')}
                    disabled={rescheduleBookingMutation.isPending}
                    fullWidth
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleBookingAction('cancel')}
                    disabled={cancelBookingMutation.isPending}
                    fullWidth
                  >
                    Cancel Booking
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<AssignIcon />}
                    onClick={() => handleBookingAction('assign')}
                    disabled={assignBookingMutation.isPending}
                    fullWidth
                  >
                    Assign Admin
                  </Button>
                </>
              )}

              {booking.status === 'rescheduled' && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleBookingAction('cancel')}
                    disabled={cancelBookingMutation.isPending}
                    fullWidth
                  >
                    Cancel Booking
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<AssignIcon />}
                    onClick={() => handleBookingAction('assign')}
                    disabled={assignBookingMutation.isPending}
                    fullWidth
                  >
                    Assign Admin
                  </Button>
                </>
              )}
              
              {booking.status === 'cancelled' && (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  This booking has been cancelled. No further actions are available.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Booking Timeline */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Timestamps
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Created"
                  secondary={formatDate(booking.created_at, 'display')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Last Updated"
                  secondary={formatDate(booking.updated_at, 'display')}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

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
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        itemName={`Booking #${booking.id}`}
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
        requireReason={actionType === 'cancel'}
        reasonLabel={actionType === 'cancel' ? 'Cancellation Reason' : undefined}
        reasonPlaceholder={actionType === 'cancel' ? 'Please provide a reason for cancelling this booking...' : undefined}
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
        currentDate={booking?.appointment_date || ''}
        currentTime={booking?.appointment_time || ''}
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
        currentAssignedAdmin={booking?.assigned_admin}
      />
    </Box>
  );
};

export default BookingDetailPage;