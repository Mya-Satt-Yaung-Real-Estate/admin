import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';
import { ANNOUNCEMENT_TYPE_OPTIONS } from '../../../types/announcement';

interface AnnouncementBasicSectionProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any> | SelectChangeEvent<any>) => void;
}

export const AnnouncementBasicSection: React.FC<AnnouncementBasicSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
}) => {
  return (
    <FormSection 
      title="Basic Information" 
      subtitle="Enter the basic details of the announcement"
    >
      <Grid container spacing={1.5}>
        {/* Announcement Type */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Announcement Type</InputLabel>
            <Select
              name="announcement_type"
              label="Announcement Type"
              value={values.announcement_type}
              onChange={handleChange}
              error={touched.announcement_type && Boolean(errors.announcement_type)}
            >
              {ANNOUNCEMENT_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {touched.announcement_type && errors.announcement_type && (
              <FormHelperText error>{errors.announcement_type}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Title */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            name="title"
            label="Title"
            value={values.title}
            onChange={handleChange}
            error={touched.title && Boolean(errors.title)}
            helperText={touched.title && errors.title}
          />
        </Grid>

        {/* Body */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            name="body"
            label="Message Body"
            multiline
            rows={4}
            value={values.body}
            onChange={handleChange}
            error={touched.body && Boolean(errors.body)}
            helperText={touched.body && errors.body}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};

