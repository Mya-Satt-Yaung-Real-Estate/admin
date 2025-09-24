import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAlertSystem } from '../../hooks';
import { useFaq, useUpdateFaq, useCreateFaq } from '../../services/queries/faqs';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert } from '../../components/ui';

// Validation schema
const validationSchema = Yup.object({
  question_en: Yup.string().required('English question is required'),
  question_mm: Yup.string().required('Myanmar question is required'),
  answer_en: Yup.string().required('English answer is required'),
  answer_mm: Yup.string().required('Myanmar answer is required'),
  order: Yup.number().min(0, 'Order must be 0 or greater').required('Order is required'),
  is_active: Yup.boolean(),
});

const PAGE_CONFIG = {
  title: 'FAQ Form',
  description: 'Create or edit FAQ',
} as const;

const FaqFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isEdit = !!slug;

  // ========================================================================  
  // HOOKS & STATE
  // ========================================================================

  const { data: faqResponse, isLoading: isLoadingFaq } = useFaq(slug || '');
  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Formik form setup
  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      question_en: '',
      question_mm: '',
      answer_en: '',
      answer_mm: '',
      order: 0,
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await updateFaqMutation.mutateAsync({
            slug: slug!,
            data: values,
          });
          showSuccess('FAQ updated successfully!');
        } else {
          await createFaqMutation.mutateAsync(values);
          showSuccess('FAQ created successfully!');
        }
        navigate('/faqs');
      } catch (error: any) {
        console.error(`${isEdit ? 'Update' : 'Create'} FAQ error:`, error);
        
        // Handle different types of errors
        let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} FAQ. Please try again.`;
        
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        // Handle validation errors
        if (error?.errors && typeof error.errors === 'object') {
          const validationErrors = Object.values(error.errors).flat().join(', ');
          errorMessage = `Validation errors: ${validationErrors}`;
        }
        
        // Handle authentication errors
        if (error?.isAuthError) {
          errorMessage = 'Session expired. Please log in again.';
          // Optionally redirect to login
          // navigate('/login');
        }
        
        showError(errorMessage);
      }
    },
  });

  // ========================================================================  
  // EFFECTS
  // ========================================================================

  // Load FAQ data for editing
  useEffect(() => {
    if (isEdit && faqResponse?.data) {
      const faq = faqResponse.data;
      formik.setValues({
        question_en: faq.question_en || '',
        question_mm: faq.question_mm || '',
        answer_en: faq.answer_en || '',
        answer_mm: faq.answer_mm || '',
        order: faq.order || 0,
        is_active: faq.is_active,
      });
    }
  }, [isEdit, faqResponse]);

  // ========================================================================  
  // EVENT HANDLERS
  // ========================================================================

  const handleBack = () => {
    navigate('/faqs');
  };

  const handleCancel = () => {
    navigate('/faqs');
  };


  // ========================================================================  
  // RENDER
  // ========================================================================

  // Loading state for edit mode
  if (isEdit && isLoadingFaq) {
    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader
          title={PAGE_CONFIG.title}
          breadcrumbs="Dashboard / FAQs / Edit"
          subtitle={PAGE_CONFIG.description}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const isLoading = createFaqMutation.isPending || updateFaqMutation.isPending;

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={isEdit ? 'Edit FAQ' : 'Create FAQ'}
        breadcrumbs={`Dashboard / FAQs / ${isEdit ? 'Edit' : 'Create'}`}
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: 'Back to FAQs',
          icon: <BackIcon />,
          onClick: handleBack
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Card>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* English Question */}
              <Grid item xs={12}>
                <TextField
                  name="question_en"
                  label="Question (English)"
                  fullWidth
                  multiline
                  rows={2}
                  value={formik.values.question_en}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.question_en && Boolean(formik.errors.question_en)}
                  helperText={formik.touched.question_en && formik.errors.question_en}
                  placeholder="Enter the question in English..."
                />
              </Grid>

              {/* Myanmar Question */}
              <Grid item xs={12}>
                <TextField
                  name="question_mm"
                  label="Question (Myanmar)"
                  fullWidth
                  multiline
                  rows={2}
                  value={formik.values.question_mm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.question_mm && Boolean(formik.errors.question_mm)}
                  helperText={formik.touched.question_mm && formik.errors.question_mm}
                  placeholder="Enter the question in Myanmar..."
                />
              </Grid>

              <Divider sx={{ width: '100%', my: 2 }} />

              {/* English Answer */}
              <Grid item xs={12}>
                <TextField
                  name="answer_en"
                  label="Answer (English)"
                  fullWidth
                  multiline
                  rows={6}
                  value={formik.values.answer_en}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.answer_en && Boolean(formik.errors.answer_en)}
                  helperText={formik.touched.answer_en && formik.errors.answer_en}
                  placeholder="Enter the detailed answer in English..."
                />
              </Grid>

              {/* Myanmar Answer */}
              <Grid item xs={12}>
                <TextField
                  name="answer_mm"
                  label="Answer (Myanmar)"
                  fullWidth
                  multiline
                  rows={6}
                  value={formik.values.answer_mm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.answer_mm && Boolean(formik.errors.answer_mm)}
                  helperText={formik.touched.answer_mm && formik.errors.answer_mm}
                  placeholder="Enter the detailed answer in Myanmar..."
                />
              </Grid>

              <Divider sx={{ width: '100%', my: 2 }} />

              {/* Order */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="order"
                  label="Display Order"
                  type="number"
                  fullWidth
                  value={formik.values.order}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.order && Boolean(formik.errors.order)}
                  helperText={formik.touched.order && formik.errors.order ? formik.errors.order : 'Lower numbers appear first'}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Active Status */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_active"
                      checked={formik.values.is_active}
                      onChange={formik.handleChange}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    variant="outlined"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    startIcon={<SaveIcon />}
                    variant="contained"
                    disabled={isLoading || !formik.dirty}
                  >
                    {isLoading ? 'Saving...' : (isEdit ? 'Update FAQ' : 'Create FAQ')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FaqFormPage;
