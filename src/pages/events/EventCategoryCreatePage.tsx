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
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert } from '../../components/ui';
import { useCreateEventCategory } from '../../services/queries/events';
import { useAlertSystem } from '../../hooks';
import { CreateHousingEventCategoryData } from '../../types/event';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  name_en: Yup.string()
    .required('English name is required')
    .max(255, 'English name must be less than 255 characters'),
  name_mm: Yup.string()
    .required('Myanmar name is required')
    .max(255, 'Myanmar name must be less than 255 characters'),
  description: Yup.string()
    .max(1000, 'Description must be less than 1000 characters'),
  is_active: Yup.boolean(),
});

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Create Event Category',
  description: 'Add a new event category to the system',
  backButtonPath: '/events/categories',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const EventCategoryCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // State
  const [hasChanges, setHasChanges] = useState(false);

  // Mutations
  const createEventCategoryMutation = useCreateEventCategory();

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);

  const handleSubmit = async (values: CreateHousingEventCategoryData) => {
    try {
      await createEventCategoryMutation.mutateAsync(values);
      
      showSuccess('Event category created successfully');
      setHasChanges(false);
      
      // Navigate back to list page with success message
      navigate(`${PAGE_CONFIG.backButtonPath}?success=${encodeURIComponent('Event category created successfully')}`);
    } catch (error: any) {
      // Show API response error message if available, otherwise show generic message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to create event category';
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
          Back to Categories
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
          name_en: '',
          name_mm: '',
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
                      <Typography variant="h6" gutterBottom>
                        Basic Information
                      </Typography>
                      
                      <Grid container spacing={3}>
                        {/* English Name */}
                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            name="name_en"
                            label="English Name"
                            fullWidth
                            required
                            value={values.name_en}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.name_en && Boolean(errors.name_en)}
                            helperText={touched.name_en && errors.name_en}
                          />
                        </Grid>

                        {/* Myanmar Name */}
                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            name="name_mm"
                            label="Myanmar Name"
                            fullWidth
                            required
                            value={values.name_mm}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.name_mm && Boolean(errors.name_mm)}
                            helperText={touched.name_mm && errors.name_mm}
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
                            {values.is_active ? 'This category will be active and visible to users' : 'This category will be inactive and hidden from users'}
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
                      disabled={!dirty || createEventCategoryMutation.isPending}
                    >
                      Create Category
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={createEventCategoryMutation.isPending}
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

export default EventCategoryCreatePage;
