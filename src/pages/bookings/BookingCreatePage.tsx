import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Alert,
  Autocomplete,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateBooking, useAdminUsers } from '../../services/queries/bookings';
import { useUsers } from '../../services/queries/users';
import { useProperties } from '../../services/queries/properties';
import { CreateBookingData } from '../../types/booking';
import { FormActions } from '../../components/forms/shared/FormActions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  user_id: Yup.number().required('User is required'),
  property_id: Yup.number().nullable(),
  booking_type: Yup.string()
    .oneOf(['property_consultation', 'general_service'], 'Invalid booking type')
    .required('Booking type is required'),
  appointment_date: Yup.date()
    .min(new Date(), 'Appointment date must be today or in the future')
    .required('Appointment date is required'),
  appointment_time: Yup.string().required('Appointment time is required'),
  user_notes: Yup.string().max(1000, 'User notes cannot exceed 1000 characters'),
  admin_notes: Yup.string().max(1000, 'Admin notes cannot exceed 1000 characters'),
  assigned_admin_id: Yup.number().nullable(),
});

// ============================================================================
// COMPONENT
// ============================================================================

const BookingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // API hooks
  const createBookingMutation = useCreateBooking();
  const { data: usersResponse, isLoading: loadingUsers } = useUsers();
  const { data: propertiesResponse, isLoading: loadingProperties } = useProperties();
  const { data: adminUsersResponse, isLoading: loadingAdminUsers } = useAdminUsers();
  
  const users = usersResponse?.data || [];
  const properties = propertiesResponse?.data || [];
  const adminUsers = adminUsersResponse?.data || [];

  // Form handling
  const formik = useFormik<CreateBookingData>({
    initialValues: {
      user_id: 0,
      property_id: undefined,
      booking_type: 'general_service',
      appointment_date: dayjs().format('YYYY-MM-DD'),
      appointment_time: dayjs().format('HH:mm'),
      user_notes: '',
      admin_notes: '',
      assigned_admin_id: undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      // Prevent double submission
      if (createBookingMutation.isPending) {
        return;
      }
      
      try {
        const response = await createBookingMutation.mutateAsync(values);
        // Navigate to booking detail page with success message (consistent with other create pages)
        const bookingId = response.data?.id;
        if (bookingId) {
          navigate(`/bookings/${bookingId}?success=${encodeURIComponent('Booking created successfully!')}`);
        } else {
          navigate('/bookings');
        }
      } catch (error: any) {
        showError(error.message || 'Failed to create booking. Please try again.', true);
      }
    },
  });

  const handleBookingTypeChange = (value: string) => {
    formik.setFieldValue('booking_type', value);
    if (value === 'general_service') {
      formik.setFieldValue('property_id', undefined);
    }
  };

  // Loading state
  if (loadingUsers || loadingProperties || loadingAdminUsers) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <PageHeader
          title="Create Booking"
          subtitle="Schedule a new appointment for a user"
          breadcrumbs="Dashboard / Bookings / Create Booking"
        />

        {/* Success/Error Alert */}
        <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

        {/* Create Error Alert */}
        {createBookingMutation.isError && (
          <ActionAlert
            error={{
              show: true,
              message: createBookingMutation.error?.message || 'Failed to create booking'
            }}
            sx={{ mb: 2 }}
            onClose={() => createBookingMutation.reset()}
          />
        )}

        <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} lg={8}>
              {/* Basic Information Section */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
                  
                  <Grid container spacing={3}>
                    {/* User Selection */}
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        // size="small"
                        options={users}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        value={users.find(user => user.id === formik.values.user_id) || null}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('user_id', newValue?.id || 0);
                          formik.setFieldTouched('user_id', true);
                        }}
                        onBlur={formik.handleBlur}
                        loading={loadingUsers}
                        disabled={createBookingMutation.isPending}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={
                              <span>
                                User <span style={{ color: 'red' }}>*</span>
                              </span>
                            }
                            error={formik.touched.user_id && Boolean(formik.errors.user_id)}
                            helperText={formik.touched.user_id && formik.errors.user_id}
                          />
                        )}
                      />
                    </Grid>

                    {/* Booking Type */}
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        // size="small"
                        options={[
                          { value: 'general_service', label: 'General Consultation' },
                          { value: 'property_consultation', label: 'Property Consultation' }
                        ]}
                        getOptionLabel={(option) => option.label}
                        value={[
                          { value: 'general_service', label: 'General Consultation' },
                          { value: 'property_consultation', label: 'Property Consultation' }
                        ].find(type => type.value === formik.values.booking_type) || null}
                        onChange={(_, newValue) => {
                          handleBookingTypeChange(newValue?.value || 'general_service');
                          formik.setFieldTouched('booking_type', true);
                        }}
                        onBlur={formik.handleBlur}
                        disabled={createBookingMutation.isPending}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={
                              <span>
                                Booking Type <span style={{ color: 'red' }}>*</span>
                              </span>
                            }
                            error={formik.touched.booking_type && Boolean(formik.errors.booking_type)}
                            helperText={formik.touched.booking_type && formik.errors.booking_type}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Property Selection (conditional) */}
              {formik.values.booking_type === 'property_consultation' && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Property Selection
                    </Typography>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Autocomplete
                        //   size="small"
                          options={properties}
                          getOptionLabel={(option) => `${option.title_en} (${option.code})`}
                          value={properties.find(property => property.id === formik.values.property_id) || null}
                          onChange={(_, newValue) => {
                            formik.setFieldValue('property_id', newValue?.id || undefined);
                            formik.setFieldTouched('property_id', true);
                          }}
                          onBlur={formik.handleBlur}
                          loading={loadingProperties}
                          disabled={createBookingMutation.isPending}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Property (Optional)"
                              error={formik.touched.property_id && Boolean(formik.errors.property_id)}
                              helperText={formik.touched.property_id && formik.errors.property_id}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Appointment Details */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Appointment Details
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
                  
                  <Grid container spacing={3}>
                    {/* Appointment Date */}
                    <Grid item xs={12} md={6}>
                      <DatePicker
                              label={
                                <span>
                                  Appointment Date <span style={{ color: 'red' }}>*</span>
                                </span>
                              }
                        value={dayjs(formik.values.appointment_date)}
                        onChange={(date) => {
                          if (date) {
                            formik.setFieldValue('appointment_date', dayjs(date).format('YYYY-MM-DD'));
                          }
                        }}
                        minDate={dayjs()}
                        disabled={createBookingMutation.isPending}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: formik.touched.appointment_date && Boolean(formik.errors.appointment_date),
                            helperText: formik.touched.appointment_date && formik.errors.appointment_date,
                          },
                        }}
                      />
                    </Grid>

                    {/* Appointment Time */}
                    <Grid item xs={12} md={6}>
                      <TimePicker
                              label={
                                <span>
                                  Appointment Time <span style={{ color: 'red' }}>*</span>
                                </span>
                              }
                        value={dayjs(`2000-01-01 ${formik.values.appointment_time}`)}
                        onChange={(time) => {
                          if (time) {
                            formik.setFieldValue('appointment_time', dayjs(time).format('HH:mm'));
                          }
                        }}
                        disabled={createBookingMutation.isPending}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: formik.touched.appointment_time && Boolean(formik.errors.appointment_time),
                            helperText: formik.touched.appointment_time && formik.errors.appointment_time,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Notes Section */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
                  
                  <Grid container spacing={3}>
                    {/* User Notes */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="user_notes"
                        label="User Notes"
                        multiline
                        rows={4}
                        value={formik.values.user_notes}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.user_notes && Boolean(formik.errors.user_notes)}
                        helperText={formik.touched.user_notes && formik.errors.user_notes}
                        disabled={createBookingMutation.isPending}
                        placeholder="Notes that will be visible to the user..."
                      />
                    </Grid>

                    {/* Admin Notes */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="admin_notes"
                        label="Admin Notes"
                        multiline
                        rows={4}
                        value={formik.values.admin_notes}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.admin_notes && Boolean(formik.errors.admin_notes)}
                        helperText={formik.touched.admin_notes && formik.errors.admin_notes}
                        disabled={createBookingMutation.isPending}
                        placeholder="Internal notes for admin reference..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} lg={4}>
              {/* Assignment Section */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Assignment
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
                  
                  <Autocomplete
                    // size="small"
                    options={adminUsers}
                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                    value={adminUsers.find(admin => admin.id === formik.values.assigned_admin_id) || null}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('assigned_admin_id', newValue?.id || undefined);
                      formik.setFieldTouched('assigned_admin_id', true);
                    }}
                    onBlur={formik.handleBlur}
                    loading={loadingAdminUsers}
                    disabled={createBookingMutation.isPending}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Assigned Admin (Optional)"
                        error={formik.touched.assigned_admin_id && Boolean(formik.errors.assigned_admin_id)}
                        helperText={formik.touched.assigned_admin_id && formik.errors.assigned_admin_id}
                      />
                    )}
                  />
                </CardContent>
              </Card>

              {/* Booking Information */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Booking Information
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                  <Alert severity="info">
                    <Typography variant="body2">
                      The booking will be created with "Pending" status and can be managed from the bookings list.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <FormActions
                onSubmit={formik.handleSubmit}
                onCancel={() => navigate('/bookings')}
                submitText="Create Booking"
                isSubmitting={createBookingMutation.isPending}
              />
            </Grid>
          </Grid>

        {createBookingMutation.isPending && <LoadingSpinner />}
      </Box>
    </LocalizationProvider>
  );
};

export default BookingCreatePage;