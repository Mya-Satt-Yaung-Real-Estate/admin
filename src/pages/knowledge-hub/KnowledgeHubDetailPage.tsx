import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  Article as ArticleIcon,
  Description as DescriptionIcon,
  Tag as TagIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useKnowledgeHub, useDeleteKnowledgeHub } from '../../services/queries/knowledge-hub';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Knowledge Hub Details',
  description: 'View detailed information about the knowledge hub article',
  backButtonPath: '/knowledge-hub',
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const KnowledgeHubDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  // Image viewer state
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // API Queries
  const { data: knowledgeHubResponse, isLoading, error, refetch } = useKnowledgeHub(slug || '');
  const deleteKnowledgeHubMutation = useDeleteKnowledgeHub();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete: handleDeleteConfirm,
  } = useDeleteConfirmation();

  // Handle success message from URL
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage));
      // Clear the success parameter from URL
      const newSearch = new URLSearchParams(location.search);
      newSearch.delete('success');
      navigate(`${location.pathname}${newSearch.toString() ? '?' + newSearch.toString() : ''}`, { replace: true });
    }
  }, [location.search, navigate, showSuccess]);

  // Extract knowledge hub data
  const knowledgeHub = knowledgeHubResponse?.data;

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);
  const handleEdit = () => navigate(`/knowledge-hub/${slug}/edit`);

  const handleDelete = () => {
    if (knowledgeHub && slug) {
      openDeleteConfirmation(knowledgeHub.title_en, 'knowledge hub article', async () => {
        try {
          await deleteKnowledgeHubMutation.mutateAsync(slug);
          showSuccess('Knowledge Hub article deleted successfully!');
          navigate('/knowledge-hub');
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to delete knowledge hub article. Please try again.';
          showError(errorMessage);
        }
      });
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
  };

  // Loading and error states
  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={refetch} />;
  if (!knowledgeHub) return <PageErrorState error={new Error('Knowledge Hub article not found')} onRetry={refetch} />;

  return (
    <Box>
      {/* Alert System */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Page Header */}
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        breadcrumbs={`Dashboard / Content Management / Knowledge Hub / ${knowledgeHub.title_en}`}
        actionButton={{
          text: 'Back to Knowledge Hub',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          disabled={deleteKnowledgeHubMutation.isPending}
        >
          {deleteKnowledgeHubMutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Main Information */}
        <Grid item xs={12} lg={8}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArticleIcon color="primary" />
                {knowledgeHub.title_en}
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {knowledgeHub.title_mm}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon color="action" fontSize="small" />
                    <Typography variant="subtitle2" color="textSecondary">
                      Writer
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {knowledgeHub.writer_name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CategoryIcon color="action" fontSize="small" />
                    <Typography variant="subtitle2" color="textSecondary">
                      Category
                    </Typography>
                  </Box>
                  <Chip
                    label={knowledgeHub.category?.name_en || 'No Category'}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon color="action" fontSize="small" />
                    <Typography variant="subtitle2" color="textSecondary">
                      Created
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {formatDate(knowledgeHub.created_at, 'display')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ViewIcon color="action" fontSize="small" />
                    <Typography variant="subtitle2" color="textSecondary">
                      Views / Likes
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {knowledgeHub.view_count || 0} views • {knowledgeHub.like_count || 0} likes
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Short Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                Short Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {knowledgeHub.short_description}
              </Typography>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArticleIcon color="primary" />
                Main Content
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {knowledgeHub.main_content}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Additional Information */}
        <Grid item xs={12} lg={4}>
          {/* Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={knowledgeHub.is_active ? 'Active' : 'Inactive'} 
                  color={knowledgeHub.is_active ? 'success' : 'default'} 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>

          {/* Tags */}
          {knowledgeHub.tag && knowledgeHub.tag.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TagIcon color="primary" />
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {knowledgeHub.tag.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Image */}
          {knowledgeHub.images && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ImageIcon color="primary" />
                  Knowledge Hub Image
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 200,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.9,
                    },
                  }}
                  onClick={() => knowledgeHub.images && handleImageClick(knowledgeHub.images.url)}
                >
                  <img
                    src={knowledgeHub.images?.url}
                    alt={knowledgeHub.images?.file_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption">image</Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  {knowledgeHub.images?.file_name}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Timestamps
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(knowledgeHub.created_at, 'display')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(knowledgeHub.updated_at, 'display')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewerOpen}
        onClose={handleCloseImageViewer}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseImageViewer}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Knowledge Hub Image"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteKnowledgeHubMutation.isPending}
        error={deleteKnowledgeHubMutation.error?.message}
      />

    </Box>
  );
};

export default KnowledgeHubDetailPage;
