import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Feedback as FeedbackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFeedback } from '../../services/queries/feedback';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert, DeleteConfirmationDialog } from '../../components/ui';
import { formatDate } from '../../utils/formatters';
import { useAlertSystem, useDeleteConfirmation } from '../../hooks';
import { useDeleteFeedback } from '../../services/queries/feedback';

const FeedbackDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation, handleConfirmDelete } = useDeleteConfirmation();

  const { data: feedbackData, isLoading, error } = useFeedback(slug || '');
  const deleteFeedbackMutation = useDeleteFeedback();

  const handleBack = () => {
    navigate('/feedback');
  };

  const handleDelete = async () => {
    if (feedbackData?.data?.[0]) {
      const feedback = feedbackData.data[0];
      openDeleteConfirmation(
        feedback.user_name || 'Unknown User',
        'feedback',
        async () => {
          try {
            await deleteFeedbackMutation.mutateAsync(feedback.slug || '');
            showSuccess(`Feedback from ${feedback.user_name || 'Unknown User'} deleted successfully!`);
            navigate('/feedback');
          } catch (err: any) {
            showError(err.message || 'Failed to delete feedback.');
          }
        }
      );
    }
  };

  if (isLoading) {
    return <PageLoadingState title="Loading Feedback Details..." />;
  }

  if (error || !feedbackData?.data) {
    return (
      <Box>
        <PageHeader 
          title="Feedback Details"
          breadcrumbs="Dashboard / Feedback Management / Details"
          actionButton={{
            text: 'Back to Feedback',
            icon: <ArrowBackIcon />,
            onClick: handleBack
          }}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error?.message || 'Failed to load feedback details.'}
        </Alert>
      </Box>
    );
  }

  const feedback = feedbackData.data[0];

  return (
    <Box>
      <PageHeader
        title="Feedback Details"
        subtitle={`From ${feedback.user_name || 'Unknown User'}`}
        breadcrumbs="Dashboard / Feedback Management / Details"
        actionButton={{
          text: 'Back to Feedback',
          icon: <ArrowBackIcon />,
          onClick: handleBack
        }}
      />
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Box>
      <ActionAlert {...alert} onClose={clearAlert} />
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteFeedbackMutation.isPending}
        error={deleteFeedbackMutation.error?.message}
        requireReason={false}
      />
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{feedback.user_name || 'Anonymous'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feedback.email}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary="Phone" secondary={feedback.phone || 'Not provided'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText primary="Submitted" secondary={formatDate(feedback.created_at)} />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                <FeedbackIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Feedback
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap' }}>
                {feedback.feedback}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FeedbackDetailPage;
