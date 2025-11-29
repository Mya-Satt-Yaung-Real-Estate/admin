import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Avatar,
  Chip,
  Grid,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { getMyanmarTime, toMyanmarTime, myanmarTimeToUTC, utcToMyanmarTime } from '../../utils/dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useAnnouncement, 
  useUpdateAnnouncementSchedule, 
  useCancelAnnouncement, 
  useResendAnnouncement 
} from '../../services/queries/announcements';
import { useAlertSystem } from '../../hooks';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, ActionAlert } from '../../components/ui';

const AnnouncementDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // API Queries
  const { data: announcementResponse, isLoading, error } = useAnnouncement(Number(id));

  // Mutations
  const updateScheduleMutation = useUpdateAnnouncementSchedule();
  const cancelMutation = useCancelAnnouncement();
  const resendMutation = useResendAnnouncement();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Extract announcement data
  const announcement = announcementResponse?.data;

  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<Dayjs | null>(null);

  // Event handlers
  const handleBack = () => {
    navigate('/announcements');
  };

  const handleOpenScheduleDialog = () => {
    if (announcement?.scheduled_at) {
      // Convert UTC from API to Myanmar time
      setScheduledDateTime(utcToMyanmarTime(announcement.scheduled_at));
    } else {
      setScheduledDateTime(getMyanmarTime().add(1, 'day'));
    }
    setScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setScheduleDialogOpen(false);
    setScheduledDateTime(null);
  };

  const handleUpdateSchedule = async () => {
    if (!scheduledDateTime || !announcement) return;

    if (scheduledDateTime.isBefore(getMyanmarTime())) {
      showError('Scheduled date and time must be in the future');
      return;
    }

    try {
      // Convert Myanmar time to UTC for API
      await updateScheduleMutation.mutateAsync({
        id: announcement.id,
        scheduled_at: myanmarTimeToUTC(scheduledDateTime).toISOString(),
      });
      showSuccess('Announcement schedule updated successfully');
      handleCloseScheduleDialog();
    } catch (error: any) {
      showError(error?.message || 'Failed to update schedule');
    }
  };

  const handleCancel = async () => {
    if (!announcement) return;

    if (!window.confirm('Are you sure you want to cancel this scheduled announcement?')) {
      return;
    }

    try {
      await cancelMutation.mutateAsync(announcement.id);
      showSuccess('Announcement cancelled successfully');
    } catch (error: any) {
      showError(error?.message || 'Failed to cancel announcement');
    }
  };

  const handleResend = async () => {
    if (!announcement) return;

    if (!window.confirm('Are you sure you want to resend this announcement?')) {
      return;
    }

    try {
      await resendMutation.mutateAsync(announcement.id);
      showSuccess('Announcement resent successfully');
    } catch (error: any) {
      showError(error?.message || 'Failed to resend announcement');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: 'info' as const, label: 'Scheduled', icon: <ScheduleIcon /> };
      case 'sending':
        return { color: 'warning' as const, label: 'Sending', icon: <ScheduleIcon /> };
      case 'sent':
        return { color: 'success' as const, label: 'Sent', icon: <CheckCircleIcon /> };
      case 'failed':
        return { color: 'error' as const, label: 'Failed', icon: <ErrorIcon /> };
      case 'cancelled':
        return { color: 'default' as const, label: 'Cancelled', icon: <CancelIcon /> };
      default:
        return { color: 'default' as const, label: status || 'Pending', icon: null };
    }
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState />;
  }

  // Error state
  if (error) {
    return (
      <Box>
        <PageHeader
          title="Announcement Details"
          subtitle="View announcement information"
          actionButton={{
            text: "Back to Announcements",
            icon: <ArrowBackIcon />,
            onClick: handleBack
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Announcement"
            message={error.message}
            onRetry={() => window.location.reload()}
          />
        </Box>
      </Box>
    );
  }

  // No data state
  if (!announcement) {
    return (
      <Box>
        <PageHeader
          title="Announcement Details"
          subtitle="View announcement information"
          actionButton={{
            text: "Back to Announcements",
            icon: <ArrowBackIcon />,
            onClick: handleBack
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={{ message: 'Announcement not found' }}
            title="Announcement Not Found"
            message="The requested announcement could not be found."
            onRetry={handleBack}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Announcement Details"
        subtitle="View announcement information"
        breadcrumbs="Dashboard / Announcements / Details"
        actionButton={{
          text: "Back to Announcements",
          icon: <ArrowBackIcon />,
          onClick: handleBack
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Title and Type */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 2, 
                mb: 2,
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <NotificationIcon sx={{ 
                  fontSize: isMobile ? 24 : 32, 
                  color: 'primary.main',
                  flexShrink: 0
                }} />
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="600" 
                    gutterBottom
                    sx={{ wordBreak: 'break-word' }}
                  >
                    {announcement.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={announcement.announcement_type}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    {announcement.status && (
                      <Chip
                        icon={getStatusConfig(announcement.status).icon as any}
                        label={getStatusConfig(announcement.status).label}
                        color={getStatusConfig(announcement.status).color === 'success' ? 'default' : getStatusConfig(announcement.status).color}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>

        <Divider sx={{ mb: 3 }} />

            {/* Message Body */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Message Content
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  backgroundColor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {announcement.body}
                </Typography>
              </Paper>
            </Box>

        <Divider sx={{ mb: 3 }} />

            {/* Target Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Target Audience
              </Typography>
              {announcement.all_users ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <GroupIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="500">
                    All Users
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PersonIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: 'secondary.main' }} />
                    <Typography variant="body1" fontWeight="500">
                      Specific Users ({announcement.users?.length || 0} selected)
                    </Typography>
                  </Box>
                  
                  {announcement.users && announcement.users.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Selected Users:
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1,
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                      }}>
                        {announcement.users.map((user) => (
                          <Box
                            key={user.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: { xs: 0.75, sm: 1 },
                              border: '1px solid',
                              borderColor: 'grey.300',
                              borderRadius: 1,
                              backgroundColor: 'white',
                              minWidth: { xs: '100%', sm: 'auto' },
                              maxWidth: { xs: '100%', sm: '300px' }
                            }}
                          >
                            <Avatar sx={{ 
                              width: { xs: 28, sm: 32 }, 
                              height: { xs: 28, sm: 32 }, 
                              bgcolor: 'primary.main',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}>
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight="500"
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  wordBreak: 'break-word'
                                }}
                              >
                                {user.name}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{ 
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                  wordBreak: 'break-word'
                                }}
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Scheduling Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Scheduling Information
              </Typography>
              <Grid container spacing={2}>
                {announcement.scheduled_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Scheduled At (Myanmar Time)
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {utcToMyanmarTime(announcement.scheduled_at).format('MMM DD, YYYY [at] hh:mm A')}
                    </Typography>
                  </Grid>
                )}
                {announcement.sent_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Sent At (Myanmar Time)
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {utcToMyanmarTime(announcement.sent_at).format('MMM DD, YYYY [at] hh:mm A')}
                    </Typography>
                  </Grid>
                )}
                {announcement.failed_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Failed At (Myanmar Time)
                    </Typography>
                    <Typography variant="body1" fontWeight="500" color="error">
                      {utcToMyanmarTime(announcement.failed_at).format('MMM DD, YYYY [at] hh:mm A')}
                    </Typography>
                  </Grid>
                )}
                {announcement.failure_reason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Failure Reason
                    </Typography>
                    <Typography variant="body2" color="error">
                      {announcement.failure_reason}
                    </Typography>
                  </Grid>
                )}
                {announcement.scheduled_by_user && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Scheduled By
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {announcement.scheduled_by_user.name} ({announcement.scheduled_by_user.email})
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Action Buttons */}
            {(announcement.status === 'scheduled' || announcement.status === 'pending') && (
              <>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    onClick={handleOpenScheduleDialog}
                    disabled={updateScheduleMutation.isPending}
                  >
                    Update Schedule
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            )}

            {announcement.status === 'failed' && (
              <>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={handleResend}
                    disabled={resendMutation.isPending}
                  >
                    Resend Announcement
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Update Schedule Dialog */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
        <Dialog open={scheduleDialogOpen} onClose={handleCloseScheduleDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Update Schedule</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <DateTimePicker
                label="Schedule Date & Time (Myanmar Time)"
                value={scheduledDateTime}
                onChange={(newValue: any) => {
                  // Convert to Myanmar timezone if needed
                  const myanmarTime = newValue ? toMyanmarTime(newValue) : null;
                  setScheduledDateTime(myanmarTime);
                }}
                minDateTime={getMyanmarTime()}
                timezone="Asia/Yangon"
                format="YYYY-MM-DD HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: 'Select a future date and time',
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseScheduleDialog}>Cancel</Button>
            <Button
              onClick={handleUpdateSchedule}
              variant="contained"
              disabled={!scheduledDateTime || updateScheduleMutation.isPending}
            >
              {updateScheduleMutation.isPending ? 'Updating...' : 'Update Schedule'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Box>
  );
};

export default AnnouncementDetailPage;
