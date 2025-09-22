import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export interface AppointmentRescheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: AppointmentRescheduleData) => void;
  currentDate: string;
  currentTime: string;
  preferTimeSlots?: Array<{
    id: number;
    name: string;
    start_time: string;
    end_time: string;
  }>;
  isLoading?: boolean;
  error?: string | null;
}

export interface AppointmentRescheduleData {
  date: string;
  schedule_start_time: string;
  schedule_end_time: string;
  admin_notes?: string;
}

const AppointmentRescheduleDialog: React.FC<AppointmentRescheduleDialogProps> = ({
  open,
  onClose,
  onConfirm,
  currentDate,
  currentTime,
  preferTimeSlots = [],
  isLoading = false,
  error = null,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<dayjs.Dayjs | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<dayjs.Dayjs | null>(null);
  const [selectedPreferTime, setSelectedPreferTime] = useState<number | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [timeSelectionMode, setTimeSelectionMode] = useState<'prefer' | 'custom'>('prefer');

  // Initialize with current values when dialog opens
  useEffect(() => {
    if (open && currentDate && currentTime) {
      try {
        const date = dayjs(currentDate);
        
        // Handle time range format (e.g., "09:00 - 11:00")
        let startTime, endTime;
        
        // Check if currentTime is a valid time format
        if (currentTime && currentTime.trim() !== '' && currentTime !== '-' && currentTime !== 'Anytime') {
          if (currentTime.includes(' - ')) {
            const [start, end] = currentTime.split(' - ').map(t => t.trim());
            // Handle AM/PM format (e.g., "9:00 AM - 11:00 AM")
            if (start.includes('AM') || start.includes('PM') || end.includes('AM') || end.includes('PM')) {
              startTime = dayjs(`2000-01-01 ${start}`, 'YYYY-MM-DD h:mm A');
              endTime = dayjs(`2000-01-01 ${end}`, 'YYYY-MM-DD h:mm A');
            }
            // Handle 24-hour format (HH:mm or HH:mm:ss)
            else if (start.match(/^\d{1,2}:\d{2}(:\d{2})?$/) && end.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
              startTime = dayjs(`2000-01-01T${start}`);
              endTime = dayjs(`2000-01-01T${end}`);
            } else {
              throw new Error('Invalid time format');
            }
          } else if (currentTime.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
            // Handle single time format (e.g., "09:00")
            startTime = dayjs(`2000-01-01T${currentTime}`);
            endTime = startTime.add(2, 'hours'); // Default 2-hour duration
          } else {
            throw new Error('Invalid time format');
          }
        } else {
          // Default to current time if no valid time provided
          startTime = dayjs();
          endTime = dayjs().add(2, 'hours');
        }
        
        setSelectedDate(date);
        setSelectedStartTime(startTime);
        setSelectedEndTime(endTime);
        setAdminNotes('');
        setHasChanges(false);
        setSelectedPreferTime('');
        setTimeSelectionMode('prefer');
      } catch (error) {
        console.error('Error setting initial date/time:', error);
        // Fallback to current time
        setSelectedDate(dayjs());
        setSelectedStartTime(dayjs());
        setSelectedEndTime(dayjs().add(2, 'hours'));
        setAdminNotes('');
        setHasChanges(false);
        setSelectedPreferTime('');
        setTimeSelectionMode('prefer');
      }
    }
  }, [open, currentDate, currentTime]);

  // Check if there are changes
  useEffect(() => {
    if (selectedDate && selectedStartTime && selectedEndTime) {
      const newDate = dayjs(selectedDate).format('YYYY-MM-DD');
      const newStartTime = dayjs(selectedStartTime).format('HH:mm:ss');
      const newEndTime = dayjs(selectedEndTime).format('HH:mm:ss');
      const hasDateChanged = newDate !== currentDate;
      const hasTimeChanged = newStartTime !== currentTime;
      setHasChanges(hasDateChanged || hasTimeChanged);
    }
  }, [selectedDate, selectedStartTime, selectedEndTime, currentDate, currentTime]);

  // Handle prefer time selection
  const handlePreferTimeChange = (preferTimeId: number | '') => {
    setSelectedPreferTime(preferTimeId);
    if (preferTimeId && preferTimeSlots.length > 0) {
      const selectedSlot = preferTimeSlots.find(slot => slot.id === preferTimeId);
      if (selectedSlot) {
        // Handle both datetime strings and time strings
        let startTimeStr = selectedSlot.start_time;
        let endTimeStr = selectedSlot.end_time;
        
        // If it's a datetime string, extract the time part
        if (selectedSlot.start_time.includes('T')) {
          startTimeStr = selectedSlot.start_time.split('T')[1]?.split('.')[0] || selectedSlot.start_time;
        }
        if (selectedSlot.end_time.includes('T')) {
          endTimeStr = selectedSlot.end_time.split('T')[1]?.split('.')[0] || selectedSlot.end_time;
        }
        
        setSelectedStartTime(dayjs(`2000-01-01T${startTimeStr}`));
        setSelectedEndTime(dayjs(`2000-01-01T${endTimeStr}`));
        setTimeSelectionMode('prefer');
      }
    }
  };

  // Validation function
  const getValidationMessage = () => {
    if (!selectedDate) {
      return 'Please select a date';
    }

    if (timeSelectionMode === 'prefer' && !selectedPreferTime) {
      return 'Please select a preferred time slot';
    }

    if (timeSelectionMode === 'custom' && (!selectedStartTime || !selectedEndTime)) {
      return 'Please select start and end times';
    }

    if (selectedStartTime && selectedEndTime && (selectedEndTime.isSame(selectedStartTime) || selectedEndTime.isBefore(selectedStartTime))) {
      return 'End time must be after start time';
    }

    if (!hasChanges) {
      return 'No changes made to reschedule';
    }

    return null;
  };

  const isFormValid = () => {
    return getValidationMessage() === null;
  };

  const handleConfirm = () => {
    if (!isFormValid()) return;

    const rescheduleData: AppointmentRescheduleData = {
      schedule_date: dayjs(selectedDate).format('YYYY-MM-DD'),
      schedule_start_time: dayjs(selectedStartTime).format('HH:mm:ss'),
      schedule_end_time: dayjs(selectedEndTime).format('HH:mm:ss'),
      ...(adminNotes.trim() && { admin_notes: adminNotes.trim() }),
    };

    onConfirm(rescheduleData);
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setAdminNotes('');
    setHasChanges(false);
    setSelectedPreferTime('');
    setTimeSelectionMode('prefer');
    onClose();
  };

  const formatDisplayDate = (date: string) => {
    if (!date || date.trim() === '') {
      return 'No date set';
    }
    try {
      return dayjs(date).format('MMM DD, YYYY');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDisplayTime = (time: string) => {
    if (!time || time.trim() === '' || time === '-') {
      return 'No time set';
    }
    
    if (time === 'Anytime') {
      return 'Anytime';
    }
    
    try {
      // Handle time range format (e.g., "9:00 AM - 11:00 AM" or "09:00 - 11:00")
      if (time.includes(' - ')) {
        const [start, end] = time.split(' - ').map(t => t.trim());
        // If already in AM/PM format, return as-is
        if (start.includes('AM') || start.includes('PM') || end.includes('AM') || end.includes('PM')) {
          return time;
        }
        // Handle 24-hour format (HH:mm or HH:mm:ss)
        else if (start.match(/^\d{1,2}:\d{2}(:\d{2})?$/) && end.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
          return time; // Return the range as-is for display
        } else {
          return 'Invalid time format';
        }
      }
      // Handle single time format (e.g., "09:00")
      if (time.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
        return dayjs(`2000-01-01T${time}`).format('h:mm A');
      } else {
        return 'Invalid time format';
      }
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getNewDisplayDate = () => {
    return selectedDate ? dayjs(selectedDate).format('MMM DD, YYYY') : '';
  };

  const getNewDisplayTime = () => {
    // Handle preferred time slot selection first
    if (timeSelectionMode === 'prefer' && selectedPreferTime && preferTimeSlots.length > 0) {
      const selectedSlot = preferTimeSlots.find(slot => slot.id === selectedPreferTime);
      if (selectedSlot && selectedSlot.time_range) {
        return selectedSlot.time_range;
      }
    }
    
    // Handle custom time selection
    if (timeSelectionMode === 'custom' && selectedStartTime && selectedEndTime) {
      const start = dayjs(selectedStartTime).format('h:mm A');
      const end = dayjs(selectedEndTime).format('h:mm A');
      return `${start} - ${end}`;
    }
    
    return '';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2, pt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" sx={{ fontSize: 24 }} />
            <Typography variant="h6" component="span" fontWeight="600" color="primary">
              Reschedule Appointment
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Current Appointment Card */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Current Date & Time
            </Typography>
            <Box sx={{ 
              p: 3, 
              border: '1px solid', 
              borderColor: 'grey.300', 
              borderRadius: 2,
              bgcolor: 'white'
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" sx={{ fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        Date
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {formatDisplayDate(currentDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon color="primary" sx={{ fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        Time
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {formatDisplayTime(currentTime)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* New Appointment Card */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              New Date & Time
            </Typography>
            
            {/* Validation Message for New Appointment */}
            {timeSelectionMode === 'prefer' && !selectedPreferTime && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please select a preferred time slot
              </Alert>
            )}
            
            <Box sx={{ 
              p: 3, 
              border: '1px solid', 
              borderColor: 'grey.300', 
              borderRadius: 2,
              bgcolor: 'white'
            }}>
              <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Appointment Date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  minDate={dayjs()}
                  maxDate={dayjs().add(6, 'months')} // 6 months from now
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      size: 'small',
                      disabled: isLoading,
                    },
                  }}
                />
              </Grid>
              
              {/* Time Selection Mode */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant={timeSelectionMode === 'prefer' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      setTimeSelectionMode('prefer');
                      // Clear custom time fields when switching to prefer mode
                      setSelectedStartTime(null);
                      setSelectedEndTime(null);
                    }}
                    startIcon={<CheckIcon />}
                    disabled={isLoading}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Use Preferred Time
                  </Button>
                  <Button
                    variant={timeSelectionMode === 'custom' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      setTimeSelectionMode('custom');
                      // Clear prefer time selection when switching to custom mode
                      setSelectedPreferTime('');
                    }}
                    startIcon={<TimeIcon />}
                    disabled={isLoading}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Custom Time
                  </Button>
                </Box>
              </Grid>

              {timeSelectionMode === 'prefer' && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Preferred Time Slot</InputLabel>
                    <Select
                      value={selectedPreferTime}
                      onChange={(e) => handlePreferTimeChange(e.target.value as number | '')}
                      label="Select Preferred Time Slot"
                      disabled={isLoading}
                      size="small"
                    >
                      {preferTimeSlots.map((slot) => (
                        <MenuItem key={slot.id} value={slot.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={slot.name} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Typography variant="body2">
                              {slot.time_range || `${dayjs(`2000-01-01T${slot.start_time}`).format('h:mm A')} - ${dayjs(`2000-01-01T${slot.end_time}`).format('h:mm A')}`}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {timeSelectionMode === 'custom' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="Start Time"
                      value={selectedStartTime}
                      onChange={(newValue) => setSelectedStartTime(newValue)}
                      views={['hours', 'minutes']}
                      ampm={true}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          size: 'small',
                          disabled: isLoading,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="End Time"
                      value={selectedEndTime}
                      onChange={(newValue) => setSelectedEndTime(newValue)}
                      views={['hours', 'minutes']}
                      ampm={true}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          size: 'small',
                          disabled: isLoading,
                        },
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            </Box>
          </Box>

          {/* Changes Preview Card */}
          {hasChanges && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                Changes Preview
              </Typography>
              <Box sx={{ 
                p: 3, 
                border: '1px solid', 
                borderColor: 'warning.300', 
                borderRadius: 2,
                bgcolor: 'warning.50'
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="warning" sx={{ fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                          Date Change
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {formatDisplayDate(currentDate)} → {getNewDisplayDate()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon color="warning" sx={{ fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                          Time Change
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {formatDisplayTime(currentTime)} → {getNewDisplayTime()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Admin Notes */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
              Admin Notes (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reschedule Notes"
              placeholder="Add notes about this reschedule..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              variant="outlined"
              size="small"
              disabled={isLoading}
              helperText={`${adminNotes.length}/500 characters`}
              inputProps={{ maxLength: 500 }}
            />
          </Box>

          {/* Validation Messages */}
          {!hasChanges && selectedDate && selectedStartTime && selectedEndTime && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Please change the date or time to reschedule this appointment.
            </Alert>
          )}

        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !isFormValid()}
            variant="contained"
            color="primary"
            startIcon={isLoading ? undefined : <ScheduleIcon />}
          >
            {isLoading ? 'Rescheduling...' : 'Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AppointmentRescheduleDialog;
