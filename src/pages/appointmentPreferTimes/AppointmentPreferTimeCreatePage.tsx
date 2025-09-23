import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ActionAlert } from '../../components/ui';
import { useCreateAppointmentPreferTime } from '../../services/queries/appointmentPreferTimes';
import { useAlertSystem } from '../../hooks';
import { CreateAppointmentPreferTimeData } from '../../services/api/appointmentPreferTimes';

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
  title: 'Create Time Slot',
  description: 'Add a new appointment time slot to the system',
  backButtonPath: '/appointment-prefer-times',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const AppointmentPreferTimeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // State
  const [hasChanges, setHasChanges] = useState(false);

  // Mutations
  const createTimeSlotMutation = useCreateAppointmentPreferTime();

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);

  const handleSubmit = async (values: CreateAppointmentPreferTimeData) => {
    try {
      // Format time values to include seconds (H:i:s format)
      const formattedValues = {
        ...values,
        start_time: values.start_time ? `${values.start_time}:00` : values.start_time,
        end_time: values.end_time ? `${values.end_time}:00` : values.end_time,
      };
      
      await createTimeSlotMutation.mutateAsync(formattedValues);
      
      showSuccess('Time slot created successfully');
      setHasChanges(false);
      
      // Navigate back to list page with success message
      navigate(`${PAGE_CONFIG.backButtonPath}?success=${encodeURIComponent('Time slot created successfully')}`);
    } catch (error: any) {
      // Show API response error message if available, otherwise show generic message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to create time slot';
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

  return (
    <Box>
      {/* Alert System */}
      <ActionAlert
        success={alert.success}
        error={alert.error}
        onClose={clearAlert}
      />

      {/* Back Button - Right aligned */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          color="primary"
        >
          Back to Time Slots
        </Button>
      </Box>

      {/* Page Header */}
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
      />

      {/* Form */}
      <Formik
        initialValues={{
          name: '',
          start_time: '',
          end_time: '',
          description: '',
          is_active: true,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, dirty }) => {
          // Track changes
          React.useEffect(() => {
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
                      disabled={!dirty || createTimeSlotMutation.isPending}
                    >
                      Create Time Slot
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={createTimeSlotMutation.isPending}
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

export default AppointmentPreferTimeCreatePage;
