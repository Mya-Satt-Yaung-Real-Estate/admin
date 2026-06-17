import React from 'react';
import { Grid, TextField, Autocomplete } from '@mui/material';
import { FormSection } from '../shared/FormSection';

interface LocationSectionProps {
  values: Record<string, unknown>;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<unknown>) => void;
  setFieldValue: (field: string, value: unknown) => void;
  regions?: Array<{ id: number; name_en: string; name_mm: string }>;
  townships?: Array<{ id: number; name_en: string; name_mm: string; region_id: number }>;
  regionsLoading?: boolean;
  townshipsLoading?: boolean;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  regions = [],
  townships = [],
  regionsLoading = false,
  townshipsLoading = false,
}) => {
  const filteredTownships = townships.filter(
    (township) => township.region_id === values.region_id
  );

  return (
    <FormSection title="Location Information">
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            size="small"
            options={regions}
            getOptionLabel={(option) => `${option.name_en} (${option.name_mm})`}
            value={regions.find((region) => region.id === values.region_id) || null}
            onChange={(_, newValue) => {
              setFieldValue('region_id', newValue?.id || 0);
              setFieldValue('township_id', 0);
            }}
            loading={regionsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Region"
                error={touched.region_id && Boolean(errors.region_id)}
                helperText={touched.region_id && errors.region_id}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            size="small"
            options={filteredTownships}
            getOptionLabel={(option) => `${option.name_en} (${option.name_mm})`}
            value={filteredTownships.find((township) => township.id === values.township_id) || null}
            onChange={(_, newValue) => setFieldValue('township_id', newValue?.id || 0)}
            loading={townshipsLoading}
            disabled={!values.region_id}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Township"
                error={touched.township_id && Boolean(errors.township_id)}
                helperText={touched.township_id && errors.township_id}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            required
            name="address"
            label="Address"
            value={values.address || ''}
            onChange={handleChange}
            error={touched.address && Boolean(errors.address)}
            helperText={touched.address && errors.address}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
