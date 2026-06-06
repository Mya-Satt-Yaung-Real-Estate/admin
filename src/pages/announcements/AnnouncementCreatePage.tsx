import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  Typography,
  Autocomplete,
  Chip,
  Radio,
  RadioGroup,
  FormLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { getMyanmarTime, toMyanmarTime, myanmarTimeToUTC } from '../../utils/dayjs';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateAnnouncement } from '../../services/queries/announcements';
import { useUsers } from '../../services/queries/users';
import { CreateAnnouncementData } from '../../types/announcement';
import { getUserSelectLabel } from '../../types/user';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CreateFormData {
  announcement_type: string;
  all_users: boolean;
  user_ids: number[];
  title: string;
  body: string;
  selectedUsers: any[];
  sendType: 'immediate' | 'scheduled';
  scheduledDateTime: Dayjs | null;
}

interface FormErrors {
  announcement_type?: string;
  all_users?: string;
  user_ids?: string;
  title?: string;
  body?: string;
  selectedUsers?: string;
  sendType?: string;
  scheduledDateTime?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const AnnouncementCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<CreateFormData>({
    announcement_type: 'notification',
    all_users: false,
    user_ids: [],
    title: '',
    body: '',
    selectedUsers: [],
    sendType: 'immediate',
    scheduledDateTime: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Hooks
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Queries
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers();
  const createMutation = useCreateAnnouncement();

  // Event handlers
  const handleBack = () => {
    navigate('/announcements');
  };

  const handleInputChange = (field: keyof CreateFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAllUsersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setFormData(prev => ({
      ...prev,
      all_users: checked,
      user_ids: checked ? [] : prev.user_ids,
      selectedUsers: checked ? [] : prev.selectedUsers,
    }));

    if (errors.all_users) {
      setErrors(prev => ({
        ...prev,
        all_users: undefined
      }));
    }
  };

  const handleUserChange = (users: any[]) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: users,
      user_ids: users.map(user => user.id)
    }));

    if (errors.selectedUsers) {
      setErrors(prev => ({
        ...prev,
        selectedUsers: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Message body is required';
    }

    if (!formData.all_users && formData.selectedUsers.length === 0) {
      newErrors.selectedUsers = 'Please select at least one user or enable "All Users"';
    }

    if (formData.sendType === 'scheduled') {
      if (!formData.scheduledDateTime) {
        newErrors.scheduledDateTime = 'Scheduled date and time is required';
      } else if (formData.scheduledDateTime.isBefore(getMyanmarTime())) {
        newErrors.scheduledDateTime = 'Scheduled date and time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload: CreateAnnouncementData = {
        announcement_type: formData.announcement_type as 'notification',
        all_users: formData.all_users,
        user_ids: formData.all_users ? [] : formData.user_ids,
        title: formData.title.trim(),
        body: formData.body.trim(),
        scheduled_at: formData.sendType === 'scheduled' && formData.scheduledDateTime
          ? myanmarTimeToUTC(formData.scheduledDateTime).toISOString()
          : undefined,
      };

      const response = await createMutation.mutateAsync(payload);
      
      const successMessage = formData.sendType === 'scheduled'
        ? `Announcement scheduled for ${formData.scheduledDateTime?.format('MMM DD, YYYY [at] hh:mm A')} (Myanmar Time)`
        : 'Announcement sent successfully!';
      
      showSuccess(response.message || successMessage);
      
      // Redirect to announcements list after a short delay
      setTimeout(() => {
        navigate('/announcements');
      }, 1500);

    } catch (error: any) {
      showError(error?.message || 'Failed to create announcement');
    }
  };

  // Loading states
  if (usersLoading) {
    return <PageLoadingState />;
  }

  // Error states
  if (usersError) {
    return (
      <Box>
        <PageHeader
          title="Create Announcement"
          subtitle="Send a new announcement to users"
        />
        <ActionAlert 
          error={{
            show: true,
            message: 'Failed to load users data. Please try again.'
          }}
          sx={{ mt: 2 }} 
          onClose={clearAlert} 
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to List
          </Button>
        </Box>
      </Box>
    );
  }

  const users = usersData?.data || [];

  return (
    <Box>
      <PageHeader
        title="Create Announcement"
        subtitle="Send a new announcement to users"
        breadcrumbs="Dashboard / Announcements / Create"
        actionButton={{
          text: 'Back to Announcements',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/announcements')
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <LocalizationProvider 
        dateAdapter={AdapterDayjs} 
        adapterLocale="en"
      >
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
            {/* Announcement Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.announcement_type}>
                <InputLabel>Announcement Type *</InputLabel>
                <Select
                  value={formData.announcement_type}
                  onChange={(e) => handleInputChange('announcement_type', e.target.value)}
                  label="Announcement Type *"
                  startAdornment={<NotificationIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="notification">Notification</MenuItem>
                </Select>
                {errors.announcement_type && (
                  <FormHelperText>{errors.announcement_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* All Users Switch */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.all_users}
                    onChange={handleAllUsersChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Send to All Users
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter announcement title"
                error={!!errors.title}
                helperText={errors.title}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <NotificationIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </Box>
                  ),
                }}
              />
            </Grid>

            {/* User Selection - Only show if not sending to all users */}
            {!formData.all_users && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.selectedUsers}>
                  <Autocomplete
                    multiple
                    options={users}
                    getOptionLabel={getUserSelectLabel}
                    value={formData.selectedUsers}
                    onChange={(_event, newValue) => handleUserChange(newValue)}
                    loading={usersLoading}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Users *"
                        error={!!errors.selectedUsers}
                        helperText={errors.selectedUsers}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={option.id}
                            label={getUserSelectLabel(option)}
                            {...tagProps}
                            size="small"
                            sx={{
                              backgroundColor: '#3B8880', // Same teal color as EnhancedMultiSelect
                              color: 'white',
                              fontWeight: 'bold',
                              '&:hover': {
                                backgroundColor: '#2d6a64', // Darker teal on hover
                              },
                              '& .MuiChip-deleteIcon': {
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }
                              }
                            }}
                          />
                        );
                      })
                    }
                  />
                  {errors.selectedUsers && (
                    <FormHelperText>{errors.selectedUsers}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {/* Message Body */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message Body *"
                multiline
                rows={6}
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                placeholder="Enter your announcement message"
                error={!!errors.body}
                helperText={errors.body}
              />
            </Grid>

            {/* Send Type Selection */}
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  Send Options
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.sendType}
                  onChange={(e) => {
                    handleInputChange('sendType', e.target.value);
                    if (e.target.value === 'immediate') {
                      handleInputChange('scheduledDateTime', null);
                    }
                  }}
                >
                  <FormControlLabel
                    value="immediate"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SendIcon sx={{ fontSize: 18 }} />
                        <Typography>Send Immediately</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="scheduled"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon sx={{ fontSize: 18 }} />
                        <Typography>Schedule for Later</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Scheduled Date/Time Picker - Only show if scheduled is selected */}
            {formData.sendType === 'scheduled' && (
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Schedule Date & Time * (Myanmar Time)"
                  value={formData.scheduledDateTime}
                  onChange={(newValue: any) => {
                    // Convert to Myanmar timezone if needed
                    const myanmarTime = newValue ? toMyanmarTime(newValue) : null;
                    handleInputChange('scheduledDateTime', myanmarTime);
                    if (errors.scheduledDateTime) {
                      setErrors(prev => ({
                        ...prev,
                        scheduledDateTime: undefined
                      }));
                    }
                  }}
                  minDateTime={getMyanmarTime()}
                  timezone="Asia/Yangon"
                  format="YYYY-MM-DD HH:mm"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.scheduledDateTime,
                      helperText: errors.scheduledDateTime || 'Select a future date and time',
                    },
                  }}
                />
              </Grid>
            )}

            {/* Schedule Preview */}
            {formData.sendType === 'scheduled' && formData.scheduledDateTime && !errors.scheduledDateTime && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    backgroundColor: 'primary.50',
                  }}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Scheduled Send Time
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {formData.scheduledDateTime.format('MMMM DD, YYYY [at] hh:mm A')} (Myanmar Time)
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={createMutation.isPending}
                >
                  Back to List
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={formData.sendType === 'scheduled' ? <ScheduleIcon /> : <SendIcon />}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending
                    ? (formData.sendType === 'scheduled' ? 'Scheduling...' : 'Sending...')
                    : (formData.sendType === 'scheduled' ? 'Schedule Announcement' : 'Send Announcement')
                  }
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      </LocalizationProvider>
    </Box>
  );
};

export default AnnouncementCreatePage;