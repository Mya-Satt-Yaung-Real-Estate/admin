import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

interface BasicInformationSectionProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (event: any) => void;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

        <Grid container spacing={2}>
          {/* Title (English) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              name="title_en"
              label="Title (English) *"
              value={values.title_en}
              onChange={handleChange}
              error={touched.title_en && Boolean(errors.title_en)}
              helperText={touched.title_en && errors.title_en}
            />
          </Grid>

          {/* Title (Myanmar) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              name="title_mm"
              label="Title (Myanmar) *"
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
              multiline
              rows={4}
              name="description"
              label="Description *"
              value={values.description}
              onChange={handleChange}
              error={touched.description && Boolean(errors.description)}
              helperText={touched.description && errors.description}
            />
          </Grid>

          {/* Advertisement Type */}
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              error={touched.advertisement_type && Boolean(errors.advertisement_type)}
            >
              <InputLabel id="advertisement-type-label">Advertisement Type *</InputLabel>
              <Select
                labelId="advertisement-type-label"
                name="advertisement_type"
                label="Advertisement Type *"
                value={values.advertisement_type || 'for_sale'}
                onChange={handleChange}
              >
                <MenuItem value="for_sale">For Sale</MenuItem>
                <MenuItem value="for_rent">For Rent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BasicInformationSection;
