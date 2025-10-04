import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert, StatusChip, DeleteConfirmationDialog } from '../../components/ui';
import { useAlertSystem, useDeleteConfirmation } from '../../hooks';
import { useLawyer, useDeleteLawyer } from '../../services/queries/lawyers';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// COMPONENT
// ============================================================================

const LawyerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // API Queries
  const { data: lawyerResponse, isLoading, error } = useLawyer(slug!);
  const deleteLawyerMutation = useDeleteLawyer();

  const lawyer = lawyerResponse?.data;

  // Handle delete
  const handleDelete = () => {
    if (!lawyer) return;
    
    openDeleteConfirmation(
      lawyer.name,
      'lawyer',
      async () => {
        try {
          await deleteLawyerMutation.mutateAsync(lawyer.slug);
          navigate('/lawyers?success=' + encodeURIComponent('Lawyer deleted successfully!'));
        } catch (error: any) {
          showError(error.message || 'Failed to delete lawyer. Please try again.');
        }
      }
    );
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error || !lawyer) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Lawyer Details"
          subtitle="View lawyer information"
          breadcrumbs="Dashboard / Lawyers / Lawyer Details"
          actionButton={{
            text: 'Back to Lawyers',
            icon: <ArrowBackIcon />,
            onClick: () => navigate('/lawyers')
          }}
        />
        <Box sx={{ mt: 2 }}>
          <ActionAlert
            error={{
              show: true,
              message: error?.message || 'Lawyer not found'
            }}
            sx={{ mb: 2 }}
            onClose={() => navigate('/lawyers')}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Lawyer Details"
        subtitle={`Viewing information for ${lawyer.name}`}
        breadcrumbs="Dashboard / Lawyers / Lawyer Details"
        actionButton={{
          text: 'Back to Lawyers',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/lawyers')
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/lawyers/${lawyer.slug}/edit`)}
          color="primary"
        >
          Edit Lawyer
        </Button>
        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          color="error"
          disabled={deleteLawyerMutation.isPending}
        >
          Delete Lawyer
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Main Information */}
        <Grid item xs={12} lg={8}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600">
                  Basic Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Lawyer Name
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {lawyer.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Professional Title
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {lawyer.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Specialization
                  </Typography>
                  <Chip
                    label={lawyer.specialization}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Experience
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {lawyer.experience_years} years
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    About
                  </Typography>
                  <Typography variant="body1">
                    {lawyer.about || 'No description provided'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600">
                  Location Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Region
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {lawyer.region.name_en}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Township
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {lawyer.township.name_en}
                  </Typography>
                </Grid>
                {lawyer.address && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {lawyer.address}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600">
                  Contact Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {lawyer.phone && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Phone Number
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {lawyer.phone}
                    </Typography>
                  </Grid>
                )}
                {lawyer.email && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Email Address
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {lawyer.email}
                    </Typography>
                  </Grid>
                )}
                {!lawyer.phone && !lawyer.email && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      No contact information provided
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Education & Certifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600">
                  Education & Certifications
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Education
                  </Typography>
                  {lawyer.education && lawyer.education.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {lawyer.education.map((edu, index) => (
                        <Typography key={index} variant="body2" sx={{ pl: 1, borderLeft: 2, borderColor: 'primary.main' }}>
                          {edu}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No education information provided
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Certifications
                  </Typography>
                  {lawyer.certifications && lawyer.certifications.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {lawyer.certifications.map((cert, index) => (
                        <Typography key={index} variant="body2" sx={{ pl: 1, borderLeft: 2, borderColor: 'secondary.main' }}>
                          {cert}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No certifications provided
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Profile & Additional Info */}
        <Grid item xs={12} lg={4}>
          {/* Profile Image & Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar
                  src={lawyer.images}
                  sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}
                >
                  {lawyer.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {lawyer.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {lawyer.title}
                </Typography>
                <StatusChip 
                  status={lawyer.status ? 'active' : 'inactive'} 
                  statusType="status"
                  sx={{ mt: 1 }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Skills & Languages */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600">
                  Skills & Languages
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Languages Spoken
                  </Typography>
                  {lawyer.skillful_languages && lawyer.skillful_languages.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {lawyer.skillful_languages.map((language, index) => (
                        <Chip
                          key={index}
                          label={language}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No languages specified
                    </Typography>
                  )}
                </Box>

                {lawyer.services && lawyer.services.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Services Offered
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {lawyer.services.map((service, index) => (
                        <Chip
                          key={index}
                          label={service}
                          color="secondary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600">
                  System Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(lawyer.created_at)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(lawyer.updated_at)}
                  </Typography>
                </Box>
                {lawyer.deleted_at && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Deleted
                    </Typography>
                    <Typography variant="body2" color="error">
                      {formatDate(lawyer.deleted_at)}
                    </Typography>
                  </Box>
                )}
              </Box>
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
        isLoading={deleteLawyerMutation.isPending}
        error={deleteLawyerMutation.error?.message}
      />
    </Box>
  );
};

export default LawyerDetailPage;
