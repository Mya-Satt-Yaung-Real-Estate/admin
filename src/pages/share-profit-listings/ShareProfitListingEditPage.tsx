import React, { useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useShareProfitListing, useUpdateShareProfitListing } from '../../services/queries/shareProfitListings';
import { usePropertyTypes } from '../../services/queries/properties';
import { useRegions, useTownships } from '../../services/queries/locations';
import { MediaUpload } from '../../components/ui';
import PageHeader from '../../components/layout/PageHeader';
import { Media } from '../../types/media';
import { UpdateShareProfitListingData } from '../../types/shareProfitListing';
import {
  ShareProfitListingFormErrorField,
  ShareProfitListingFormErrors,
  hasShareProfitListingFormErrors,
  mapApiErrorsToFormErrors,
  scrollToFirstShareProfitListingError,
  validateShareProfitListingForm,
} from './shareProfitListingFormValidation';

/**
 * MUI outlined Select needs shrink + renderValue to avoid label/placeholder overlap.
 */
const emptySelectPlaceholderSx = { color: 'text.secondary' };

const WANTED_TYPE_LABELS: Record<string, string> = {
  buyer: 'Buyer',
  renter: 'Renter',
  seller: 'Seller',
  share_profit: 'Share Profit',
};

const ShareProfitListingEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const updateShareProfitListingMutation = useUpdateShareProfitListing();
  const [errors, setErrors] = React.useState<ShareProfitListingFormErrors>({});
  const [showValidationSummary, setShowValidationSummary] = React.useState(false);

  // Master data queries
  const { data: propertyTypesResponse, isLoading: propertyTypesLoading } = usePropertyTypes();
  const { data: regionsResponse, isLoading: regionsLoading } = useRegions();
  const { data: townshipsResponse } = useTownships();

  /**
   * Existing photos from API + newly uploaded ones.
   */
  const [existingMedia, setExistingMedia] = React.useState<Media[]>([]);
  const [uploadedMedia, setUploadedMedia] = React.useState<Media[]>([]);

  // Extract arrays from responses, handling both direct arrays and paginated responses
  const propertyTypes = Array.isArray(propertyTypesResponse)
    ? propertyTypesResponse
    : Array.isArray((propertyTypesResponse as any)?.data)
      ? (propertyTypesResponse as any).data
      : [];

  const regions = Array.isArray(regionsResponse)
    ? regionsResponse
    : Array.isArray((regionsResponse as any)?.data)
      ? (regionsResponse as any).data
      : [];

  const townships = Array.isArray(townshipsResponse)
    ? townshipsResponse
    : Array.isArray((townshipsResponse as any)?.data)
      ? (townshipsResponse as any).data
      : [];

  // Get the share profit listing data for the form
  const {
    data: shareProfitListingResponse,
    isLoading: shareProfitListingLoading,
    error,
  } = useShareProfitListing(slug!);

  // Form state initialized from share profit listing data
  const [formData, setFormData] = React.useState({
    wanted_type: 'share_profit',
    property_type_id: 1,
    title: '',
    description: '',
    region_id: null as number | null,
    township_id: null as number | null,
    min_budget: 0,
    max_budget: 0,
    bedrooms: 0,
    bathrooms: 0,
    min_area: 0,
    max_area: 0,
    additional_requirement: '',
    name: '',
    email: '',
    phone: '',
  });

  // Filter townships based on selected region using useMemo
  const filteredTownships = React.useMemo(() => {
    return formData.region_id
      ? townships.filter((township: any) => township.region_id === formData.region_id)
      : townships;
  }, [formData.region_id, townships]);

  const getPropertyTypeLabel = (typeId: number | string) => {
    const selectedType = propertyTypes.find((type: any) => type.id === Number(typeId));
    return selectedType ? `${selectedType.name_en} (${selectedType.name_mm})` : '';
  };

  const getRegionLabel = (regionId: number | string) => {
    const selectedRegion = regions.find((region: any) => region.id === Number(regionId));
    return selectedRegion ? `${selectedRegion.name_en} (${selectedRegion.name_mm})` : '';
  };

  const getTownshipLabel = (townshipId: number | string) => {
    const selectedTownship = townships.find((township: any) => township.id === Number(townshipId));
    return selectedTownship ? `${selectedTownship.name_en} (${selectedTownship.name_mm})` : '';
  };

  // Update form data when share profit listing data is loaded
  useEffect(() => {
    if (shareProfitListingResponse?.data) {
      const shareProfitListing = shareProfitListingResponse.data;

      setFormData({
        wanted_type: shareProfitListing.wanted_type,
        property_type_id: shareProfitListing.property_type?.id || 1,
        title: shareProfitListing.title,
        description: shareProfitListing.description,
        region_id: shareProfitListing.preferred_location?.region?.id || null,
        township_id: shareProfitListing.preferred_location?.township?.id || null,
        min_budget: shareProfitListing.budget?.min_budget ? parseInt(shareProfitListing.budget.min_budget) : 0,
        max_budget: shareProfitListing.budget?.max_budget ? parseInt(shareProfitListing.budget.max_budget) : 0,
        bedrooms: shareProfitListing.specifications?.bedrooms || 0,
        bathrooms: shareProfitListing.specifications?.bathrooms || 0,
        min_area: shareProfitListing.specifications?.min_area ? parseInt(shareProfitListing.specifications.min_area.toString()) :
                  shareProfitListing.specifications?.area_range ? parseInt(shareProfitListing.specifications.area_range.split('-')[0] || '0') : 0,
        max_area: shareProfitListing.specifications?.max_area ? parseInt(shareProfitListing.specifications.max_area.toString()) :
                  shareProfitListing.specifications?.area_range ? parseInt(shareProfitListing.specifications.area_range.split('-')[1] || '0') : 0,
        additional_requirement: shareProfitListing.additional_requirement || '',
        name: shareProfitListing.contact?.name || '',
        email: shareProfitListing.contact?.email || '',
        phone: shareProfitListing.contact?.phone || '',
      });

      const images = shareProfitListing.media?.images || [];
      setExistingMedia(
        images.map((image) => ({
          id: image.id,
          type: (image.type as 'image' | 'video') || 'image',
          filename: image.filename,
          size: 0,
          formatted_size: '',
          mime_type: '',
          is_primary: image.is_primary,
          status: (image.status as Media['status']) || 'completed',
          url: image.url || image.medium_url || image.thumbnail_url || '',
          created_at: '',
        }))
      );
      setUploadedMedia([]);
    }
  }, [shareProfitListingResponse]);

  const clearFieldError = (field: ShareProfitListingFormErrorField) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    clearFieldError(name as ShareProfitListingFormErrorField);

    if (name === 'min_budget' || name === 'max_budget' || name === 'bedrooms' || name === 'bathrooms' || name === 'min_area' || name === 'max_area') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form select changes
  const handleSelectChange = (name: string, value: string | number) => {
    clearFieldError(name as ShareProfitListingFormErrorField);

    if (name === 'region_id') {
      clearFieldError('township_id');
      setFormData({
        ...formData,
        region_id: value as number,
        township_id: null,
      });
    } else if (name === 'township_id') {
      setFormData({
        ...formData,
        township_id: value as number,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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

  const validateForm = (mediaCount: number): boolean => {
    const nextErrors = validateShareProfitListingForm(formData, mediaCount);
    setErrors(nextErrors);
    setShowValidationSummary(hasShareProfitListingFormErrors(nextErrors));

    if (hasShareProfitListingFormErrors(nextErrors)) {
      scrollToFirstShareProfitListingError(nextErrors);
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const listing = shareProfitListingResponse?.data;
    if (!listing) {
      return;
    }

    const allMedia = [...existingMedia, ...uploadedMedia];
    if (!validateForm(allMedia.length)) {
      return;
    }

    try {
      const updateData: UpdateShareProfitListingData = {
        wanted_type: formData.wanted_type,
        property_type_id: formData.property_type_id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        region_id: formData.region_id,
        township_id: formData.township_id,
        min_budget: formData.min_budget || 0,
        max_budget: formData.max_budget || 0,
        bedrooms: formData.bedrooms || 0,
        bathrooms: formData.bathrooms || 0,
        min_area: formData.min_area || 0,
        max_area: formData.max_area || 0,
        additional_requirement: formData.additional_requirement,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: (listing.status?.status as 'published' | 'draft' | 'closed') || 'published',
        media_ids: allMedia.map((media) => media.id),
      };

      await updateShareProfitListingMutation.mutateAsync({ slug: slug!, data: updateData });

      navigate(`/share-profit-listings?success=${encodeURIComponent('Share profit listing updated successfully!')}`);
    } catch (error: any) {
      console.error('Error updating share profit listing:', error);

      if (error?.errors) {
        const apiErrors = mapApiErrorsToFormErrors(error.errors);
        setErrors(apiErrors);
        setShowValidationSummary(true);
        scrollToFirstShareProfitListingError(apiErrors);
      }
    }
  };

  // Show loading state while fetching data
  if (shareProfitListingLoading || propertyTypesLoading || regionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading share profit listing...</Typography>
      </Box>
    );
  }

  // Show error if there's an error
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load share profit listing: {error.message || 'An error occurred'}
      </Alert>
    );
  }

  if (!shareProfitListingResponse?.data) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Wanting list not found
      </Alert>
    );
  }

  const shareProfitListing = shareProfitListingResponse.data;

  return (
    <Box>
      <PageHeader
        title={`Edit Share Profit Listing: ${shareProfitListing.title}`}
        breadcrumbs={`Dashboard / Share Profit Listing Management / ${shareProfitListing.title} / Edit`}
        actionButton={{
          text: 'Back to Share Profit Listing',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/share-profit-listings')
        }}
      />

      {/* Show loading state when submitting */}
      {updateShareProfitListingMutation.isPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Updating share profit listing...</Typography>
        </Box>
      )}

      {/* Show error if there's an error */}
      {updateShareProfitListingMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateShareProfitListingMutation.error?.message || 'An error occurred while updating the share profit listing.'}
        </Alert>
      )}

      {!updateShareProfitListingMutation.isPending && (
        <form onSubmit={handleSubmit} noValidate>
          {showValidationSummary && hasShareProfitListingFormErrors(errors) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Please fix the highlighted fields below.
            </Alert>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" required error={Boolean(errors.wanted_type)}>
                    <InputLabel id="wanted-type-label" shrink>
                      Listing Type
                    </InputLabel>
                    <Select
                      labelId="wanted-type-label"
                      id="wanted_type"
                      name="wanted_type"
                      value={formData.wanted_type}
                      onChange={(e) => handleSelectChange('wanted_type', e.target.value)}
                      label="Listing Type"
                      error={Boolean(errors.wanted_type)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Box component="span" sx={emptySelectPlaceholderSx}>
                              Select listing type
                            </Box>
                          );
                        }

                        return WANTED_TYPE_LABELS[selected] || selected;
                      }}
                    >
                      <MenuItem value="buyer">Buyer</MenuItem>
                      <MenuItem value="renter">Renter</MenuItem>
                      <MenuItem value="seller">Seller</MenuItem>
                      <MenuItem value="share_profit">Share Profit</MenuItem>
                    </Select>
                    {errors.wanted_type && (
                      <FormHelperText error>{errors.wanted_type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" required error={Boolean(errors.property_type_id)}>
                    <InputLabel id="property-type-label" shrink>
                      Property Type
                    </InputLabel>
                    <Select
                      labelId="property-type-label"
                      id="property_type_id"
                      name="property_type_id"
                      value={formData.property_type_id || ''}
                      onChange={(e) => handleSelectChange('property_type_id', Number(e.target.value))}
                      label="Property Type"
                      error={Boolean(errors.property_type_id)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Box component="span" sx={emptySelectPlaceholderSx}>
                              Select property type
                            </Box>
                          );
                        }

                        return getPropertyTypeLabel(selected);
                      }}
                    >
                      {propertyTypes?.map((type: any) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name_en} ({type.name_mm})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.property_type_id && (
                      <FormHelperText error>{errors.property_type_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="title"
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.title)}
                    helperText={errors.title}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Location Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" required error={Boolean(errors.region_id)}>
                    <InputLabel id="region-label" shrink>
                      Region
                    </InputLabel>
                    <Select
                      labelId="region-label"
                      id="region_id"
                      name="region_id"
                      value={formData.region_id || ''}
                      onChange={(e) => handleSelectChange('region_id', Number(e.target.value))}
                      label="Region"
                      error={Boolean(errors.region_id)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Box component="span" sx={emptySelectPlaceholderSx}>
                              Select region
                            </Box>
                          );
                        }

                        return getRegionLabel(selected);
                      }}
                    >
                      {regions?.map((region: any) => (
                        <MenuItem key={region.id} value={region.id}>
                          {region.name_en} ({region.name_mm})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.region_id && (
                      <FormHelperText error>{errors.region_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" required error={Boolean(errors.township_id)}>
                    <InputLabel id="township-label" shrink>
                      Township
                    </InputLabel>
                    <Select
                      labelId="township-label"
                      id="township_id"
                      name="township_id"
                      value={formData.township_id || ''}
                      onChange={(e) => handleSelectChange('township_id', Number(e.target.value))}
                      label="Township"
                      disabled={!formData.region_id}
                      error={Boolean(errors.township_id)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Box component="span" sx={emptySelectPlaceholderSx}>
                              {formData.region_id ? 'Select township' : 'Select region first'}
                            </Box>
                          );
                        }

                        return getTownshipLabel(selected);
                      }}
                    >
                      {filteredTownships?.map((township: any) => (
                        <MenuItem key={township.id} value={township.id}>
                          {township.name_en} ({township.name_mm})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.township_id && (
                      <FormHelperText error>{errors.township_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Property Requirements
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="min_budget"
                    label="Min Budget"
                    name="min_budget"
                    value={formData.min_budget}
                    onChange={handleChange}
                    type="number"
                    required
                    error={Boolean(errors.min_budget)}
                    helperText={errors.min_budget}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="max_budget"
                    label="Max Budget"
                    name="max_budget"
                    value={formData.max_budget}
                    onChange={handleChange}
                    type="number"
                    required
                    error={Boolean(errors.max_budget)}
                    helperText={errors.max_budget}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Min Area (sqft)"
                    name="min_area"
                    value={formData.min_area || ''}
                    onChange={handleChange}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Area (sqft)"
                    name="max_area"
                    value={formData.max_area || ''}
                    onChange={handleChange}
                    type="number"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Additional Requirements
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Requirements"
                    name="additional_requirement"
                    value={formData.additional_requirement}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box id="media_ids-section">
                <Typography variant="h6" gutterBottom>
                  Photos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  At least one photo is required.
                </Typography>
                <MediaUpload
                  uploadedMedia={[...existingMedia, ...uploadedMedia]}
                  onMediaUpload={handleMediaUpload}
                  onMediaDelete={handleMediaDelete}
                  maxFiles={10}
                />
                {errors.media_ids && (
                  <FormHelperText error sx={{ mt: 1, mx: 0 }}>
                    {errors.media_ids}
                  </FormHelperText>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.phone)}
                    helperText={errors.phone}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/share-profit-listings')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<EditIcon />}
                  disabled={updateShareProfitListingMutation.isPending}
                >
                  {updateShareProfitListingMutation.isPending ? 'Updating...' : 'Update Share Profit Listing'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </form>
      )}
    </Box>
  );
};

export default ShareProfitListingEditPage;