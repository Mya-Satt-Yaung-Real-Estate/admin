import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  QuestionMark as QuestionIcon,
} from '@mui/icons-material';
import { useAlertSystem, useDeleteConfirmation } from '../../hooks';
import { useFaq, useUpdateFaq, useDeleteFaq, useRestoreFaq } from '../../services/queries/faqs';
import { StatusChip, ActionAlert } from '../../components/ui';
import PageHeader from '../../components/layout/PageHeader';
import { DeleteConfirmationDialog } from '../../components/ui';
import { formatDate } from '../../constants/dateFormats';

const PAGE_CONFIG = {
  title: 'FAQ Details',
  description: 'View and manage FAQ details',
} as const;

const FaqDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // ========================================================================  
  // HOOKS & STATE
  // ========================================================================

  const { data: faqResponse, isLoading, error } = useFaq(slug || '');
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();
  const restoreFaqMutation = useRestoreFaq();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // ========================================================================  
  // EVENT HANDLERS
  // ========================================================================

  const handleBack = () => {
    navigate('/faqs');
  };

  const handleEdit = () => {
    navigate(`/faqs/${slug}/edit`);
  };

  const handleDelete = (faq: any) => {
    openDeleteConfirmation(
      `FAQ #${faq.id}`,
      'FAQ',
      async () => {
        try {
          await deleteFaqMutation.mutateAsync(faq.slug);
          showSuccess(`FAQ #${faq.id} deleted successfully!`, true);
          navigate('/faqs');
        } catch (error: any) {
          console.error('Delete FAQ error:', error);
          
          // Handle different types of errors
          let errorMessage = 'Failed to delete FAQ. Please try again.';
          
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
          
          showError(errorMessage, true);
        }
      }
    );
  };

  const handleRestore = async (faq: any) => {
    try {
      await restoreFaqMutation.mutateAsync(faq.slug);
      showSuccess(`FAQ #${faq.id} restored successfully!`, true);
    } catch (error: any) {
      console.error('Restore FAQ error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to restore FAQ. Please try again.';
      
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
      
      showError(errorMessage, true);
    }
  };


  // ========================================================================  
  // RENDER
  // ========================================================================

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader
          title={PAGE_CONFIG.title}
          breadcrumbs="Dashboard / FAQs / Details"
          subtitle={PAGE_CONFIG.description}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Error state
  if (error || !faqResponse?.data) {
    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader
          title={PAGE_CONFIG.title}
          breadcrumbs="Dashboard / FAQs / Details"
          subtitle={PAGE_CONFIG.description}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {(error as any)?.message || 'FAQ not found'}
        </Alert>
      </Box>
    );
  }

  const faq = faqResponse.data;
  const isDeleted = faq.deleted_at !== null;

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={faq.question_en || 'FAQ Details'}
        subtitle={faq.question_mm || PAGE_CONFIG.description}
        breadcrumbs="Dashboard / FAQs / Details"
        actionButton={{
          text: 'Back to FAQs',
          icon: <BackIcon />,
          onClick: handleBack
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        
        {/* Show different actions based on deleted status */}
        {!isDeleted ? (
          <>
            <Tooltip title="Update FAQ">
              <IconButton
                color="primary"
                onClick={handleEdit}
                disabled={updateFaqMutation.isPending}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete FAQ">
              <IconButton
                color="error"
                onClick={() => handleDelete(faq)}
                disabled={deleteFaqMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Restore FAQ">
            <IconButton
              color="success"
              onClick={() => handleRestore(faq)}
              disabled={restoreFaqMutation.isPending}
            >
              <RestoreIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <QuestionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h1">
                  FAQ #{faq.id}
                </Typography>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <StatusChip 
                    status={faq.is_active ? 'active' : 'inactive'} 
                    label={faq.is_active ? 'Active' : 'Inactive'}
                  />
                  {isDeleted && (
                    <Chip 
                      label="Deleted" 
                      color="error" 
                      size="small" 
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Question (English) */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Question (English)
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {faq.question_en || 'Not provided'}
                </Typography>
              </Box>

              {/* Question (Myanmar) */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Question (Myanmar)
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {faq.question_mm || 'Not provided'}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Answer (English) */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Answer (English)
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {faq.answer_en || 'Not provided'}
                  </Typography>
                </Paper>
              </Box>

              {/* Answer (Myanmar) */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Answer (Myanmar)
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {faq.answer_mm || 'Not provided'}
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                FAQ Information
              </Typography>
              
              <Divider sx={{ mb: 2 }} />

              {/* Order */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Display Order
                </Typography>
                <Typography variant="body1">
                  {faq.order || 'Not set'}
                </Typography>
              </Box>

              {/* Created Date */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created Date
                </Typography>
                <Typography variant="body1">
                  {faq.created_at ? formatDate(faq.created_at, 'display') : 'N/A'}
                </Typography>
              </Box>

              {/* Updated Date */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {faq.updated_at ? formatDate(faq.updated_at, 'display') : 'N/A'}
                </Typography>
              </Box>

              {/* Deleted Date */}
              {isDeleted && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Deleted Date
                  </Typography>
                  <Typography variant="body1">
                    {faq.deleted_at ? formatDate(faq.deleted_at, 'display') : 'N/A'}
                  </Typography>
                </Box>
              )}

            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteFaqMutation.isPending}
        error={deleteFaqMutation.error?.message}
      />
    </Box>
  );
};

export default FaqDetailPage;
