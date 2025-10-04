import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { LawyerFormData } from '../../../types/lawyer';
import { Region, Township } from '../../../types';

interface LocationSectionProps {
  values: LawyerFormData;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  regions: Region[];
  townships: Township[];
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
  const filteredTownships = townships.filter(
    township => township.region_id === values.region_id
  );

  // Reset township when region changes
  useEffect(() => {
    if (values.region_id && values.township_id) {
      const selectedTownship = townships.find(t => t.id === values.township_id);
      if (selectedTownship && selectedTownship.region_id !== values.region_id) {
        setFieldValue('township_id', '');
      }
    }
  }, [values.region_id, values.township_id, townships, setFieldValue]);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="600">
            Location Information
          </Typography>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Region and Township - Horizontal */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth error={touched.region_id && Boolean(errors.region_id)} required>
              <InputLabel>Region</InputLabel>
              <Select
                name="region_id"
                value={values.region_id || ''}
                onChange={(e) => handleChange(e as any)}
                label="Region"
                disabled={regionsLoading}
              >
                {regions.map((region) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name_en}
                  </MenuItem>
                ))}
              </Select>
              {touched.region_id && errors.region_id && (
                <FormHelperText>{errors.region_id}</FormHelperText>
              )}
            </FormControl>

            <FormControl 
              fullWidth 
              error={touched.township_id && Boolean(errors.township_id)}
              disabled={!values.region_id || townshipsLoading}
              required
            >
              <InputLabel>Township</InputLabel>
              <Select
                name="township_id"
                value={values.township_id || ''}
                onChange={(e) => handleChange(e as any)}
                label="Township"
                disabled={!values.region_id || townshipsLoading}
              >
                {filteredTownships.map((township) => (
                  <MenuItem key={township.id} value={township.id}>
                    {township.name_en}
                  </MenuItem>
                ))}
              </Select>
              {touched.township_id && errors.township_id && (
                <FormHelperText>{errors.township_id}</FormHelperText>
              )}
              {!values.region_id && (
                <FormHelperText>Please select a region first</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Address */}
          <TextField
            fullWidth
            name="address"
            label="Address"
            multiline
            rows={3}
            value={values.address || ''}
            onChange={handleChange}
            error={touched.address && Boolean(errors.address)}
            helperText={touched.address && errors.address}
            placeholder="Enter detailed address (optional)"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default LocationSection;
