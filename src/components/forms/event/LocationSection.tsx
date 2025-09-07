import React from 'react';
import {
  Grid,
  TextField,
  Autocomplete,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';

interface LocationSectionProps {
  values: {
    region_id: number | undefined;
    township_id: number | undefined;
  };
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  regions: any[];
  townships: any[];
  regionsLoading?: boolean;
  townshipsLoading?: boolean;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  regions,
  townships,
  regionsLoading = false,
  townshipsLoading = false,
}) => {
  // Filter townships based on selected region
  const filteredTownships = values.region_id 
    ? townships.filter(township => township.region_id === values.region_id)
    : townships;

  return (
    <FormSection title="Location">
      <Grid container spacing={1.5}>
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
      </Grid>
    </FormSection>
  );
};
