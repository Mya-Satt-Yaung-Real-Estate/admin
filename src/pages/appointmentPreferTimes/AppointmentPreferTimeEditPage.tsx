import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, PageLoadingState, PageErrorState } from '../../components/ui';
import { useUpdateAppointmentPreferTime, useAppointmentPreferTime } from '../../services/queries/appointmentPreferTimes';
import { useAlertSystem } from '../../hooks';
import { UpdateAppointmentPreferTimeData } from '../../services/api/appointmentPreferTimes';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .max(255, 'Name must be less than 255 characters'),
  start_time: Yup.string()
    .required('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: Yup.string()
    .required('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .test('end-time-after-start', 'End time must be after start time', function(value) {
      const { start_time } = this.parent;
      if (!start_time || !value) return true;
      
      const startTime = new Date(`2000-01-01T${start_time}:00`);
      const endTime = new Date(`2000-01-01T${value}:00`);
      
      return endTime > startTime;
    }),
  description: Yup.string()
    .max(1000, 'Description must be less than 1000 characters'),
  is_active: Yup.boolean(),
});

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Edit Time Slot',
  description: 'Update appointment time slot information',
  backButtonPath: '/appointment-prefer-times',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const AppointmentPreferTimeEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // State
  const [hasChanges, setHasChanges] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    start_time: '',
    end_time: '',
    description: '',
    is_active: true,
  });

  // API Queries
  const { data: timeSlotResponse, isLoading, error, refetch } = useAppointmentPreferTime(Number(id!));
  
  // Mutations
  const updateTimeSlotMutation = useUpdateAppointmentPreferTime();

  // Set initial values when data is loaded
  useEffect(() => {
    if (timeSlotResponse?.data) {
      const timeSlot = timeSlotResponse.data;
      
      // Convert time format from H:i:s to H:i for HTML5 time input
      const formatTimeForInput = (time: string) => {
        return time ? time.substring(0, 5) : '';
      };
      
      setInitialValues({
        name: timeSlot.name || '',
        start_time: formatTimeForInput(timeSlot.start_time),
        end_time: formatTimeForInput(timeSlot.end_time),
        description: timeSlot.description || '',
        is_active: timeSlot.is_active ?? true,
      });
    }
  }, [timeSlotResponse]);

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);

  const handleSubmit = async (values: UpdateAppointmentPreferTimeData) => {
    if (!id) return;
    
    try {
      // Format time values to include seconds (H:i:s format)
      const formattedValues = {
        ...values,
        start_time: values.start_time ? `${values.start_time}:00` : values.start_time,
        end_time: values.end_time ? `${values.end_time}:00` : values.end_time,
      };
      
      await updateTimeSlotMutation.mutateAsync({ id: Number(id), data: formattedValues });
      
      showSuccess('Time slot updated successfully');
      setHasChanges(false);
      
      // Navigate back to list page with success message
      navigate(`${PAGE_CONFIG.backButtonPath}?success=${encodeURIComponent('Time slot updated successfully')}`);
    } catch (error: any) {
      // Show API response error message if available, otherwise show generic message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to update time slot';
      showError(errorMessage);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        handleBack();
      }
    } else {
      handleBack();
    }
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState />;
  }

  // Error state
  if (error) {
    return <PageErrorState error={error} onRetry={refetch} />;
  }

  // No data state
  if (!timeSlotResponse?.data) {
    return (
      <Box>
        <PageHeader
          title="Time Slot Not Found"
          subtitle="The requested time slot could not be found"
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="outlined"
            color="primary"
          >
            Back to Time Slots
          </Button>
        </Box>
      </Box>
    );
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
        breadcrumbs={`Dashboard / Appointments / Prefer Times / ${timeSlotResponse?.data?.name || 'Time Slot'} / Edit`}
        actionButton={{
          text: 'Back to Time Slots',
          icon: <ArrowBackIcon />,
          onClick: handleBack
        }}
      />

      {/* Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, dirty }) => {
          // Track changes
          useEffect(() => {
            setHasChanges(dirty);
          }, [dirty]);

          return (
            <Form>
              <Grid container spacing={3}>
                {/* Basic Information Card */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon color="primary" />
                        Time Slot Information
                      </Typography>
                      
                      <Grid container spacing={3}>
                        {/* Name */}
                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            name="name"
                            label="Time Slot Name"
                            fullWidth
                            required
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                            placeholder="e.g., Morning Session, Afternoon Session"
                          />
                        </Grid>

                        {/* Start Time */}
                        <Grid item xs={12} md={3}>
                          <Field
                            as={TextField}
                            name="start_time"
                            label="Start Time"
                            type="time"
                            fullWidth
                            required
                            value={values.start_time}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.start_time && Boolean(errors.start_time)}
                            helperText={touched.start_time && errors.start_time}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>

                        {/* End Time */}
                        <Grid item xs={12} md={3}>
                          <Field
                            as={TextField}
                            name="end_time"
                            label="End Time"
                            type="time"
                            fullWidth
                            required
                            value={values.end_time}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.end_time && Boolean(errors.end_time)}
                            helperText={touched.end_time && errors.end_time}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="description"
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.description && Boolean(errors.description)}
                            helperText={touched.description && errors.description}
                            placeholder="Optional description for this time slot..."
                          />
                        </Grid>

                        {/* Status */}
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.is_active}
                                onChange={(e) => setFieldValue('is_active', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Active Status"
                          />
                          <Typography variant="caption" display="block" color="textSecondary">
                            {values.is_active ? 'This time slot will be active and available for appointments' : 'This time slot will be inactive and unavailable for appointments'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Form Actions - Small buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      startIcon={<SaveIcon />}
                      disabled={!dirty || updateTimeSlotMutation.isPending}
                    >
                      Update Time Slot
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={updateTimeSlotMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default AppointmentPreferTimeEditPage;
