import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  SelectChangeEvent,
  Autocomplete,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';
import { PROPERTY_CONDITIONS } from '../../../validations';

interface BasicInformationSectionProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any> | SelectChangeEvent<any>) => void;
  propertyTypes?: any[];
  listingTypes?: any[];
  propertyTypesLoading?: boolean;
  listingTypesLoading?: boolean;
}

export const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  propertyTypes = [],
  listingTypes = [],
  propertyTypesLoading = false,
  listingTypesLoading = false,
}) => {
  return (
    <FormSection 
      title="Basic Information" 
      // subtitle="Enter the basic details of the property"
    >
      <Grid container spacing={1.5}>
        {/* Property Type */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            size="small"
            options={propertyTypes}
            getOptionLabel={(option) => 
              `${option.name_en} (${option.name_mm})`
            }
            value={propertyTypes.find(type => type.id === values.property_type_id) || null}
            onChange={(_, newValue) => {
              // We need to simulate the formik handleChange for this field
              const event = {
                target: {
                  name: 'property_type_id',
                  value: newValue?.id || 0
                }
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(event);
            }}
            loading={propertyTypesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Property Type"
                error={touched.property_type_id && Boolean(errors.property_type_id)}
                helperText={touched.property_type_id && errors.property_type_id}
              />
            )}
          />
        </Grid>

        {/* Listing Type */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            size="small"
            options={listingTypes}
            getOptionLabel={(option) => 
              `${option.name_en} (${option.name_mm})`
            }
            value={listingTypes.find(type => type.id === values.listing_type_id) || null}
            onChange={(_, newValue) => {
              // We need to simulate the formik handleChange for this field
              const event = {
                target: {
                  name: 'listing_type_id',
                  value: newValue?.id || 0
                }
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(event);
            }}
            loading={listingTypesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Listing Type"
                error={touched.listing_type_id && Boolean(errors.listing_type_id)}
                helperText={touched.listing_type_id && errors.listing_type_id}
              />
            )}
          />
        </Grid>

        {/* Title English */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            name="title_en"
            label="Title (English)"
            value={values.title_en}
            onChange={handleChange}
            error={touched.title_en && Boolean(errors.title_en)}
            helperText={touched.title_en && errors.title_en}
          />
        </Grid>

        {/* Title Myanmar */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            name="title_mm"
            label="Title (Myanmar)"
            value={values.title_mm}
            onChange={handleChange}
            error={touched.title_mm && Boolean(errors.title_mm)}
            helperText={touched.title_mm && errors.title_mm}
          />
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            name="description"
            label="Description"
            multiline
            rows={3}
            value={values.description}
            onChange={handleChange}
            error={touched.description && Boolean(errors.description)}
            helperText={touched.description && errors.description}
          />
        </Grid>

        {/* Price and Area */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            name="price"
            label="Price"
            type="number"
            value={values.price}
            onChange={handleChange}
            error={touched.price && Boolean(errors.price)}
            helperText={touched.price && errors.price}
            InputProps={{
              startAdornment: <InputAdornment position="start">MMK</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            name="area_sqft"
            label="Area (sq ft)"
            type="number"
            value={values.area_sqft}
            onChange={handleChange}
            error={touched.area_sqft && Boolean(errors.area_sqft)}
            helperText={touched.area_sqft && errors.area_sqft}
          />
        </Grid>

        {/* Bedrooms and Bathrooms */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            name="bedrooms"
            label="Bedrooms"
            type="number"
            value={values.bedrooms || ''}
            onChange={handleChange}
            error={touched.bedrooms && Boolean(errors.bedrooms)}
            helperText={touched.bedrooms && errors.bedrooms}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            name="bathrooms"
            label="Bathrooms"
            type="number"
            value={values.bathrooms || ''}
            onChange={handleChange}
            error={touched.bathrooms && Boolean(errors.bathrooms)}
            helperText={touched.bathrooms && errors.bathrooms}
          />
        </Grid>

        {/* Property Condition */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Property Condition</InputLabel>
            <Select
              name="property_condition"
              label="Property Condition"
              value={values.property_condition}
              onChange={handleChange}
              error={touched.property_condition && Boolean(errors.property_condition)}
            >
              {PROPERTY_CONDITIONS.map((condition) => (
                <MenuItem key={condition.value} value={condition.value}>
                  {condition.label}
                </MenuItem>
              ))}
            </Select>
            {touched.property_condition && errors.property_condition && (
              <FormHelperText error>{errors.property_condition}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </FormSection>
  );
};
