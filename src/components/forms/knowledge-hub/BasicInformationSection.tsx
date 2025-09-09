import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Box,
} from '@mui/material';

interface BasicInformationSectionProps {
  values: {
    title_en: string;
    title_mm: string;
    short_description: string;
    writer_name: string;
  };
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  handleBlur: (event: React.FocusEvent<any>) => void;
}

export const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Basic Information
        </Typography>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

        <Grid container spacing={3}>
          {/* English Title */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={
                <span>
                  English Title <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                </span>
              }
              name="title_en"
              value={values.title_en}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title_en && Boolean(errors.title_en)}
              helperText={touched.title_en && errors.title_en}
            />
          </Grid>

          {/* Myanmar Title */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={
                <span>
                  Myanmar Title <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                </span>
              }
              name="title_mm"
              value={values.title_mm}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title_mm && Boolean(errors.title_mm)}
              helperText={touched.title_mm && errors.title_mm}
            />
          </Grid>

          {/* Short Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label={
                <span>
                  Short Description <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                </span>
              }
              name="short_description"
              value={values.short_description}
              onChange={handleChange}
              onBlur={handleBlur}
              multiline
              rows={3}
              error={touched.short_description && Boolean(errors.short_description)}
              helperText={touched.short_description && errors.short_description}
            />
          </Grid>

          {/* Writer Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={
                <span>
                  Writer Name <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                </span>
              }
              name="writer_name"
              value={values.writer_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.writer_name && Boolean(errors.writer_name)}
              helperText={touched.writer_name && errors.writer_name}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
