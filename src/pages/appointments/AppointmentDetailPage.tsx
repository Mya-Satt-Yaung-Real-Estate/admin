import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as AcceptIcon,
  Schedule as RescheduleIcon,
  Cancel as CancelIcon,
  AssignmentTurnedIn as CompleteIcon,
  Person as UserIcon,
  Home as PropertyIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AttachMoney as MoneyIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StatusChip, DeleteConfirmationDialog, ConfirmationDialog, ActionAlert } from '../../components/ui';
import AppointmentRescheduleDialog from '../../components/ui/AppointmentRescheduleDialog';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useAppointment, useDeleteAppointment, useAcceptAppointment, useRescheduleAppointment, useCancelAppointment, useCompleteAppointment, useAppointmentTimeSlots } from '../../services/queries/appointments';
import { formatDate } from '../../constants/dateFormats';
import dayjs from 'dayjs';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AppointmentDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  const appointmentId = id ? parseInt(id) : 0;

  // Action confirmation states
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reschedule' | 'cancel' | 'complete' | null>(null);
  
  // Reschedule dialog state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  // API Queries
  const { data: appointment, isLoading, error } = useAppointment(appointmentId);
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
  // EVENT HANDLERS
  // ========================================================================

  const handleBack = () => {
    navigate('/appointments');
  };

  const handleEdit = () => {
    navigate(`/appointments/${appointmentId}/edit`);
  };

  const handleUserClick = () => {
    if (appointment?.user?.id) {
      navigate(`/users/${appointment.user.id}`);
    }
  };

  const handleDelete = () => {
    if (!appointment) return;
    
    openDeleteConfirmation(
      `Appointment #${appointment.id}`,
      'appointment',
      async () => {
        try {
          await deleteAppointmentMutation.mutateAsync(appointment.id);
          showSuccess(`Appointment #${appointment.id} deleted successfully!`, true);
          navigate('/appointments');
        } catch (error: any) {
          showError(error.message || 'Failed to delete appointment. Please try again.', true);
        }
      }
    );
  };

  const handleAppointmentAction = (action: 'accept' | 'reschedule' | 'cancel' | 'complete') => {
    if (action === 'reschedule') {
      setRescheduleDialogOpen(true);
    } else {
      setActionType(action);
      setActionConfirmOpen(true);
    }
  };

  const handleConfirmAction = async (actionData?: any) => {
    if (!appointment || !actionType) return;
    
    try {
      switch (actionType) {
        case 'accept':
          await acceptAppointmentMutation.mutateAsync({ 
            id: appointment.id, 
            data: { admin_notes: actionData } 
          });
          break;
        case 'reschedule':
          await rescheduleAppointmentMutation.mutateAsync({ 
            id: appointment.id, 
            data: { 
              date: actionData?.date || appointment.date,
              schedule_start_time: actionData?.schedule_start_time || '09:00:00',
              schedule_end_time: actionData?.schedule_end_time || '11:00:00',
              admin_notes: actionData?.admin_notes 
            } 
          });
          break;
        case 'cancel':
          await cancelAppointmentMutation.mutateAsync({ 
            id: appointment.id, 
            data: { 
              admin_notes: actionData || 'Cancelled by admin'
            } 
          });
          break;
        case 'complete':
          await completeAppointmentMutation.mutateAsync({ 
            id: appointment.id, 
            data: { 
              admin_notes: actionData || 'Completed by admin'
            } 
          });
          break;
      }
      
      showSuccess(`Appointment #${appointment.id} ${actionType}ed successfully!`, false);
      setActionConfirmOpen(false);
      setActionType(null);
    } catch (error: any) {
      showError(error.message || `Failed to ${actionType} appointment. Please try again.`, false);
    }
  };

  // Reschedule dialog handlers
  const handleRescheduleConfirm = async (data: { schedule_date: string; schedule_start_time: string; schedule_end_time: string; admin_notes?: string }) => {
    if (!appointment) return;
    
    try {
      await rescheduleAppointmentMutation.mutateAsync({
        id: appointment.id,
        data: {
          schedule_date: data.schedule_date,
          schedule_start_time: data.schedule_start_time,
          schedule_end_time: data.schedule_end_time,
          admin_notes: data.admin_notes
        }
      });
      
      showSuccess(`Appointment #${appointment.id} rescheduled successfully!`, false);
      setRescheduleDialogOpen(false);
    } catch (error: any) {
      showError(error.message || 'Failed to reschedule appointment. Please try again.', false);
    }
  };

  const handleRescheduleClose = () => {
    setRescheduleDialogOpen(false);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Loading..."
          subtitle="Loading appointment details"
        />
        <Box sx={{ mt: 2 }}>
          <Card>
            <CardContent>
              <Typography>Loading...</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  if (error || !appointment) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Error"
          subtitle="Failed to load appointment"
          actionButton={{
            text: "Back to Appointments",
            icon: <ArrowBackIcon />,
            onClick: handleBack
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Card>
            <CardContent>
              <Typography color="error">
                {error?.message || 'Appointment not found'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  const isDeleted = appointment.deleted_at;

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={`Appointment #${appointment.id}`}
        breadcrumbs="Dashboard / Appointments / Appointment Details"
        subtitle={`${appointment.contact_name} - ${appointment.property_listing_type?.name_en || 'N/A'}`}
        actionButton={{
          text: "Back to Appointments",
          icon: <ArrowBackIcon />,
          onClick: handleBack
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Appointment Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight="600">
                    Appointment Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PropertyIcon color="primary" fontSize="small" />
                    <Typography variant="body2" color="textSecondary">
                      {appointment.property_listing_type?.name_en || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <StatusChip status={appointment.status} />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EventIcon color="primary" />
                    <Typography variant="body2" color="textSecondary">
                      Prefer Date & Time
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="500">
                    {formatDate(appointment.date, 'display')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {appointment.prefer_time_range || 'Anytime'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TimeIcon color="primary" />
                    <Typography variant="body2" color="textSecondary">
                      Reschedule Date & Time
                    </Typography>
                  </Box>
                  {appointment.schedule_date || appointment.schedule_time_range ? (
                    <>
                      <Typography variant="body1" fontWeight="500">
                        {appointment.schedule_date ? formatDate(appointment.schedule_date, 'display') : '-'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {appointment.schedule_time_range || '-'}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1" fontWeight="500" color="textSecondary">
                      -
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* User and Contact Information - Horizontal Layout */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* User Information */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  cursor: appointment?.user?.id ? 'pointer' : 'default',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': appointment?.user?.id ? {
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
                  {appointment?.user?.id && (
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
                      {appointment.user?.name || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {appointment.user?.user_type === 'individual' ? 'Individual User' : 'Company User'}
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
                      secondary={appointment.user?.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={appointment.user?.phone || 'N/A'}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  Contact Information
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <UserIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Name"
                      secondary={appointment.contact_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={appointment.contact_email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={appointment.contact_phone}
                    />
                  </ListItem>
                  {appointment.advance_amount && (
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Advance Amount"
                        secondary={`${appointment.advance_amount.toLocaleString()} MMK`}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>

          {/* Message */}
          {appointment.message && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MessageIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Message
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {appointment.message}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          {appointment.admin_notes && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  Admin Notes
                </Typography>
                <Typography variant="body1">
                  {appointment.admin_notes}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {!isDeleted && (
                  <>
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<AcceptIcon />}
                          onClick={() => handleAppointmentAction('accept')}
                          disabled={acceptAppointmentMutation.isPending}
                          fullWidth
                        >
                          Accept Appointment
                        </Button>
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<RescheduleIcon />}
                          onClick={() => handleAppointmentAction('reschedule')}
                          disabled={rescheduleAppointmentMutation.isPending}
                          fullWidth
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleAppointmentAction('cancel')}
                          disabled={cancelAppointmentMutation.isPending}
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <>
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<RescheduleIcon />}
                          onClick={() => handleAppointmentAction('reschedule')}
                          disabled={rescheduleAppointmentMutation.isPending}
                          fullWidth
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="contained"
                          color="info"
                          startIcon={<CompleteIcon />}
                          onClick={() => handleAppointmentAction('complete')}
                          disabled={completeAppointmentMutation.isPending}
                          fullWidth
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleAppointmentAction('cancel')}
                          disabled={cancelAppointmentMutation.isPending}
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {appointment.status === 'rescheduled' && (
                      <>
                        <Button
                          variant="contained"
                          color="info"
                          startIcon={<CompleteIcon />}
                          onClick={() => handleAppointmentAction('complete')}
                          disabled={completeAppointmentMutation.isPending}
                          fullWidth
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleAppointmentAction('cancel')}
                          disabled={cancelAppointmentMutation.isPending}
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                {/* Hide edit and delete buttons for completed and cancelled appointments */}
                {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      fullWidth
                    >
                      Edit Appointment
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                      disabled={deleteAppointmentMutation.isPending}
                      fullWidth
                    >
                      Delete Appointment
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                Appointment Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Appointment ID
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    #{appointment.id}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Created
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {formatDate(appointment.created_at, 'display')}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {formatDate(appointment.updated_at, 'display')}
                  </Typography>
                </Box>
                
                {appointment.is_anytime && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Time Preference
                    </Typography>
                    <Chip label="Anytime" color="info" size="small" />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        itemName={`Appointment #${appointment.id}`}
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
        currentDate={appointment.date ? dayjs(appointment.date).format('YYYY-MM-DD') : ''}
        currentTime={appointment.schedule_time_range && appointment.schedule_time_range !== '-' 
          ? appointment.schedule_time_range 
          : appointment.prefer_time_range || ''}
        preferTimeSlots={timeSlots || []}
        isLoading={rescheduleAppointmentMutation.isPending}
        error={rescheduleAppointmentMutation.error?.message}
      />
    </Box>
  );
};

export default AppointmentDetailPage;
