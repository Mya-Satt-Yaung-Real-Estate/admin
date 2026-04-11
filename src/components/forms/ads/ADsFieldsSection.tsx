import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Switch,
  FormControlLabel,
  Box,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';

interface ADsFieldsSectionProps {
  values: {
    title_en: string | null;
    title_mm: string | null;
    description_en: string | null;
    description_mm: string | null;
    link: string | null;
    link_type: string | null;
    link_text?: string | null;
    text_color_code?: string | null;
    price?: number;
    status: boolean;
    is_paid: boolean;
    is_published: boolean;
    display_location: string;
    grid_index?: number | null;
    payment_date?: string | null;
    start_at?: string;
    end_at?: string;
    media_id: number;
  };
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

export const ADsFieldsSection: React.FC<ADsFieldsSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}) => {
  return (
    <FormSection title="AD Information">
      <Grid container spacing={2}>
        {/* English Title */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            id="title_en"
            name="title_en"
            label="Title (English)"
            value={values.title_en || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.title_en && Boolean(errors.title_en)}
            helperText={touched.title_en ? errors.title_en : ''}
            placeholder="Enter English title"
          />
        </Grid>

        {/* Myanmar Title */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            id="title_mm"
            name="title_mm"
            label="Title (Myanmar)"
            value={values.title_mm || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.title_mm && Boolean(errors.title_mm)}
            helperText={touched.title_mm ? errors.title_mm : ''}
            placeholder="မြန်မာဘာသာ ခေါင်းစီးးတာ"
          />
        </Grid>

        {/* English Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            id="description_en"
            name="description_en"
            label="Description (English)"
            value={values.description_en || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description_en && Boolean(errors.description_en)}
            helperText={touched.description_en ? errors.description_en : ''}
            placeholder="Enter English description"
            multiline
            rows={3}
          />
        </Grid>

        {/* Myanmar Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            id="description_mm"
            name="description_mm"
            label="Description (Myanmar)"
            value={values.description_mm || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description_mm && Boolean(errors.description_mm)}
            helperText={touched.description_mm ? errors.description_mm : ''}
            placeholder="မြန်မာဘာသာ ဖော်ပြချက်"
            multiline
            rows={3}
          />
        </Grid>

        {/* Link */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            id="link"
            name="link"
            label="Link"
            value={values.link || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.link && Boolean(errors.link)}
            helperText={touched.link ? errors.link : ''}
            placeholder="https://example.com"
          />
        </Grid>

        {/* Link Type */}
        <Grid item xs={12} sm={6}>
          <FormControl
            fullWidth
            variant="outlined"
            error={touched.link_type && Boolean(errors.link_type)}
          >
            <InputLabel id="link-type-label">Link Type</InputLabel>
            <Select
              labelId="link-type-label"
              id="link_type"
              name="link_type"
              value={values.link_type || ''}
              onChange={(e) => setFieldValue('link_type', e.target.value)}
              onBlur={handleBlur}
              label="Link Type"
            >
              <MenuItem value="button_link">Button Link</MenuItem>
              <MenuItem value="text_link">Text Link</MenuItem>
              <MenuItem value="image_link">Image Link</MenuItem>
            </Select>
            {touched.link_type && errors.link_type && (
              <FormHelperText>{errors.link_type}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Link Text (required for button and text links) */}
        {(values.link_type === 'button_link' || values.link_type === 'text_link') && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              id="link_text"
              name="link_text"
              label="Link Text *"
              value={values.link_text || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.link_text && Boolean(errors.link_text)}
              helperText={touched.link_text ? errors.link_text : ''}
              placeholder="Explore Now"
            />
          </Grid>
        )}

        {/* Text Color Code */}
        {(values.link_type === 'button_link' || values.link_type === 'text_link') && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              id="text_color_code"
              name="text_color_code"
              label="Text Color Code"
              value={values.text_color_code || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.text_color_code && Boolean(errors.text_color_code)}
              helperText={touched.text_color_code ? errors.text_color_code : 'Hex color code (e.g., #000000)'}
              placeholder="#000000"
              InputProps={{
                startAdornment: values.text_color_code ? (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '4px',
                      backgroundColor: values.text_color_code,
                      border: '1px solid #ccc',
                      mr: 1,
                    }}
                  />
                ) : null,
              }}
            />
          </Grid>
        )}

        {/* Price */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            id="price"
            name="price"
            label="Price"
            type="number"
            value={values.price || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.price && Boolean(errors.price)}
            helperText={touched.price ? errors.price : ''}
            InputProps={{
              inputProps: { min: 0 }
            }}
            placeholder="0.00"
          />
        </Grid>

        {/* Display Location */}
        <Grid item xs={12} sm={6}>
          <FormControl
            fullWidth
            variant="outlined"
            error={touched.display_location && Boolean(errors.display_location)}
          >
            <InputLabel id="display-location-label">Display Location *</InputLabel>
            <Select
              labelId="display-location-label"
              id="display_location"
              name="display_location"
              value={values.display_location}
              onChange={(e) => {
                const v = e.target.value;
                setFieldValue('display_location', v);
                if (v !== 'home_grid_ads') {
                  setFieldValue('grid_index', null);
                } else if (values.grid_index == null) {
                  setFieldValue('grid_index', 1);
                }
              }}
              onBlur={handleBlur}
              label="Display Location *"
            >
              <MenuItem value="homepage_block">Homepage Block</MenuItem>
              <MenuItem value="home-page-asidebar">Home Page Sidebar</MenuItem>
              <MenuItem value="detail-page-asidebar">Detail Page Sidebar</MenuItem>
              <MenuItem value="home_grid_ads">Home Grid ADS</MenuItem>
            </Select>
            {touched.display_location && errors.display_location && (
              <FormHelperText>{errors.display_location}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {values.display_location === 'home_grid_ads' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" error={touched.grid_index && Boolean(errors.grid_index)}>
              <InputLabel id="grid_index-label">Grid slot *</InputLabel>
              <Select
                labelId="grid_index-label"
                id="grid_index"
                name="grid_index"
                value={values.grid_index ?? ''}
                onChange={(e) => {
                  const n = e.target.value === '' ? null : Number(e.target.value);
                  setFieldValue('grid_index', n);
                }}
                onBlur={handleBlur}
                label="Grid slot *"
              >
                <MenuItem value={1}>Grid 1</MenuItem>
                <MenuItem value={2}>Grid 2</MenuItem>
                <MenuItem value={3}>Grid 3</MenuItem>
                <MenuItem value={4}>Grid 4</MenuItem>
              </Select>
              {touched.grid_index && errors.grid_index && (
                <FormHelperText>{errors.grid_index}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        )}

        {/* Media ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            id="media_id"
            name="media_id"
            label="Media ID *"
            type="number"
            value={values.media_id}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.media_id && Boolean(errors.media_id)}
            helperText={touched.media_id ? errors.media_id : ''}
            InputProps={{
              inputProps: { min: 1 }
            }}
            placeholder="1"
          />
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                id="status"
                name="status"
                checked={values.status}
                onChange={(e) => setFieldValue('status', e.target.checked)}
                onBlur={handleBlur}
              />
            }
            label={values.status ? "Active" : "Inactive"}
          />
        </Grid>

        {/* Is Paid */}
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                id="is_paid"
                name="is_paid"
                checked={values.is_paid}
                onChange={(e) => setFieldValue('is_paid', e.target.checked)}
                onBlur={handleBlur}
              />
            }
            label="Is Paid"
          />
        </Grid>

        {/* Is Published */}
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                id="is_published"
                name="is_published"
                checked={values.is_published}
                onChange={(e) => setFieldValue('is_published', e.target.checked)}
                onBlur={handleBlur}
              />
            }
            label="Is Published"
          />
        </Grid>

        {/* Payment Date */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            id="payment_date"
            name="payment_date"
            label="Payment Date"
            type="datetime-local"
            value={values.payment_date || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.payment_date && Boolean(errors.payment_date)}
            helperText={touched.payment_date ? errors.payment_date : ''}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        {/* Start Date */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            id="start_at"
            name="start_at"
            label="Start Date"
            type="datetime-local"
            value={values.start_at || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.start_at && Boolean(errors.start_at)}
            helperText={touched.start_at ? errors.start_at : ''}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        {/* End Date */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            id="end_at"
            name="end_at"
            label="End Date"
            type="datetime-local"
            value={values.end_at || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.end_at && Boolean(errors.end_at)}
            helperText={touched.end_at ? errors.end_at : ''}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};

export default ADsFieldsSection;