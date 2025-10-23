import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  Category as CategoryIcon,
  Message as MessageIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert, DeleteConfirmationDialog } from '../../components/ui';
import { useContactUsDetail, useDeleteContactUs, useRestoreContactUs, useForceDeleteContactUs } from '../../services/queries/contactUs';
import { formatDate } from '../../utils/formatters';
import { useAlertSystem, useDeleteConfirmation } from '../../hooks';

const ContactUsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation, handleConfirmDelete } = useDeleteConfirmation();

  const { data: contactResponse, isLoading, error } = useContactUsDetail(slug || '');
  const deleteContactUsMutation = useDeleteContactUs();
  const restoreContactUsMutation = useRestoreContactUs();
  const forceDeleteContactUsMutation = useForceDeleteContactUs();

  const contact = contactResponse?.data;

  const handleBack = () => {
    navigate('/contact-us');
  };

  const handleDelete = async () => {
    if (contact?.slug) {
      openDeleteConfirmation(
        contact.user_name || 'Unknown User',
        'contact us record',
        async () => {
          try {
            await deleteContactUsMutation.mutateAsync(contact.slug);
            showSuccess(`Contact us record from ${contact.user_name || 'Unknown User'} deleted successfully!`);
            navigate('/contact-us');
          } catch (err: any) {
            showError(err.message || 'Failed to delete contact us record.');
          }
        }
      );
    }
  };

  const handleRestore = async () => {
    if (contact?.slug) {
      openDeleteConfirmation(
        contact.user_name || 'Unknown User',
        'contact us record',
        async () => {
          try {
            await restoreContactUsMutation.mutateAsync(contact.slug);
            showSuccess(`Contact us record from ${contact.user_name || 'Unknown User'} restored successfully!`);
            navigate('/contact-us');
          } catch (err: any) {
            showError(err.message || 'Failed to restore contact us record.');
          }
        }
      );
    }
  };

  const handleForceDelete = async () => {
    if (contact?.slug) {
      openDeleteConfirmation(
        contact.user_name || 'Unknown User',
        'contact us record',
        async () => {
          try {
            await forceDeleteContactUsMutation.mutateAsync(contact.slug);
            showSuccess(`Contact us record from ${contact.user_name || 'Unknown User'} permanently deleted successfully!`);
            navigate('/contact-us');
          } catch (err: any) {
            showError(err.message || 'Failed to permanently delete contact us record.');
          }
        }
      );
    }
  };

  if (isLoading) {
    return <PageLoadingState title="Loading Contact Us Details..." />;
  }

  if (error || !contact) {
    return (
      <Box>
        <PageHeader 
          title="Contact Us Details"
          breadcrumbs="Dashboard / Contact Us Management / Details"
          actionButton={{
            text: 'Back to Contact Us',
            icon: <ArrowBackIcon />,
            onClick: handleBack
          }}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error?.message || 'Failed to load contact us details.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Contact Us Details"
        subtitle={`From ${contact.user_name || 'Unknown User'}`}
        breadcrumbs="Dashboard / Contact Us Management / Details"
        actionButton={{
          text: 'Back to Contact Us',
          icon: <ArrowBackIcon />,
          onClick: handleBack
        }}
      />
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {contact.deleted_at ? (
          <>
            <Button
              variant="outlined"
              color="info"
              startIcon={<RestoreIcon />}
              onClick={handleRestore}
            >
              Restore
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleForceDelete}
            >
              Permanently Delete
            </Button>
          </>
        ) : (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </Box>
      <ActionAlert {...alert} onClose={clearAlert} />
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteContactUsMutation.isPending || restoreContactUsMutation.isPending || forceDeleteContactUsMutation.isPending}
        error={deleteContactUsMutation.error?.message || restoreContactUsMutation.error?.message || forceDeleteContactUsMutation.error?.message}
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
                  <Typography variant="h6">{contact.user_name || 'Anonymous'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {contact.email || 'No email provided'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary="Phone" secondary={contact.phone || 'Not provided'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Submitted" 
                    secondary={contact.created_at ? formatDate(contact.created_at) : 'Unknown date'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CategoryIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Category" 
                    secondary={
                      <Chip 
                        label={contact.category || 'Unknown'} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    } 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SubjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Subject</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {contact.subject || 'No subject provided'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MessageIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Message</Typography>
                </Box>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50',
                    minHeight: 120,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <Typography variant="body1">
                    {contact.message || 'No message content'}
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContactUsDetailPage;