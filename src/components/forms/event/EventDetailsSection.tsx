import React from 'react';
import {
  Grid,
  TextField,
  Autocomplete,
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
} from '@mui/material';

interface EventDetailsSectionProps {
  values: {
    housing_event_category_id: number;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    region_id: number | undefined;
    township_id: number | undefined;
  };
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  handleBlur: (event: React.FocusEvent<any>) => void;
  categories: any[];
  categoriesLoading?: boolean;
  regions: any[];
  townships: any[];
  regionsLoading?: boolean;
  townshipsLoading?: boolean;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  tagsLabel?: string;
}

export const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  categories,
  categoriesLoading = false,
  regions,
  townships,
  regionsLoading = false,
  townshipsLoading = false,
  tags = [],
  onTagsChange,
  tagsLabel = "Event Tags",
}) => {
  // Filter townships based on selected region
  const filteredTownships = values.region_id 
    ? townships.filter(township => township.region_id === values.region_id)
    : townships;

  const [tagInput, setTagInput] = React.useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && onTagsChange) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (onTagsChange) {
      onTagsChange(tags.filter(tag => tag !== tagToRemove));
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Event Details
        </Typography>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

        <Grid container spacing={2}>
          {/* Event Category */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              size="small"
              options={categories}
              getOptionLabel={(option) => option.name_en}
              value={categories.find(cat => cat.id === values.housing_event_category_id) || null}
              onChange={(_, newValue) => {
                handleChange({
                  target: { name: 'housing_event_category_id', value: newValue?.id || 0 }
                } as any);
              }}
              loading={categoriesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <span>
                      Event Category <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                    </span>
                  }
                  error={touched.housing_event_category_id && Boolean(errors.housing_event_category_id)}
                  helperText={touched.housing_event_category_id && errors.housing_event_category_id}
                />
              )}
            />
          </Grid>

          {/* Event Date */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              size="small"
              label={
                <span>
                  Event Date <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                </span>
              }
              name="date"
              value={values.date}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.date && Boolean(errors.date)}
              helperText={touched.date && errors.date}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Start Time */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="time"
              size="small"
              label={
                <span>
                  Start Time <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                </span>
              }
              name="start_time"
              value={values.start_time}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.start_time && Boolean(errors.start_time)}
              helperText={touched.start_time && errors.start_time}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* End Time */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="time"
              size="small"
              label={
                <span>
                  End Time <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                </span>
              }
              name="end_time"
              value={values.end_time}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.end_time && Boolean(errors.end_time)}
              helperText={touched.end_time && errors.end_time}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Location (optional)"
              name="location"
              value={values.location}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.location && Boolean(errors.location)}
              helperText={touched.location && errors.location}
            />
          </Grid>

          {/* Region */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              size="small"
              options={regions}
              getOptionLabel={(option) => `${option.name_en} (${option.name_mm})`}
              value={regions.find(region => region.id === values.region_id) || null}
              onChange={(_, newValue) => {
                handleChange({
                  target: { name: 'region_id', value: newValue?.id }
                } as any);
                // Reset township when region changes
                handleChange({
                  target: { name: 'township_id', value: undefined }
                } as any);
              }}
              loading={regionsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Region (optional)"
                  error={touched.region_id && Boolean(errors.region_id)}
                  helperText={touched.region_id && errors.region_id}
                />
              )}
            />
          </Grid>

          {/* Township */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              size="small"
              options={filteredTownships}
              getOptionLabel={(option) => `${option.name_en} (${option.name_mm})`}
              value={filteredTownships.find(township => township.id === values.township_id) || null}
              onChange={(_, newValue) => {
                handleChange({
                  target: { name: 'township_id', value: newValue?.id }
                } as any);
              }}
              loading={townshipsLoading}
              disabled={!values.region_id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Township (optional)"
                  error={touched.township_id && Boolean(errors.township_id)}
                  helperText={touched.township_id && errors.township_id}
                />
              )}
            />
          </Grid>

          {/* Event Tags */}
          <Grid item xs={12}>
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
              {tagsLabel} <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    '& .MuiChip-deleteIcon': {
                      color: 'red',
                      fontSize: '18px',
                      '&:hover': {
                        color: 'darkred',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                      },
                    },
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
