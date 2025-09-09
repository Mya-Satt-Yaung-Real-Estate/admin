import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
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
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Feedback as FeedbackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFeedback } from '../../services/queries/feedback';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { formatDate } from '../../constants/dateFormats';
import { useAlertSystem, useDeleteConfirmation } from '../../hooks';
import { useDeleteFeedback } from '../../services/queries/feedback';

const FeedbackDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { showSuccess, showError } = useAlertSystem();
  const { openDeleteConfirmation } = useDeleteConfirmation();

  // Queries
  const { data: feedbackData, isLoading, error } = useFeedback(slug || '');
  const deleteFeedbackMutation = useDeleteFeedback();

  // Event handlers
  const handleBack = () => {
    navigate('/feedback');
  };

  const handleDelete = async (feedback: any) => {
    openDeleteConfirmation(
      feedback.user_name,
      'feedback',
      async () => {
        try {
          await deleteFeedbackMutation.mutateAsync(feedback.slug);
          showSuccess(`Feedback from ${feedback.user_name} deleted successfully!`);
          navigate('/feedback');
        } catch (error: any) {
          showError(error.message || 'Failed to delete feedback.');
        }
      }
    );
  };

  // Loading and error states
  if (isLoading) {
    return <PageLoadingState title="Loading Feedback" />;
  }

  if (error || !feedbackData?.data?.[0]) {
    return (
      <Box>
        <PageHeader
          title="Feedback Details"
          subtitle="View feedback information"
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error?.message || 'Failed to load feedback. Please try again.'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to List
          </Button>
        </Box>
      </Box>
    );
  }

  const feedback = feedbackData.data[0];

  return (
    <Box>
      <PageHeader
        title="Feedback Details"
        subtitle="View feedback information"
      />

      <Grid container spacing={3}>
        {/* User Information Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {feedback.user_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    @{feedback.slug}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EmailIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={feedback.email}
                    primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>

                {feedback.phone && (
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PhoneIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={feedback.phone}
                      primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}

                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Submitted"
                    secondary={formatDate(feedback.created_at)}
                    primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>

                {feedback.updated_at !== feedback.created_at && (
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={formatDate(feedback.updated_at)}
                      primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Feedback Content Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FeedbackIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Feedback Content
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {feedback.feedback}
                </Typography>
              </Paper>

              <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${feedback.feedback.length} characters`}
                  size="small"
                  variant="outlined"
                  color="info"
                />
                <Chip
                  label={`${feedback.feedback.split(' ').length} words`}
                  size="small"
                  variant="outlined"
                  color="info"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => handleDelete(feedback)}
        >
          Delete Feedback
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to List
        </Button>
      </Box>

      {/* Action Alert */}
      <ActionAlert />
    </Box>
  );
};

export default FeedbackDetailPage;
