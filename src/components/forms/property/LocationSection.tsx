import React from 'react';
import {
  Grid,
  TextField,
  Autocomplete,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';
import { InteractiveMap } from '../../ui/InteractiveMap';

interface LocationSectionProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  regions?: any[];
  townships?: any[];
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
  // Filter townships based on selected region
  const filteredTownships = townships.filter((township) => 
    township.region_id === values.region_id
  );

  return (
    <FormSection 
      title="Location Information" 
      // subtitle="Specify the property location"
    >
      <Grid container spacing={1.5}>
        {/* Region and Township */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            size="small"
            options={regions || []}
            getOptionLabel={(option) => 
              `${option.name_en} (${option.name_mm})`
            }
            value={regions?.find(region => region.id === values.region_id) || null}
            onChange={(_, newValue) => {
              setFieldValue('region_id', newValue?.id || 0);
              setFieldValue('township_id', 0);
            }}
            loading={regionsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
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
            getOptionLabel={(option) => 
              `${option.name_en} (${option.name_mm})`
            }
            value={filteredTownships.find(township => township.id === values.township_id) || null}
            onChange={(_, newValue) => {
              setFieldValue('township_id', newValue?.id || 0);
            }}
            loading={townshipsLoading}
            disabled={!values.region_id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Township"
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
            name="address"
            label="Address"
            value={values.address}
            onChange={handleChange}
            error={touched.address && Boolean(errors.address)}
            helperText={touched.address && errors.address}
          />
        </Grid>

        {/* Latitude and Longitude */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            name="latitude"
            label="Latitude"
            type="number"
            inputProps={{ step: "0.000001" }}
            value={values.latitude ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
              setFieldValue('latitude', value);
            }}
            error={touched.latitude && Boolean(errors.latitude)}
            helperText={touched.latitude && errors.latitude || 'Enter latitude value (e.g., 16.8661)'}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            name="longitude"
            label="Longitude"
            type="number"
            inputProps={{ step: "0.000001" }}
            value={values.longitude ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
              setFieldValue('longitude', value);
            }}
            error={touched.longitude && Boolean(errors.longitude)}
            helperText={touched.longitude && errors.longitude || 'Enter longitude value (e.g., 96.1951)'}
          />
        </Grid>

        {/* Interactive Map */}
        <Grid item xs={12}>
          <InteractiveMap
            latitude={values.latitude}
            longitude={values.longitude}
            onLocationSelect={(lat: number, lng: number) => {
              setFieldValue('latitude', lat);
              setFieldValue('longitude', lng);
            }}
            height={300}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
