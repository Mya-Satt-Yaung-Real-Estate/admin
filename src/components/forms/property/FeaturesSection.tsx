import React from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';
import { PROPERTY_FEATURES, PropertyFeature } from '../../../validations';

interface FeaturesSectionProps {
  values: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  selectedFeatures: PropertyFeature[];
  onFeatureToggle: (feature: PropertyFeature) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  values,
  handleChange,
  selectedFeatures,
  onFeatureToggle,
}) => {
  return (
    <FormSection 
      title="Property Features" 
      // subtitle="Select the features available in this property"
    >
      {/* Bank Installment */}
      <FormControlLabel
        control={
          <Switch
            name="bank_installment_available"
            checked={Boolean(values.bank_installment_available)}
            onChange={(e) => {
              console.log('Bank installment toggle:', e.target.checked);
              handleChange(e);
            }}
          />
        }
        label="Bank Installment Available"
        sx={{ mb: 2 }}
      />

      {/* Features Selection */}
      <Autocomplete
        multiple
        size="small"
        options={PROPERTY_FEATURES}
        getOptionLabel={(option) => `${option.label_en} (${option.label_mm})`}
        value={PROPERTY_FEATURES.filter(feature => selectedFeatures.includes(feature.value))}
        onChange={(_, newValue) => {
          console.log('Features changed:', newValue);
          const newFeatureValues = newValue.map(feature => feature.value);
          
          // Add features that are newly selected
          newFeatureValues.forEach(featureValue => {
            if (!selectedFeatures.includes(featureValue)) {
              onFeatureToggle(featureValue);
            }
          });
          
          // Remove features that are no longer selected
          selectedFeatures.forEach(featureValue => {
            if (!newFeatureValues.includes(featureValue)) {
              onFeatureToggle(featureValue);
            }
          });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Features"
            placeholder="Search and select features..."
            size="small"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.value}
              label={`${option.label_en} (${option.label_mm})`}
              size="small"
              color="primary"
              variant="filled"
            />
          ))
        }
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option.label_en} ({option.label_mm})
          </Box>
        )}
        sx={{ mt: 1 }}
      />
    </FormSection>
  );
};
