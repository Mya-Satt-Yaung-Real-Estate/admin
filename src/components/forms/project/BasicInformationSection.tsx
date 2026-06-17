import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  SelectChangeEvent,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';
import { PROJECT_CONDITIONS } from '../../../validations/schemas/projectSchemas';

interface BasicInformationSectionProps {
  values: Record<string, unknown>;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<unknown> | SelectChangeEvent<unknown>) => void;
  setFieldValue: (field: string, value: unknown) => void;
  propertyTypes?: Array<{ id: number; name_en: string; name_mm: string }>;
  propertyTypesLoading?: boolean;
}

export const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  propertyTypes = [],
  propertyTypesLoading = false,
}) => {
  return (
    <FormSection title="Basic Information">
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            required
            name="title_en"
            label="Title (English)"
            value={values.title_en || ''}
            onChange={handleChange}
            error={touched.title_en && Boolean(errors.title_en)}
            helperText={touched.title_en && errors.title_en}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            required
            name="title_mm"
            label="Title (Myanmar)"
            value={values.title_mm || ''}
            onChange={handleChange}
            error={touched.title_mm && Boolean(errors.title_mm)}
            helperText={touched.title_mm && errors.title_mm}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            size="small"
            options={propertyTypes}
            getOptionLabel={(option) => `${option.name_en} (${option.name_mm})`}
            value={propertyTypes.find((type) => type.id === values.property_type_id) || null}
            onChange={(_, newValue) => setFieldValue('property_type_id', newValue?.id || 0)}
            loading={propertyTypesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Property Type"
                error={touched.property_type_id && Boolean(errors.property_type_id)}
                helperText={touched.property_type_id && errors.property_type_id}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Condition</InputLabel>
            <Select
              name="condition"
              label="Condition"
              required
              value={values.condition || 'upcoming'}
              onChange={handleChange}
            >
              {PROJECT_CONDITIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            required
            name="total_units"
            label="Total Units"
            value={values.total_units || ''}
            onChange={handleChange}
            error={touched.total_units && Boolean(errors.total_units)}
            helperText={touched.total_units && errors.total_units}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            required
            name="completion_text"
            label="Completion Text"
            placeholder="e.g. Q4 2026"
            value={values.completion_text || ''}
            onChange={handleChange}
            error={touched.completion_text && Boolean(errors.completion_text)}
            helperText={touched.completion_text && errors.completion_text}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            name="description_en"
            label="Description (English)"
            multiline
            rows={4}
            value={values.description_en || ''}
            onChange={handleChange}
            error={touched.description_en && Boolean(errors.description_en)}
            helperText={touched.description_en && errors.description_en}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            required
            name="description_mm"
            label="Description (Myanmar)"
            multiline
            rows={4}
            value={values.description_mm || ''}
            onChange={handleChange}
            error={touched.description_mm && Boolean(errors.description_mm)}
            helperText={touched.description_mm && errors.description_mm}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
