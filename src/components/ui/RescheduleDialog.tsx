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
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

export interface RescheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: RescheduleData) => void;
  currentDate: string;
  currentTime: string;
  isLoading?: boolean;
  error?: string | null;
}

export interface RescheduleData {
  appointment_date: string;
  appointment_time: string;
  admin_notes?: string;
}

const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  open,
  onClose,
  onConfirm,
  currentDate,
  currentTime,
  isLoading = false,
  error = null,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with current values when dialog opens
  useEffect(() => {
    if (open && currentDate && currentTime) {
      try {
        const currentDateTime = new Date(`${currentDate}T${currentTime}`);
        if (!isNaN(currentDateTime.getTime())) {
          setSelectedDate(currentDateTime);
          setSelectedTime(currentDateTime);
        } else {
          // Fallback to current date/time if invalid
          setSelectedDate(new Date());
          setSelectedTime(new Date());
        }
        setAdminNotes('');
        setHasChanges(false);
      } catch (error) {
        console.error('Error setting initial date/time:', error);
        // Fallback to current date/time
        setSelectedDate(new Date());
        setSelectedTime(new Date());
        setAdminNotes('');
        setHasChanges(false);
      }
    }
  }, [open, currentDate, currentTime]);

  // Check if there are changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const newDate = format(selectedDate, 'yyyy-MM-dd');
      const newTime = format(selectedTime, 'HH:mm');
      const hasDateChanged = newDate !== currentDate;
      const hasTimeChanged = newTime !== currentTime;
      setHasChanges(hasDateChanged || hasTimeChanged);
    }
  }, [selectedDate, selectedTime, currentDate, currentTime]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !hasChanges) return;

    const rescheduleData: RescheduleData = {
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: format(selectedTime, 'HH:mm'),
      admin_notes: adminNotes.trim() || undefined,
    };

    onConfirm(rescheduleData);
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setAdminNotes('');
    setHasChanges(false);
    onClose();
  };

  const formatDisplayDate = (date: string) => {
    if (!date || date.trim() === '') {
      return 'No date set';
    }
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDisplayTime = (time: string) => {
    if (!time || time.trim() === '') {
      return 'No time set';
    }
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getNewDisplayDate = () => {
    return selectedDate ? format(selectedDate, 'MMM dd, yyyy') : '';
  };

  const getNewDisplayTime = () => {
    return selectedTime ? format(selectedTime, 'h:mm a') : '';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="warning" />
            <Typography variant="h6" component="span">
              Reschedule Booking
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Current Appointment */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              Current Appointment
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'grey.200' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarIcon color="primary" />
                <Typography variant="body1" fontWeight="500">
                  {formatDisplayDate(currentDate)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon color="primary" />
                <Typography variant="body1" fontWeight="500">
                  {formatDisplayTime(currentTime)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* New Appointment */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
              New Appointment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Appointment Date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  minDate={new Date()}
                  maxDate={new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)} // 6 months from now
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      disabled: isLoading,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Appointment Time"
                  value={selectedTime}
                  onChange={(newValue) => setSelectedTime(newValue)}
                  views={['hours', 'minutes']}
                  ampm={true}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      disabled: isLoading,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Changes Preview */}
          {hasChanges && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                Changes Preview
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'warning.50', 
                borderRadius: 1, 
                border: '1px solid', 
                borderColor: 'warning.200' 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon color="warning" />
                  <Typography variant="body2">
                    <strong>Date:</strong> {formatDisplayDate(currentDate)} → {getNewDisplayDate()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon color="warning" />
                  <Typography variant="body2">
                    <strong>Time:</strong> {formatDisplayTime(currentTime)} → {getNewDisplayTime()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Admin Notes */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              Admin Notes (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reschedule Notes"
              placeholder="Add notes about the reschedule (optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              variant="outlined"
              disabled={isLoading}
              helperText={`${adminNotes.length}/500 characters`}
              inputProps={{ maxLength: 500 }}
            />
          </Box>

          {/* Validation Messages */}
          {!hasChanges && selectedDate && selectedTime && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Please change the date or time to reschedule this booking.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !hasChanges}
            variant="contained"
            color="warning"
            startIcon={isLoading ? undefined : <ScheduleIcon />}
          >
            {isLoading ? 'Rescheduling...' : 'Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RescheduleDialog;
