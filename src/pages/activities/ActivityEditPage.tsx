import React, { useEffect, useMemo, useState } from 'react';
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
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { MediaUpload, PageErrorState, PageLoadingState } from '../../components/ui';
import {
  ActivityModeSection,
  ActivityPlatformNotice,
  ActivityUserSelect,
} from '../../components/forms/activity/ActivityModeSection';
import { useActivity, useUpdateActivity } from '../../services/queries/activities';
import { useUsers } from '../../services/queries/users';
import { Media } from '../../types/media';
import { MEMBER_LEVELS, MemberLevel } from '../../constants/memberLevels';
import { RegularUser } from '../../types/user';
import type { UpdateActivityData } from '../../types/activity';
import {
  ActivityFormErrors,
  hasActivityFormErrors,
  mapApiErrorsToFormErrors,
  scrollToFirstActivityError,
  validateActivityForm,
} from './activityFormValidation';

const ActivityEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const updateActivityMutation = useUpdateActivity();
  const [errors, setErrors] = useState<ActivityFormErrors>({});
  const [existingMedia, setExistingMedia] = useState<Media[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    status: 'active',
    per_page: 100,
  });

  const { data: activityResponse, isLoading, error } = useActivity(slug || '');
  const activity = activityResponse?.data;

  const [formData, setFormData] = useState({
    is_platform_activity: true,
    user_id: null as number | null,
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published',
    show_on_homepage: false,
  });

  const ownerUsers = useMemo(() => {
    const rawUsers: RegularUser[] = Array.isArray((usersResponse as any)?.data)
      ? (usersResponse as any).data
      : Array.isArray(usersResponse)
        ? (usersResponse as RegularUser[])
        : [];

    const filtered = rawUsers.filter(
      (user) => user.user_type === 'individual' || user.user_type === 'company'
    );

    const currentOwnerId = activity?.user?.id;
    if (currentOwnerId && activity?.user && !filtered.some((user) => user.id === currentOwnerId)) {
      filtered.unshift({
        id: activity.user.id,
        name: activity.user.name,
        slug: '',
        email: activity.user.email || '',
        phone: activity.user.phone || '',
        user_type: (activity.user.user_type as RegularUser['user_type']) || 'individual',
        member_level: (activity.user.member_level as MemberLevel) || MEMBER_LEVELS.BASIC,
        is_active: true,
        created_at: '',
        updated_at: '',
        property_count: 0,
        point_balance: 0,
        total_points_allocated: 0,
        total_points_consumed: 0,
        point_packages_count: 0,
      });
    }

    return filtered;
  }, [usersResponse, activity]);

  useEffect(() => {
    if (!activity) return;

    const isPlatformActivity = activity.user?.user_type === 'admin';

    setFormData({
      is_platform_activity: isPlatformActivity,
      user_id: isPlatformActivity ? null : (activity.user_id ?? activity.user?.id ?? null),
      title: activity.title || '',
      description: activity.description || '',
      status: activity.status || 'draft',
      show_on_homepage: Boolean(activity.show_on_homepage),
    });

    const images = activity.media?.images || [];
    setExistingMedia(
      images.map((image) => ({
        id: image.id,
        type: (image.type as 'image' | 'video') || 'image',
        filename: image.filename,
        size: 0,
        formatted_size: '',
        mime_type: '',
        is_primary: Boolean(image.is_primary),
        status: (image.status as Media['status']) || 'completed',
        url: image.url || image.medium_url || image.thumbnail_url || '',
        created_at: '',
      }))
    );
    setUploadedMedia([]);
  }, [activity]);

  const allMedia = [...existingMedia, ...uploadedMedia];

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
    if (existingMedia.some((media) => media.id === mediaId)) {
      setExistingMedia((prev) => prev.filter((media) => media.id !== mediaId));
      return;
    }
    setUploadedMedia((prev) => prev.filter((media) => media.id !== mediaId));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!slug) return;
    setSubmitError(null);

    const nextErrors = validateActivityForm(formData, allMedia.length);
    setErrors(nextErrors);

    if (hasActivityFormErrors(nextErrors)) {
      scrollToFirstActivityError(nextErrors);
      return;
    }

    try {
      const payload: UpdateActivityData = {
        is_platform_activity: formData.is_platform_activity,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        show_on_homepage: formData.show_on_homepage,
        media_ids: allMedia.map((media) => media.id),
      };

      if (!formData.is_platform_activity && formData.user_id) {
        payload.user_id = formData.user_id;
      }

      const response = await updateActivityMutation.mutateAsync({ slug, data: payload });
      const nextSlug = response.data?.slug || slug;
      navigate(`/activities/${nextSlug}?success=` + encodeURIComponent('Activity updated successfully!'));
    } catch (error: any) {
      if (error?.errors) {
        const mapped = mapApiErrorsToFormErrors(error.errors);
        if (hasActivityFormErrors(mapped)) {
          setErrors(mapped);
          scrollToFirstActivityError(mapped);
        }
      }
      setSubmitError(error?.message || 'Failed to update activity. Please try again.');
    }
  };

  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={() => window.location.reload()} />;
  if (!activity) {
    return (
      <PageErrorState
        error={new Error('Activity not found')}
        title="Activity not found"
        message="The activity you are trying to edit does not exist."
        onRetry={() => navigate('/activities')}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit Activity"
        subtitle={activity.title}
        breadcrumbs="Dashboard / Activities / Edit"
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
                    Changing from draft to published may consume activity upload points.
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
                  uploadedMedia={allMedia}
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
                    onClick={() => navigate(`/activities/${slug}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={updateActivityMutation.isPending}
                  >
                    {updateActivityMutation.isPending ? 'Saving...' : 'Save Changes'}
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

export default ActivityEditPage;
