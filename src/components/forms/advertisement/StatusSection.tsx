import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { ADVERTISEMENT_STATUSES } from '../../../types/advertisement';

interface StatusSectionProps {
  values: any;
  handleChange: (event: React.ChangeEvent<any> | SelectChangeEvent<any>) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  values,
  handleChange,
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Status & Settings
        </Typography>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

        <Grid container spacing={2}>
          {/* Status */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel size="small">Status</InputLabel>
              <Select
                size="small"
                name="status"
                value={values.status || 'draft'}
                onChange={handleChange}
                label="Status"
              >
                {ADVERTISEMENT_STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Featured */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  name="is_featured"
                  checked={values.is_featured || false}
                  onChange={handleChange}
                />
              }
              label="Featured Advertisement"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StatusSection;
