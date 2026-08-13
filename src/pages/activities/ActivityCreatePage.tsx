import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { MediaUpload } from '../../components/ui';
import {
  ActivityModeSection,
  ActivityPlatformNotice,
  ActivityUserSelect,
} from '../../components/forms/activity/ActivityModeSection';
import { useCreateActivity } from '../../services/queries/activities';
import { useUsers } from '../../services/queries/users';
import { Media } from '../../types/media';
import { RegularUser } from '../../types/user';
import type { CreateActivityData } from '../../types/activity';
import {
  ActivityFormErrors,
  hasActivityFormErrors,
  mapApiErrorsToFormErrors,
  scrollToFirstActivityError,
  validateActivityForm,
} from './activityFormValidation';

const ActivityCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createActivityMutation = useCreateActivity();
  const [errors, setErrors] = useState<ActivityFormErrors>({});
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    status: 'active',
    per_page: 100,
  });

  const ownerUsers = useMemo(() => {
    const rawUsers: RegularUser[] = Array.isArray((usersResponse as any)?.data)
      ? (usersResponse as any).data
      : Array.isArray(usersResponse)
        ? (usersResponse as RegularUser[])
        : [];

    return rawUsers.filter(
      (user) => user.user_type === 'individual' || user.user_type === 'company'
    );
  }, [usersResponse]);

  const [formData, setFormData] = useState({
    is_platform_activity: true,
    user_id: null as number | null,
    title: '',
    description: '',
    status: 'published' as 'draft' | 'published',
    show_on_homepage: false,
  });

  const clearFieldError = (field: keyof ActivityFormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    clearFieldError(name as keyof ActivityFormErrors);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMediaUpload = (media: Media) => {
    clearFieldError('media_ids');
    setUploadedMedia((prev) => [...prev, media]);
  };

  const handleMediaDelete = (mediaId: number) => {
    setUploadedMedia((prev) => prev.filter((media) => media.id !== mediaId));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validateActivityForm(formData, uploadedMedia.length);
    setErrors(nextErrors);

    if (hasActivityFormErrors(nextErrors)) {
      scrollToFirstActivityError(nextErrors);
      return;
    }

    try {
      const payload: CreateActivityData = {
        is_platform_activity: formData.is_platform_activity,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        show_on_homepage: formData.show_on_homepage,
        media_ids: uploadedMedia.map((media) => media.id),
      };

      if (!formData.is_platform_activity && formData.user_id) {
        payload.user_id = formData.user_id;
      }

      await createActivityMutation.mutateAsync(payload);
      navigate('/activities?success=' + encodeURIComponent('Activity created successfully!'));
    } catch (error: any) {
      if (error?.errors) {
        const mapped = mapApiErrorsToFormErrors(error.errors);
        if (hasActivityFormErrors(mapped)) {
          setErrors(mapped);
          scrollToFirstActivityError(mapped);
        }
      }
      setSubmitError(error?.message || 'Failed to create activity. Please try again.');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Activity"
        subtitle="Add a new activity post"
        breadcrumbs="Dashboard / Activities / Create"
        actionButton={{
          text: 'Back to Activities',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/activities'),
        }}
      />

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6">Activity Details</Typography>
                <Divider sx={{ mt: 1, mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <ActivityModeSection
                  isPlatformActivity={formData.is_platform_activity}
                  onPlatformActivityChange={(isPlatform) => {
                    clearFieldError('user_id');
                    setFormData((prev) => ({
                      ...prev,
                      is_platform_activity: isPlatform,
                      user_id: isPlatform ? null : prev.user_id,
                    }));
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {formData.is_platform_activity ? (
                  <ActivityPlatformNotice />
                ) : (
                  <ActivityUserSelect
                    userId={formData.user_id}
                    onUserIdChange={(userId) => {
                      clearFieldError('user_id');
                      setFormData((prev) => ({ ...prev, user_id: userId }));
                    }}
                    users={ownerUsers}
                    usersLoading={usersLoading}
                    error={errors.user_id}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: event.target.value as 'draft' | 'published',
                      }))
                    }
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </Select>
                  <FormHelperText>
                    Publishing may consume activity upload points from the user.
                  </FormHelperText>
                </FormControl>
                <FormControlLabel
                  sx={{ mt: 1 }}
                  control={
                    <Switch
                      checked={formData.show_on_homepage}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, show_on_homepage: event.target.checked }))
                      }
                    />
                  }
                  label="Show on Homepage"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  id="title"
                  name="title"
                  label="Title"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.title)}
                  helperText={errors.title || `${formData.title.length}/255`}
                  inputProps={{ maxLength: 255 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  id="description"
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  required
                  multiline
                  minRows={4}
                  error={Boolean(errors.description)}
                  helperText={errors.description || `${formData.description.length}/5000`}
                  inputProps={{ maxLength: 5000 }}
                />
              </Grid>

              <Grid item xs={12} id="media_ids-section">
                <Typography variant="h6">Photos</Typography>
                <Divider sx={{ mt: 1, mb: 2 }} />
                {errors.media_ids && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.media_ids}
                  </Alert>
                )}
                <MediaUpload
                  uploadedMedia={uploadedMedia}
                  onMediaUpload={handleMediaUpload}
                  onMediaDelete={handleMediaDelete}
                  maxFiles={10}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/activities')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={createActivityMutation.isPending}
                  >
                    {createActivityMutation.isPending ? 'Creating...' : 'Create Activity'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ActivityCreatePage;
