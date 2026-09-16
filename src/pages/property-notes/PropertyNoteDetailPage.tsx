import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageErrorState, PageLoadingState, StatusChip } from '../../components/ui';
import { usePropertyNote } from '../../services/queries/propertyNotes';
import type { PropertyNotePrimaryImage } from '../../types/propertyNote';

const PropertyNoteDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const noteId = Number(id);

  const { data: noteResponse, isLoading, error, refetch } = usePropertyNote(noteId);
  const note = noteResponse?.data;

  const images: PropertyNotePrimaryImage[] = useMemo(() => {
    if (!note) return [];
    if (note.images && note.images.length > 0) {
      return note.images;
    }
    if (note.primary_image) {
      return [note.primary_image];
    }
    return [];
  }, [note]);

  const handleBack = () => {
    navigate('/property-notes');
  };

  if (isLoading) {
    return <PageLoadingState title="Loading Property Note" />;
  }

  if (error || !note) {
    return (
      <PageErrorState
        error={error ?? new Error('Property note not found')}
        title="Error Loading Property Note"
        message={
          error instanceof Error ? error.message : 'Property note not found.'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  const locationParts = [
    note.ward,
    note.road,
    note.township?.name_en,
    note.region?.name_en,
  ].filter(Boolean);

  return (
    <Box>
      <PageHeader
        title={note.note_code}
        subtitle="Property note details (read-only)"
        breadcrumbs="Dashboard / Property Note / Property Notes / Detail"
        actionButton={{
          text: 'Back to Property Notes',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <StatusChip status={note.status} />
                {note.is_locked && (
                  <Chip label="Locked" size="small" color="warning" variant="outlined" />
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Listing type
                  </Typography>
                  <Typography variant="body1">
                    {note.listing_type?.name_en || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Size (ft)
                  </Typography>
                  <Typography variant="body1">
                    {note.length_ft != null || note.width_ft != null
                      ? `${note.length_ft ?? '—'} × ${note.width_ft ?? '—'}`
                      : '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">{note.created_at || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Updated
                  </Typography>
                  <Typography variant="body1">{note.updated_at || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <LocationIcon color="action" sx={{ mt: 0.3 }} />
                <Typography variant="body1">
                  {locationParts.length ? locationParts.join(', ') : '—'}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Latitude
                  </Typography>
                  <Typography variant="body1">
                    {note.latitude != null ? note.latitude : '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Longitude
                  </Typography>
                  <Typography variant="body1">
                    {note.longitude != null ? note.longitude : '—'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Photos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {images.length === 0 ? (
                <Typography color="text.secondary">No photos uploaded.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={image.id ?? index}>
                      <Box
                        component="img"
                        src={
                          (image.medium_url as string | undefined) ||
                          (image.url as string | undefined) ||
                          (image.thumbnail_url as string | undefined) ||
                          (image.small_url as string | undefined) ||
                          ''
                        }
                        alt={`Note photo ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 180,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: image.is_primary ? '2px solid' : '1px solid',
                          borderColor: image.is_primary ? 'primary.main' : 'divider',
                          bgcolor: 'action.hover',
                        }}
                      />
                      {image.is_primary ? (
                        <Typography variant="caption" color="primary">
                          Primary
                        </Typography>
                      ) : null}
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Owner
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="action" />
                <Typography variant="body1" fontWeight={600}>
                  {note.user?.name || '—'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Phone: {note.user?.phone || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {note.user?.email || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                Type: {note.user?.user_type || '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertyNoteDetailPage;
