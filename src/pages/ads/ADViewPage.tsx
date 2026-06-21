import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Divider,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Link as LinkIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, LoadingSpinner, PageErrorState } from '../../components/ui';
import { formatDate } from '../../constants/dateFormats';
import { useAD } from '../../services/queries/ad';
import { AD, adRequiresCompanyUser, getAdCompanyColumnInfo } from '../../types/ad';
import { useAlertSystem } from '../../hooks/useAlertSystem';

const ADViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { alert, clearAlert } = useAlertSystem();

  // Fetch AD data by id
  const { data: adResponse, isLoading, error, refetch } = useAD(id || '');

  const ad: AD | undefined = adResponse?.data;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <PageErrorState
        error={error}
        onRetry={refetch}
      />
    );
  }

  if (!ad) {
    return <PageErrorState error={new Error('AD not found')} onRetry={refetch} />;
  }

  // Helper function to get image URL from different possible sources
  const getImageUrl = (ad: AD): string | undefined => {
    // Priority order: images.url (current API format) > media.url > image array > image object > image_url
    // Check for images (singular object) - current API response format
    if ((ad as any).images && typeof (ad as any).images === 'object' && !Array.isArray((ad as any).images)) {
      return (ad as any).images.url;
    }

    // Check for media.url
    if (ad.media?.url) {
      return ad.media.url;
    }

    // Handle case where API returns image as array
    if ((ad as any).image && Array.isArray((ad as any).image) && (ad as any).image.length > 0) {
      const primaryImage = (ad as any).image.find((img: any) => img.is_primary);
      const imageToUse = primaryImage || (ad as any).image[0];
      return imageToUse?.url;
    }

    // Handle case where API returns single image object instead of array
    if ((ad as any).image && typeof (ad as any).image === 'object' && (ad as any).image.url) {
      return (ad as any).image.url;
    }

    // Fallback to image_url property if available
    if ((ad as any).image_url) {
      return (ad as any).image_url;
    }

    return undefined;
  };

  // Helper function to get image filename from different possible sources
  const getImageFilename = (ad: AD): string | undefined => {
    // Check for images (singular object) - current API response format
    if ((ad as any).images && typeof (ad as any).images === 'object' && !Array.isArray((ad as any).images)) {
      return (ad as any).images.filename;
    }

    if (ad.media?.filename) {
      return ad.media.filename;
    }

    // Handle case where API returns image as array
    if ((ad as any).image && Array.isArray((ad as any).image) && (ad as any).image.length > 0) {
      const primaryImage = (ad as any).image.find((img: any) => img.is_primary);
      const imageToUse = primaryImage || (ad as any).image[0];
      return imageToUse?.filename;
    }

    // Handle case where API returns single image object instead of array
    if ((ad as any).image && typeof (ad as any).image === 'object' && (ad as any).image.filename) {
      return (ad as any).image.filename;
    }

    // If no specific filename found, return generic name
    return 'AD Image';
  };

  // Helper function to get image size from different possible sources
  const getImageSize = (ad: AD): string | null => {
    const normalizeSizeLabel = (value?: string | null): string | null => {
      const label = value?.trim();
      if (!label) {
        return null;
      }
      const normalized = label.toUpperCase();
      if (normalized === 'N/A' || normalized === 'UNKNOWN') {
        return null;
      }
      return label;
    };

    // Check for images (singular object) - current API response format
    if ((ad as any).images && typeof (ad as any).images === 'object' && !Array.isArray((ad as any).images)) {
      const images = (ad as any).images;
      if (images.size) {
        return `${Math.round(images.size / 1024)} KB`;
      }
      const formattedSize = normalizeSizeLabel(images.formatted_size);
      if (formattedSize) {
        return formattedSize;
      }
    }

    if (ad.media?.size) {
      return `${Math.round(ad.media.size / 1024)} KB`;
    }

    // Handle case where API returns image as array
    if ((ad as any).image && Array.isArray((ad as any).image) && (ad as any).image.length > 0) {
      const primaryImage = (ad as any).image.find((img: any) => img.is_primary);
      const imageToUse = primaryImage || (ad as any).image[0];
      if (imageToUse?.size) {
        return `${Math.round(imageToUse.size / 1024)} KB`;
      }
      const formattedSize = normalizeSizeLabel(imageToUse?.formatted_size);
      if (formattedSize) {
        return formattedSize;
      }
    }

    // Handle case where API returns single image object instead of array
    if ((ad as any).image && typeof (ad as any).image === 'object' && (ad as any).image.size) {
      return `${Math.round((ad as any).image.size / 1024)} KB`;
    }

    // Handle formatted_size if available
    const mediaFormattedSize = normalizeSizeLabel((ad.media as any)?.formatted_size);
    if (mediaFormattedSize) {
      return mediaFormattedSize;
    }

    if ((ad as any).image && typeof (ad as any).image === 'object') {
      const formattedSize = normalizeSizeLabel((ad as any).image.formatted_size);
      if (formattedSize) {
        return formattedSize;
      }
    }

    return null;
  };

  const getImageCaption = (ad: AD): string => {
    const filename = getImageFilename(ad) || 'AD Image';
    const sizeLabel = getImageSize(ad);
    return sizeLabel ? `${filename} (${sizeLabel})` : filename;
  };


  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={`AD Details: ${ad.title_en || 'Untitled'}`}
        subtitle={ad.title_mm || ''}
        breadcrumbs={`Dashboard / ADs / All ADs / ${ad.title_en || 'Untitled'}`}
        actionButton={{
          text: 'Back to ADs',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/ads'),
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Grid container spacing={3}>
        {/* Primary Information Card */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader 
              title="AD Information" 
              avatar={
                <Avatar sx={{ backgroundColor: theme.palette.primary.main }}>
                  <BusinessIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Titles
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        English Title
                      </Typography>
                      <Typography variant="body1">
                        {ad.title_en || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Myanmar Title
                      </Typography>
                      <Typography variant="body1">
                        {ad.title_mm || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Descriptions
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        English Description
                      </Typography>
                      <Typography variant="body1">
                        {ad.description_en || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Myanmar Description
                      </Typography>
                      <Typography variant="body1">
                        {ad.description_mm || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Link Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {ad.link && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Link
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinkIcon sx={{ mr: 1, fontSize: 16, color: 'action.active' }} />
                          <Typography variant="body1" component="a" href={ad.link} target="_blank" color="primary">
                            {ad.link}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {ad.link_type && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Link Type
                        </Typography>
                        <Typography variant="body1">
                          {ad.link_type.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Grid>
                    )}
                    {ad.link_text && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Link Text
                        </Typography>
                        <Typography variant="body1">
                          {ad.link_text}
                        </Typography>
                      </Grid>
                    )}
                    {ad.text_color_code && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Text Color Code
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '4px',
                              backgroundColor: ad.text_color_code,
                              border: '1px solid #ccc',
                            }}
                          />
                          <Typography variant="body1">
                            {ad.text_color_code}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    AD Image
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {getImageUrl(ad) ? (
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <img
                        src={getImageUrl(ad)}
                        alt={ad.title_en || 'AD Image'}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', getImageUrl(ad));
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {getImageCaption(ad)}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3, border: '1px dashed #ccc', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        No image uploaded for this AD
                      </Typography>
                    </Box>
                  )}
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Status and Metadata Card */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader 
              title="Status & Metadata" 
              avatar={
                <Avatar sx={{ backgroundColor: theme.palette.secondary.main }}>
                  <VisibilityIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={ad.status ? 'Active' : 'Inactive'}
                    color={ad.status ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Display Location
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {ad.display_location === 'detail-page-asidebar' ? 'Detail Page Sidebar 1' :
                     ad.display_location === 'detail-page-asidebar-2' ? 'Detail Page Sidebar 2' :
                     ad.display_location === 'home-page-asidebar' ? 'Home page Main Slider' :
                     ad.display_location === 'homepage_block' ? 'Homepage Block' :
                     ad.display_location === 'home_grid_ads' ? 'Home Grid ADS' :
                     String(ad.display_location).replace('-', ' ')}
                  </Typography>
                </Grid>

                {ad.display_location === 'home_grid_ads' && ad.grid_index != null && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Grid Slot
                    </Typography>
                    <Typography variant="body1">
                      Grid {ad.grid_index}
                    </Typography>
                  </Grid>
                )}

                {adRequiresCompanyUser(ad.display_location) && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Company User
                    </Typography>
                    {ad.user && ad.user.user_type === 'company' ? (
                      <Grid container spacing={1.5}>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">
                            User Name
                          </Typography>
                          <Typography variant="body2">{ad.user.name}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">
                            Company Name
                          </Typography>
                          <Typography variant="body2">
                            {ad.user.company_name ?? ad.user.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">
                            Phone
                          </Typography>
                          <Typography variant="body2">
                            {getAdCompanyColumnInfo(ad)?.phone ?? '—'}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No company user assigned
                      </Typography>
                    )}
                  </Grid>
                )}

                {ad.start_at && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Start Date
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'action.active' }} />
                      <Typography variant="body1">
                        {formatDate(ad.start_at, 'display')}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {ad.end_at && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      End Date
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'action.active' }} />
                      <Typography variant="body1">
                        {formatDate(ad.end_at, 'display')}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Media Information Card */}
          {ad.media && (
            <Card sx={{ mt: 3 }}>
              <CardHeader 
                title="Media Information" 
                avatar={
                  <Avatar sx={{ backgroundColor: theme.palette.warning.main }}>
                    <LocationIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Media ID
                    </Typography>
                    <Typography variant="body1">
                      {ad.media.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Filename
                    </Typography>
                    <Typography variant="body1">
                      {ad.media.filename}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Type
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'uppercase' }}>
                      {ad.media.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      URL
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {ad.media.url}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ADViewPage;