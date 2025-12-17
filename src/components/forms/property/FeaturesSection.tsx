import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { FormSection } from '../shared/FormSection';

interface FeaturesSectionProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  errors?: any;
  touched?: any;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  values,
  setFieldValue,
  errors = {},
  touched = {},
}) => {
  const [featureInput, setFeatureInput] = useState<string>('');

  const currentFeatures = values.features || [];

  const handleAddFeature = () => {
    const trimmedValue = featureInput.trim();
    if (trimmedValue === '') return;
    
    if (!currentFeatures.includes(trimmedValue)) {
      setFieldValue('features', [...currentFeatures, trimmedValue]);
    }
    setFeatureInput('');
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setFieldValue(
      'features',
      currentFeatures.filter((f: string) => f !== featureToRemove)
    );
  };

  const handleFeatureInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  return (
    <FormSection title="Property Features & Amenities">
      {/* Features Input */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a feature and press Enter or click Add"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={handleFeatureInputKeyDown}
            error={touched.features && Boolean(errors.features)}
            helperText={touched.features && errors.features}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddFeature}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add
          </Button>
        </Box>

        {/* Features Display */}
        {currentFeatures.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {currentFeatures.map((feature: string, index: number) => (
              <Chip
                key={index}
                label={feature}
                onDelete={() => handleRemoveFeature(feature)}
                color="primary"
                variant="filled"
                sx={{ 
                  mb: 1,
                  '& .MuiChip-deleteIcon': {
                    color: 'white',
                    '&:hover': {
                      color: '#f5f5f5',
                    }
                  }
                }}
              />
            ))}
          </Stack>
        )}
      </Box>
    </FormSection>
  );
};
