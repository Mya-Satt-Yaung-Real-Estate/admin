import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  OpenInFull as ExpandMapIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageErrorState, PageLoadingState, StatusChip } from '../../components/ui';
import { usePropertyNote } from '../../services/queries/propertyNotes';
import type { PropertyNotePrimaryImage } from '../../types/propertyNote';
import { PropertyNoteLocationMap } from './PropertyNoteLocationMap';

const PropertyNoteDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const noteId = Number(id);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const { data: noteResponse, isLoading, error, refetch } = usePropertyNote(noteId);
  const note = noteResponse?.data;
  const hasDrawnArea =
    note?.boundary != null &&
    note.boundary.type === 'Polygon' &&
    Array.isArray(note.boundary.coordinates?.[0]) &&
    note.boundary.coordinates[0].length >= 4;

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

        <Grid item xs={12} md={8}>
          <Card>
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
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Latitude
                  </Typography>
                  <Typography variant="body1">
                    {note.latitude != null ? note.latitude : '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Longitude
                  </Typography>
                  <Typography variant="body1">
                    {note.longitude != null ? note.longitude : '—'}
                  </Typography>
                </Grid>
              </Grid>

              {/**
               * View-only Leaflet: pin always; polygon when boundary exists (legacy = pin only).
               */}
              {note.latitude != null && note.longitude != null ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {hasDrawnArea ? 'Map pin + drawn area (view only)' : 'Map pin (no drawn area)'}
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    {!isMapExpanded ? (
                      <PropertyNoteLocationMap
                        mapKey={`inline-${note.id}`}
                        latitude={note.latitude}
                        longitude={note.longitude}
                        boundary={note.boundary ?? null}
                        height={220}
                        zoom={15}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 220,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Expanded map is open…
                        </Typography>
                      </Box>
                    )}
                    <IconButton
                      aria-label="Maximize map"
                      size="small"
                      onClick={() => setIsMapExpanded(true)}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        bottom: 8,
                        zIndex: 1000,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      <ExpandMapIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 1, textAlign: 'center' }}
                  >
                    Pin: {note.latitude}, {note.longitude}
                    {hasDrawnArea ? ' · Drawn area shown' : ''}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No map pin available for this note.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {note.latitude != null && note.longitude != null ? (
        <Dialog
          open={isMapExpanded}
          onClose={() => setIsMapExpanded(false)}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              height: '90vh',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <DialogTitle sx={{ pr: 2, flexShrink: 0 }}>
            Map — {note.note_code}
            {hasDrawnArea ? ' (pin + drawn area)' : ' (pin only)'}
          </DialogTitle>
          <DialogContent
            dividers
            sx={{ p: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            {isMapExpanded ? (
              <Box sx={{ flex: 1, minHeight: '60vh', height: '100%' }}>
                <PropertyNoteLocationMap
                  mapKey={`expanded-${note.id}`}
                  latitude={note.latitude}
                  longitude={note.longitude}
                  boundary={note.boundary ?? null}
                  height="100%"
                  zoom={16}
                />
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              View only — zoom/pan allowed
              {hasDrawnArea ? '; drawn area from create/edit' : '; no drawn area on this note'}
            </Typography>
            <Button type="button" variant="contained" onClick={() => setIsMapExpanded(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </Box>
  );
};

export default PropertyNoteDetailPage;
