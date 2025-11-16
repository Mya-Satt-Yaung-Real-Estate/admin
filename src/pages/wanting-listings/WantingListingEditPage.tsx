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
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useWantingList, useUpdateWantingList } from '../../services/queries/wantingListings';
import { usePropertyTypes } from '../../services/queries/properties';
import { useRegions, useTownships } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';

const WantingListingEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const updateWantingListMutation = useUpdateWantingList();

  // Master data queries
  const { data: propertyTypesResponse, isLoading: propertyTypesLoading } = usePropertyTypes();
  const { data: regionsResponse, isLoading: regionsLoading } = useRegions();
  const { data: townshipsResponse } = useTownships();

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

  // Get the wanting list data for the form
  const {
    data: wantingListResponse,
    isLoading: wantingListLoading,
    error,
  } = useWantingList(slug!);

  // Form state initialized from wanting list data
  const [formData, setFormData] = React.useState({
    wanted_type: 'buyer',
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

  // Update form data when wanting list data is loaded
  useEffect(() => {
    if (wantingListResponse?.data) {
      const wantingList = wantingListResponse.data;

      setFormData({
        wanted_type: wantingList.wanted_type,
        property_type_id: wantingList.property_type?.id || 1,
        title: wantingList.title,
        description: wantingList.description,
        region_id: wantingList.preferred_location?.region?.id || null,
        township_id: wantingList.preferred_location?.township?.id || null,
        min_budget: wantingList.budget?.min_budget ? parseInt(wantingList.budget.min_budget) : 0,
        max_budget: wantingList.budget?.max_budget ? parseInt(wantingList.budget.max_budget) : 0,
        bedrooms: wantingList.specifications?.bedrooms || 0,
        bathrooms: wantingList.specifications?.bathrooms || 0,
        min_area: wantingList.specifications?.min_area ? parseInt(wantingList.specifications.min_area.toString()) :
                  wantingList.specifications?.area_range ? parseInt(wantingList.specifications.area_range.split('-')[0] || '0') : 0,
        max_area: wantingList.specifications?.max_area ? parseInt(wantingList.specifications.max_area.toString()) :
                  wantingList.specifications?.area_range ? parseInt(wantingList.specifications.area_range.split('-')[1] || '0') : 0,
        additional_requirement: wantingList.additional_requirement || '',
        name: wantingList.contact?.name || '',
        email: wantingList.contact?.email || '',
        phone: wantingList.contact?.phone || '',
      });
    }
  }, [wantingListResponse]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Convert to appropriate type based on field name
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
    setFormData({
      ...formData,
      [name]: value === '' ? null : value,
    });
  };


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare data for API - convert to proper format
      const updateData = {
        wanted_type: formData.wanted_type,
        property_type_id: formData.property_type_id,
        title: formData.title,
        description: formData.description,
        region_id: formData.region_id,
        township_id: formData.township_id,
        min_budget: formData.min_budget || 0,
        max_budget: formData.max_budget || 0,
        bedrooms: formData.bedrooms || 0,
        bathrooms: formData.bathrooms || 0,
        min_area: formData.min_area || 0,
        max_area: formData.max_area || 0,
        additional_requirement: formData.additional_requirement,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // Keep the same status as the original wanting list
        status: wantingListing.status?.status as 'published' | 'draft' | 'closed' || 'published',
      };

      // Call the update mutation with the current form data
      await updateWantingListMutation.mutateAsync({ slug: slug!, data: updateData });

      // Navigate back to the wanting lists list page with success message
      navigate(`/wanting-listings?success=${encodeURIComponent('Wanting list updated successfully!')}`);
    } catch (error: any) {
      console.error('Error updating wanting list:', error);
      // Error handling is done by the mutation itself
    }
  };

  // Show loading state while fetching data
  if (wantingListLoading || propertyTypesLoading || regionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading wanting list...</Typography>
      </Box>
    );
  }

  // Show error if there's an error
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load wanting list: {error.message || 'An error occurred'}
      </Alert>
    );
  }

  if (!wantingListResponse?.data) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Wanting list not found
      </Alert>
    );
  }

  const wantingListing = wantingListResponse.data;

  return (
    <Box>
      <PageHeader
        title={`Edit Wanting List: ${wantingListing.title}`}
        breadcrumbs={`Dashboard / Wanting List Management / ${wantingListing.title} / Edit`}
        actionButton={{
          text: 'Back to Wanting List',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/wanting-listings')
        }}
      />

      {/* Show loading state when submitting */}
      {updateWantingListMutation.isPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Updating wanting list...</Typography>
        </Box>
      )}

      {/* Show error if there's an error */}
      {updateWantingListMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateWantingListMutation.error?.message || 'An error occurred while updating the wanting list.'}
        </Alert>
      )}

      {!updateWantingListMutation.isPending && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel id="wanted-type-label">Wanting Type</InputLabel>
                    <Select
                      labelId="wanted-type-label"
                      id="wanted_type"
                      name="wanted_type"
                      value={formData.wanted_type}
                      onChange={(e) => handleSelectChange('wanted_type', e.target.value)}
                      label="Wanting Type"
                    >
                      <MenuItem value="buyer">Buyer</MenuItem>
                      <MenuItem value="renter">Renter</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel id="property-type-label">Property Type</InputLabel>
                    <Select
                      labelId="property-type-label"
                      id="property_type_id"
                      name="property_type_id"
                      value={formData.property_type_id || ''}
                      onChange={(e) => handleSelectChange('property_type_id', Number(e.target.value))}
                      label="Property Type"
                    >
                      {propertyTypes?.map((type: any) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name_en} ({type.name_mm})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Location Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel id="region-label">Region</InputLabel>
                    <Select
                      labelId="region-label"
                      id="region_id"
                      name="region_id"
                      value={formData.region_id || ''}
                      onChange={(e) => handleSelectChange('region_id', Number(e.target.value))}
                      label="Region"
                    >
                      {regions?.map((region: any) => (
                        <MenuItem key={region.id} value={region.id}>
                          {region.name_en} ({region.name_mm})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel id="township-label">Township</InputLabel>
                    <Select
                      labelId="township-label"
                      id="township_id"
                      name="township_id"
                      value={formData.township_id || ''}
                      onChange={(e) => handleSelectChange('township_id', Number(e.target.value))}
                      label="Township"
                    >
                      {filteredTownships?.map((township: any) => (
                        <MenuItem key={township.id} value={township.id}>
                          {township.name_en} ({township.name_mm})
                        </MenuItem>
                      ))}
                    </Select>
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
                    label="Min Budget"
                    name="min_budget"
                    value={formData.min_budget}
                    onChange={handleChange}
                    type="number"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Budget"
                    name="max_budget"
                    value={formData.max_budget}
                    onChange={handleChange}
                    type="number"
                    required
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

              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/wanting-listings')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<EditIcon />}
                  disabled={updateWantingListMutation.isPending}
                >
                  {updateWantingListMutation.isPending ? 'Updating...' : 'Update Wanting List'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </form>
      )}
    </Box>
  );
};

export default WantingListingEditPage;