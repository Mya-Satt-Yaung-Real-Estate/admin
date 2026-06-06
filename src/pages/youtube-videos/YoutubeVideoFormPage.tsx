import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Cancel as CancelIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, LoadingSpinner, PageErrorState } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import {
  useCreateYoutubeVideo,
  useUpdateYoutubeVideo,
  useYoutubeVideo,
} from '../../services/queries/youtubeVideos';
import { CreateYoutubeVideoData } from '../../types/youtubeVideo';

const defaultFormData: CreateYoutubeVideoData = {
  name: '',
  description: '',
  youtube_link: '',
  status: true,
};

const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;

const YoutubeVideoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const videoId = Number(id || 0);
  const isEditMode = Boolean(videoId);
  const { alert, showError, clearAlert } = useAlertSystem();
  const [formData, setFormData] = useState<CreateYoutubeVideoData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: videoResponse, isLoading, error } = useYoutubeVideo(videoId);
  const createVideoMutation = useCreateYoutubeVideo();
  const updateVideoMutation = useUpdateYoutubeVideo();

  const isSubmitting = createVideoMutation.isPending || updateVideoMutation.isPending;

  useEffect(() => {
    if (!isEditMode || !videoResponse?.data) return;

    setFormData({
      name: videoResponse.data.name,
      description: videoResponse.data.description || '',
      youtube_link: videoResponse.data.youtube_link,
      status: videoResponse.data.status,
    });
  }, [isEditMode, videoResponse]);

  const pageTitle = useMemo(
    () => (isEditMode ? 'Edit YouTube Video' : 'Create YouTube Video'),
    [isEditMode]
  );

  const handleInputChange = (field: keyof CreateYoutubeVideoData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!formData.youtube_link.trim()) {
      nextErrors.youtube_link = 'YouTube link is required';
    } else if (!youtubeUrlPattern.test(formData.youtube_link.trim())) {
      nextErrors.youtube_link = 'Please enter a valid YouTube URL';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!validateForm()) return;

    const payload: CreateYoutubeVideoData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      youtube_link: formData.youtube_link.trim(),
      status: Boolean(formData.status),
    };

    try {
      if (isEditMode) {
        await updateVideoMutation.mutateAsync({ id: videoId, data: payload });
        navigate('/youtube-videos?success=' + encodeURIComponent('YouTube video updated successfully.'));
      } else {
        await createVideoMutation.mutateAsync(payload);
        navigate('/youtube-videos?success=' + encodeURIComponent('YouTube video created successfully.'));
      }
    } catch (error: any) {
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        showError(error?.message || 'Failed to save YouTube video.', true);
      }
    }
  };

  if (isEditMode && isLoading) {
    return <LoadingSpinner />;
  }

  if (isEditMode && error) {
    return (
      <PageErrorState
        error={error}
        title="Failed to load YouTube video"
        message="Please try refreshing the page."
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title={pageTitle}
        subtitle={isEditMode ? 'Update YouTube video details' : 'Add a new YouTube video'}
        breadcrumbs={`Dashboard / YouTube Videos / ${isEditMode ? 'Edit' : 'Create'}`}
        actionButton={{
          text: 'Back to YouTube Videos',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/youtube-videos'),
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={(event) => handleInputChange('name', event.target.value)}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description || ''}
                  onChange={(event) => handleInputChange('description', event.target.value)}
                  error={Boolean(errors.description)}
                  helperText={errors.description}
                  multiline
                  minRows={4}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="YouTube Link"
                  name="youtube_link"
                  value={formData.youtube_link}
                  onChange={(event) => handleInputChange('youtube_link', event.target.value)}
                  error={Boolean(errors.youtube_link)}
                  helperText={errors.youtube_link || 'Example: https://www.youtube.com/watch?v=...'}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(formData.status)}
                        onChange={(event) => handleInputChange('status', event.target.checked)}
                      />
                    }
                    label="Active"
                  />
                  <Alert severity="info">
                    Inactive videos stay saved in admin but can be hidden from future public display.
                  </Alert>
                </Stack>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/youtube-videos')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? `${isEditMode ? 'Update YouTube Video' : 'Create YouTube Video'}...`
                  : isEditMode
                    ? 'Update YouTube Video'
                    : 'Create YouTube Video'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default YoutubeVideoFormPage;
