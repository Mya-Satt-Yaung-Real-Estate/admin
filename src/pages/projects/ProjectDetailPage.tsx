import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Dialog,
  DialogContent,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as ViewCountIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  RestoreFromTrash as RestoreIcon,
  Home as HomeIcon,
  AttachMoney as PriceIcon,
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  Schedule as ScheduleIcon,
  Image as ImageIcon,
  Email as EmailIconAlt,
  LocationOn as LocationIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import {
  StatusChip,
  PageLoadingState,
  PageErrorState,
  DeleteConfirmationDialog,
  ConfirmationDialog,
  ActionAlert,
} from '../../components/ui';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useProject, useDeleteProject, useRestoreProject } from '../../services/queries/projects';
import { formatDate } from '../../constants/dateFormats';
import { PROJECT_CONDITIONS } from '../../validations/schemas/projectSchemas';
import { Project } from '../../types/project';

const getConditionLabel = (condition: Project['condition']): string =>
  PROJECT_CONDITIONS.find((item) => item.value === condition)?.label
  ?? condition.replace(/_/g, ' ');

import { formatProjectCurrencyLabel, formatProjectPriceRange } from '../../utils/formatProjectPrice';

const getConditionChipColor = (
  condition: Project['condition']
): 'info' | 'success' | 'warning' | 'default' => {
  switch (condition) {
    case 'upcoming':
      return 'info';
    case 'ongoing':
      return 'success';
    case 'under_construction':
      return 'warning';
    default:
      return 'default';
  }
};

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const theme = useTheme();
  const projectId = Number(id);

  const [selectedImage, setSelectedImage] = useState<{ url: string; filename?: string; is_primary?: boolean | null } | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  const { data: projectResponse, isLoading, error } = useProject(projectId);
  const deleteProjectMutation = useDeleteProject();
  const restoreProjectMutation = useRestoreProject();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage));
      const newSearch = new URLSearchParams(location.search);
      newSearch.delete('success');
      navigate(`${location.pathname}${newSearch.toString() ? `?${newSearch.toString()}` : ''}`, { replace: true });
    }
  }, [location.search, navigate, showSuccess]);

  const project = projectResponse?.data;

  const handleDelete = () => {
    if (!project) return;
    openDeleteConfirmation(project.title_en, 'project', async () => {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
        navigate(`/projects?success=${encodeURIComponent(`${project.title_en} deleted successfully!`)}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete project.';
        showError(message, true);
      }
    });
  };

  const handleRestore = async () => {
    if (!project) return;
    try {
      await restoreProjectMutation.mutateAsync(project.id);
      showSuccess(`${project.title_en} restored successfully!`, true);
      setRestoreConfirmOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to restore project.';
      showError(message, true);
    }
  };

  if (isLoading) return <PageLoadingState />;
  if (error || !project) {
    return <PageErrorState error={error || new Error('Project not found')} onRetry={() => navigate('/projects')} />;
  }

  const isPlatformProject = project.project_mode === 'platform';
  const developerName = isPlatformProject
    ? 'Platform'
    : typeof project.developer === 'string'
      ? project.developer
      : project.developer?.name || project.user?.name || 'Unknown';

  const images = project.media?.images || [];

  return (
    <Box>
      <PageHeader
        title={project.title_en}
        subtitle={project.title_mm}
        breadcrumbs={`Dashboard / Projects / ${project.title_en}`}
        actionButton={{
          text: 'Back to Projects',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/projects'),
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {!project.is_deleted ? (
          <>
            <Tooltip title="Edit Project">
              <IconButton color="primary" onClick={() => navigate(`/projects/${projectId}/edit`)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Project">
              <IconButton color="error" onClick={handleDelete} disabled={deleteProjectMutation.isPending}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Restore Project">
            <IconButton color="success" onClick={() => setRestoreConfirmOpen(true)} disabled={restoreProjectMutation.isPending}>
              <RestoreIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                  {project.title_en}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {project.title_mm}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <StatusChip status={project.publish_status} />
                  <Chip
                    label={getConditionLabel(project.condition)}
                    size="small"
                    color={getConditionChipColor(project.condition)}
                    variant="outlined"
                  />
                  {project.show_on_homepage && (
                    <Chip icon={<HomeIcon />} label="On Homepage" color="info" size="small" variant="outlined" />
                  )}
                  <Chip
                    label={isPlatformProject ? 'Platform Project' : 'Developer Project'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  English
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {project.description_en}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Myanmar
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {project.description_mm}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <HomeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Unit Types
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available unit configurations
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {project.unit_types && project.unit_types.length > 0 ? (
                project.unit_types.map((unit, index) => (
                  <Box
                    key={unit.id ?? index}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {unit.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {unit.area} · {unit.price_range} · {unit.units} units
                    </Typography>
                    {unit.description && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {unit.description}
                      </Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No unit types added.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PaymentsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Payment Plans
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available payment options
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {project.payment_plans && project.payment_plans.length > 0 ? (
                project.payment_plans.map((plan, index) => (
                  <Box
                    key={plan.id ?? index}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {plan.name}
                    </Typography>
                    {plan.description && (
                      <Typography variant="body2" color="text.secondary">
                        {plan.description}
                      </Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No payment plans added.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PriceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Price Range
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Project pricing information
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="h4" color="success.main" fontWeight={600} gutterBottom>
                {formatProjectPriceRange(project.price?.range, project.price?.currency) || '—'}
              </Typography>
              {(project.price?.min != null || project.price?.max != null) && (
                <Typography variant="body2" color="text.secondary">
                  {formatProjectCurrencyLabel(project.price?.currency)}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ApartmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Project Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Core project information
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <ApartmentIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={500}>
                  Property Type: {project.property_type?.name_en || 'N/A'}
                  {project.property_type?.name_mm ? ` (${project.property_type.name_mm})` : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <HomeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={500}>
                  Total Units: {project.total_units || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={500}>
                  Completion: {project.completion_text || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ViewCountIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={500}>
                  Views: {project.view_count || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <LocationIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Location
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Project address and region
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Region: {project.location?.region?.name_en || 'N/A'}
                    {project.location?.region?.name_mm ? ` (${project.location.region.name_mm})` : ''}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Township: {project.location?.township?.name_en || 'N/A'}
                    {project.location?.township?.name_mm ? ` (${project.location.township.name_mm})` : ''}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Address: {project.location?.address || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {isPlatformProject ? <BusinessIcon /> : <PersonIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {isPlatformProject ? 'Platform Project' : 'Developer Information'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isPlatformProject
                      ? 'Platform-owned project information'
                      : 'Details about the project developer'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {isPlatformProject ? (
                <Typography variant="body1" color="text.secondary">
                  This project is owned and managed by the platform (Mya Satt Yaung).
                </Typography>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500}>
                      Developer: {developerName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500}>
                      Type: {typeof project.developer === 'object' ? project.developer?.user_type : project.developer_user_type || 'N/A'}
                    </Typography>
                  </Box>
                  {project.user?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIconAlt sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Email: {project.user.email}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <PhoneIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Contact Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Project contact details
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {project.contact_info?.name || project.contact_info?.phone || project.contact_info?.email ? (
                <>
                  {project.contact_info?.name && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight={500} gutterBottom>
                        Contact: {project.contact_info.name}
                      </Typography>
                    </Box>
                  )}
                  {project.contact_info?.phone && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Phone:
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {project.contact_info.phone}
                      </Typography>
                    </Box>
                  )}
                  {project.contact_info?.email && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Email:
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {project.contact_info.email}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No contact information provided.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'grey.600', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Timestamps
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Important dates
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Created: {project.dates?.created_at ? formatDate(project.dates.created_at, 'display') : '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Updated: {project.dates?.updated_at ? formatDate(project.dates.updated_at, 'display') : '—'}
                  </Typography>
                </Grid>
                {project.dates?.deleted_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="error">
                      Deleted: {formatDate(project.dates.deleted_at, 'display')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {images.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <ImageIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Media ({images.length} images)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Project photos
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {images.map((image) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                      <Paper
                        sx={{
                          p: 1,
                          textAlign: 'center',
                          border: image.is_primary ? '2px solid' : '1px solid',
                          borderColor: image.is_primary ? 'primary.main' : 'divider',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: theme.shadows[4],
                          },
                        }}
                        onClick={() => {
                          setSelectedImage(image);
                          setImageViewerOpen(true);
                        }}
                      >
                        <Box
                          component="img"
                          src={(image as { thumbnail_url?: string }).thumbnail_url || image.url}
                          alt={project.title_en}
                          sx={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: 1,
                            display: 'block',
                          }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {image.is_primary ? 'Primary Image' : 'Gallery Image'}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Click to view
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          {selectedImage && (
            <Box sx={{ position: 'relative', textAlign: 'center' }}>
              <Box
                component="img"
                src={selectedImage.url}
                alt={project.title_en}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <IconButton
                  onClick={() => setImageViewerOpen(false)}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>
                  <Typography variant="body2">
                    {selectedImage.filename || project.title_en}
                  </Typography>
                  {selectedImage.is_primary && (
                    <Chip label="Primary Image" size="small" color="primary" sx={{ mt: 1 }} />
                  )}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteState.itemName}"?`}
        isLoading={deleteProjectMutation.isPending}
      />

      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        onConfirm={handleRestore}
        itemName={project.title_en}
        itemType="project"
        action="restore"
        isLoading={restoreProjectMutation.isPending}
        error={restoreProjectMutation.error?.message}
      />
    </Box>
  );
};

export default ProjectDetailPage;
