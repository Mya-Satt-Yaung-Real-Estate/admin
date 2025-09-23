import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Alert,
  FormControl,
  FormControlLabel,
  Switch,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useUpdateAppointment, useAppointmentTimeSlots, useAppointment } from '../../services/queries/appointments';
import { usePropertyListingTypes } from '../../services/queries/properties';
import { useUsers } from '../../services/queries/users';
import { CreateAppointmentData } from '../../types/appointment';
import { FormActions } from '../../components/forms/shared/FormActions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  user_id: Yup.number().required('User selection is required'),
  property_listing_type_id: Yup.number().required('Property type is required'),
  prefer_time_id: Yup.number().nullable(),
  is_anytime: Yup.boolean().required(),
  date: Yup.date()
    .min(new Date(), 'Appointment date must be today or in the future')
    .required('Appointment date is required'),
  contact_name: Yup.string()
    .max(100, 'Contact name cannot exceed 100 characters')
    .required('Contact name is required'),
  contact_phone: Yup.string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .required('Contact phone is required'),
  contact_email: Yup.string()
    .email('Invalid email address')
    .required('Contact email is required'),
  advance_amount: Yup.number()
    .min(0, 'Advance amount cannot be negative')
    .nullable(),
  message: Yup.string()
    .max(1000, 'Message cannot exceed 1000 characters')
    .nullable(),
});

// ============================================================================
// COMPONENT
// ============================================================================

const AppointmentEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // API hooks
  const updateAppointmentMutation = useUpdateAppointment();
  const { data: appointment, isLoading: loadingAppointment } = useAppointment(Number(id));
  const { data: usersResponse, isLoading: loadingUsers } = useUsers();
  const { data: timeSlotsResponse, isLoading: loadingTimeSlots } = useAppointmentTimeSlots();
  const { data: propertyTypesResponse, isLoading: loadingPropertyTypes } = usePropertyListingTypes();
  
  const timeSlots = timeSlotsResponse || [];
  const propertyTypes = propertyTypesResponse?.data || [];

  // Form handling
  const formik = useFormik<CreateAppointmentData>({
    enableReinitialize: true,
    initialValues: {
      user_id: appointment?.user_id || 0,
      property_listing_type_id: appointment?.property_listing_type_id || 0,
      prefer_time_id: appointment?.prefer_time_id || undefined,
      is_anytime: appointment?.is_anytime || false,
      date: appointment?.date ? dayjs(appointment.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      contact_name: appointment?.contact_name || '',
      contact_phone: appointment?.contact_phone || '',
      contact_email: appointment?.contact_email || '',
      advance_amount: appointment?.advance_amount || undefined,
      message: appointment?.message || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      // Prevent double submission
      if (updateAppointmentMutation.isPending) {
        return;
      }
      
      try {
        const response = await updateAppointmentMutation.mutateAsync({ 
          id: Number(id), 
          data: values 
        });
        // Navigate to appointment detail page with success message
        const appointmentId = response.data?.id;
        if (appointmentId) {
          navigate(`/appointments/${appointmentId}?success=${encodeURIComponent('Appointment updated successfully!')}`);
        } else {
          navigate('/appointments');
        }
      } catch (error: any) {
        showError(error.message || 'Failed to update appointment. Please try again.', true);
      }
    },
  });

  const handleAnytimeToggle = (checked: boolean) => {
    formik.setFieldValue('is_anytime', checked);
    if (checked) {
      formik.setFieldValue('prefer_time_id', undefined);
    }
  };

  // Loading state
  if (loadingAppointment || loadingUsers || loadingTimeSlots || loadingPropertyTypes) {
    return <LoadingSpinner />;
  }

  // Error state
  if (!appointment) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Appointment not found or you don't have permission to edit it.
        </Alert>
      </Box>
    );
  }

  // Check if appointment can be edited (only pending appointments)
  if (appointment.status !== 'pending') {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Cannot Edit Appointment"
          subtitle="This appointment cannot be edited"
          breadcrumbs="Appointments / Edit Appointment"
        />
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Edit Not Allowed
          </Typography>
          <Typography>
            Only pending appointments can be edited. This appointment has status: <strong>{appointment.status}</strong>
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate(`/appointments/${id}`)}
              sx={{ mr: 1 }}
            >
              View Appointment
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/appointments')}
            >
              Back to List
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Edit Appointment"
          subtitle="Update appointment details"
          breadcrumbs="Appointments / Edit Appointment"
        />

        {alert && (
          <ActionAlert
            {...alert}
            onClose={clearAlert}
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
                  {/* Property Type Selection */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" error={formik.touched.property_listing_type_id && Boolean(formik.errors.property_listing_type_id)}>
                      <InputLabel>
                        <span>
                          Property Type <span style={{ color: 'red' }}>*</span>
                        </span>
                      </InputLabel>
                      <Select
                        size="small"
                        value={formik.values.property_listing_type_id || ''}
                        onChange={(e) => {
                          formik.setFieldValue('property_listing_type_id', e.target.value);
                          formik.setFieldTouched('property_listing_type_id', true);
                        }}
                        onBlur={formik.handleBlur}
                        disabled={updateAppointmentMutation.isPending}
                        label={
                          <span>
                            Property Type <span style={{ color: 'red' }}>*</span>
                          </span>
                        }
                      >
                        {propertyTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name_en} ({type.name_mm})
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.property_listing_type_id && formik.errors.property_listing_type_id && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {formik.errors.property_listing_type_id}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Anytime Toggle */}
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.is_anytime}
                          onChange={(e) => handleAnytimeToggle(e.target.checked)}
                          disabled={updateAppointmentMutation.isPending}
                        />
                      }
                      label="Flexible Time (Anytime)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Time Selection (conditional) */}
            {!formik.values.is_anytime && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Time Preference
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small" error={formik.touched.prefer_time_id && Boolean(formik.errors.prefer_time_id)}>
                        <InputLabel>Preferred Time Slot</InputLabel>
                        <Select
                          size="small"
                          value={formik.values.prefer_time_id || ''}
                          onChange={(e) => {
                            formik.setFieldValue('prefer_time_id', e.target.value || undefined);
                            formik.setFieldTouched('prefer_time_id', true);
                          }}
                          onBlur={formik.handleBlur}
                          disabled={updateAppointmentMutation.isPending}
                          label="Preferred Time Slot"
                        >
                          {timeSlots.map((slot: any) => (
                            <MenuItem key={slot.id} value={slot.id}>
                              {slot.name} ({slot.start_time} - {slot.end_time})
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.prefer_time_id && formik.errors.prefer_time_id && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                            {formik.errors.prefer_time_id}
                          </Typography>
                        )}
                      </FormControl>
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
                      label="Appointment Date *"
                      value={dayjs(formik.values.date)}
                      onChange={(date) => {
                        if (date) {
                          formik.setFieldValue('date', dayjs(date).format('YYYY-MM-DD'));
                        }
                      }}
                      minDate={dayjs()}
                      disabled={updateAppointmentMutation.isPending}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: formik.touched.date && Boolean(formik.errors.date),
                          helperText: formik.touched.date && formik.errors.date,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
                
                <Grid container spacing={3}>
                  {/* Contact Name */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="contact_name"
                      label={
                        <span>
                          Contact Name <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      value={formik.values.contact_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.contact_name && Boolean(formik.errors.contact_name)}
                      helperText={formik.touched.contact_name && formik.errors.contact_name}
                      disabled={updateAppointmentMutation.isPending}
                      placeholder="Enter contact person's name"
                    />
                  </Grid>

                  {/* Contact Phone */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="contact_phone"
                      label={
                        <span>
                          Contact Phone <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      value={formik.values.contact_phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.contact_phone && Boolean(formik.errors.contact_phone)}
                      helperText={formik.touched.contact_phone && formik.errors.contact_phone}
                      disabled={updateAppointmentMutation.isPending}
                      placeholder="Enter phone number"
                    />
                  </Grid>

                  {/* Contact Email */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="contact_email"
                      label={
                        <span>
                          Contact Email <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      type="email"
                      value={formik.values.contact_email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.contact_email && Boolean(formik.errors.contact_email)}
                      helperText={formik.touched.contact_email && formik.errors.contact_email}
                      disabled={updateAppointmentMutation.isPending}
                      placeholder="Enter email address"
                    />
                  </Grid>

                  {/* Advance Amount */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="advance_amount"
                      label="Advance Amount (MMK)"
                      type="number"
                      value={formik.values.advance_amount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        formik.setFieldValue('advance_amount', value ? parseFloat(value) : undefined);
                      }}
                      onBlur={formik.handleBlur}
                      error={formik.touched.advance_amount && Boolean(formik.errors.advance_amount)}
                      helperText={formik.touched.advance_amount && formik.errors.advance_amount}
                      disabled={updateAppointmentMutation.isPending}
                      placeholder="Enter advance amount (optional)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Message Section */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
                
                <Grid container spacing={3}>
                  {/* Message */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      name="message"
                      label="Message"
                      multiline
                      rows={4}
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.message && Boolean(formik.errors.message)}
                      helperText={formik.touched.message && formik.errors.message}
                      disabled={updateAppointmentMutation.isPending}
                      placeholder="Enter any additional information or special requests..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* User Selection */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Selection
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Autocomplete
                      size="small"
                      options={usersResponse?.data || []}
                      getOptionLabel={(option) => `${option.name} (${option.email})`}
                      value={usersResponse?.data?.find((user: any) => user.id === formik.values.user_id) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('user_id', newValue?.id || 0);
                        formik.setFieldTouched('user_id', true);
                      }}
                      onBlur={formik.handleBlur}
                      loading={loadingUsers}
                      disabled={updateAppointmentMutation.isPending}
                      filterOptions={(options, { inputValue }) => {
                        const searchTerm = inputValue.toLowerCase();
                        return options.filter((option) =>
                          option.name.toLowerCase().includes(searchTerm) ||
                          option.email.toLowerCase().includes(searchTerm)
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label={
                            <span>
                              Select User <span style={{ color: 'red' }}>*</span>
                            </span>
                          }
                          error={formik.touched.user_id && Boolean(formik.errors.user_id)}
                          helperText={formik.touched.user_id && formik.errors.user_id}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Appointment Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Appointment Information
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                <Alert severity="info">
                  <Typography variant="body2">
                    Current status: <strong>{appointment.status}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    You can update the appointment details. The status will remain unchanged.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <FormActions
              onSubmit={formik.handleSubmit}
              onCancel={() => navigate(`/appointments/${id}`)}
              submitText="Update Appointment"
              isSubmitting={updateAppointmentMutation.isPending}
              isDisabled={
                !formik.values.user_id ||
                !formik.values.property_listing_type_id ||
                !formik.values.contact_name ||
                !formik.values.contact_phone ||
                !formik.values.contact_email ||
                !formik.values.date ||
                updateAppointmentMutation.isPending
              }
            />
          </Grid>
        </Grid>

        {updateAppointmentMutation.isPending && <LoadingSpinner />}
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentEditPage;
