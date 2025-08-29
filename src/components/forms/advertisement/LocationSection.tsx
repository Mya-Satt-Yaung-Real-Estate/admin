import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Box,
  SelectChangeEvent,
  Autocomplete,
  FormHelperText,
} from '@mui/material';

interface LocationSectionProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any> | SelectChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  regions: any[];
  townships: any[];
  regionsLoading: boolean;
  townshipsLoading: boolean;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  regions,
  townships,
  regionsLoading,
  townshipsLoading,
}) => {
  // Filter townships based on selected region
  const filteredTownships = values.region_id
    ? townships.filter((township) => township.region_id === values.region_id)
    : [];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Location Information
        </Typography>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

        <Grid container spacing={2}>
          {/* Region */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              size="small"
              options={regions}
              getOptionLabel={(option) => 
                `${option.name_en} (${option.name_mm})`
              }
              value={regions.find(region => region.id === values.region_id) || null}
              onChange={(_, newValue) => {
                // We need to simulate the formik handleChange for this field
                const event = {
                  target: {
                    name: 'region_id',
                    value: newValue?.id || null
                  }
                } as React.ChangeEvent<HTMLInputElement>;
                handleChange(event);
                // Reset township when region changes
                setFieldValue('township_id', null);
              }}
              loading={regionsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Region (Optional)"
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
              getOptionLabel={(option) => 
                `${option.name_en} (${option.name_mm})`
              }
              value={filteredTownships.find(township => township.id === values.township_id) || null}
              onChange={(_, newValue) => {
                // We need to simulate the formik handleChange for this field
                const event = {
                  target: {
                    name: 'township_id',
                    value: newValue?.id || null
                  }
                } as React.ChangeEvent<HTMLInputElement>;
                handleChange(event);
              }}
              loading={townshipsLoading}
              disabled={!values.region_id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Township (Optional)"
                  error={touched.township_id && Boolean(errors.township_id)}
                  helperText={touched.township_id && errors.township_id}
                />
              )}
            />
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              name="address"
              label="Address (Optional)"
              value={values.address}
              onChange={handleChange}
              error={touched.address && Boolean(errors.address)}
              helperText={touched.address && errors.address}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LocationSection;
