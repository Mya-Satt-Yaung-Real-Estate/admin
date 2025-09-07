import React from 'react';
import {
  Grid,
  TextField,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';

interface BasicInformationSectionProps {
  values: {
    name_en: string;
    name_mm: string;
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
    <FormSection title="Basic Information">
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={
              <span>
                Event Name (English) <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
              </span>
            }
            name="name_en"
            value={values.name_en}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name_en && Boolean(errors.name_en)}
            helperText={touched.name_en && errors.name_en}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={
              <span>
                Event Name (Myanmar) <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
              </span>
            }
            name="name_mm"
            value={values.name_mm}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name_mm && Boolean(errors.name_mm)}
            helperText={touched.name_mm && errors.name_mm}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
