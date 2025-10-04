import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Person as PersonIcon, Work as WorkIcon, Language as LanguageIcon } from '@mui/icons-material';
import { LawyerFormData } from '../../../types/lawyer';

interface BasicInformationSectionProps {
  values: LawyerFormData;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
}) => {
  // Common language options
  const languageOptions = [
    'Myanmar',
    'English',
    'Chinese',
    'Japanese',
    'Korean',
    'Thai',
    'Hindi',
    'French',
    'German',
    'Spanish',
  ];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="600">
            Basic Information
          </Typography>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Name and Title - Horizontal */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              name="name"
              label="Lawyer Name"
              value={values.name}
              onChange={handleChange}
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name && errors.name}
              placeholder="Enter lawyer's full name"
              required
            />
            <TextField
              fullWidth
              name="title"
              label="Professional Title"
              value={values.title}
              onChange={handleChange}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
              placeholder="e.g., Senior Partner, Associate Attorney"
              required
            />
          </Box>

          {/* Specialization and Experience - Horizontal */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              name="specialization"
              label="Specialization"
              value={values.specialization}
              onChange={handleChange}
              error={touched.specialization && Boolean(errors.specialization)}
              helperText={touched.specialization && errors.specialization}
              placeholder="e.g., Corporate Law, Criminal Defense, Property Law"
              required
            />
            <TextField
              fullWidth
              name="experience_years"
              label="Years of Experience"
              type="number"
              value={values.experience_years}
              onChange={handleChange}
              error={touched.experience_years && Boolean(errors.experience_years)}
              helperText={touched.experience_years && errors.experience_years}
              placeholder="Enter years of experience"
              inputProps={{ min: 0, max: 50 }}
              required
            />
          </Box>

          {/* Skillful Languages */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LanguageIcon sx={{ fontSize: 20 }} />
              Languages Spoken
              <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
            </Typography>
            <Autocomplete
              multiple
              options={languageOptions}
              value={values.skillful_languages || []}
              onChange={(_, newValue) => setFieldValue('skillful_languages', newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={option}
                      label={option}
                      {...tagProps}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select languages"
                  error={touched.skillful_languages && Boolean(errors.skillful_languages)}
                  helperText={touched.skillful_languages && errors.skillful_languages}
                />
              )}
            />
          </Box>

          {/* Services */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ fontSize: 20 }} />
              Services Offered
            </Typography>
            <Autocomplete
              multiple
              freeSolo
              options={[
                'Legal Consultation',
                'Court Representation',
                'Document Preparation',
                'Contract Review',
                'Legal Advice',
                'Mediation',
                'Arbitration',
                'Legal Research',
                'Due Diligence',
                'Compliance Review',
              ]}
              value={values.services || []}
              onChange={(_, newValue) => setFieldValue('services', newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={option}
                      label={option}
                      {...tagProps}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Add services offered"
                  helperText="Type to add custom services or select from suggestions"
                />
              )}
            />
          </Box>

          {/* About */}
          <TextField
            fullWidth
            name="about"
            label="About"
            multiline
            rows={4}
            value={values.about || ''}
            onChange={handleChange}
            error={touched.about && Boolean(errors.about)}
            helperText={touched.about && errors.about}
            placeholder="Brief description about the lawyer's background and expertise"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BasicInformationSection;
