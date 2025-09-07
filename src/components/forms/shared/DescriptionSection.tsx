import React from 'react';
import {
  Grid,
  TextField,
  Box,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import { FormSection } from './FormSection';

interface DescriptionSectionProps {
  values: {
    description: string;
  };
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  handleBlur: (event: React.FocusEvent<any>) => void;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  showTags?: boolean;
  descriptionLabel?: string;
  descriptionRequired?: boolean;
  descriptionMaxLength?: number;
  tagsLabel?: string;
  title?: string;
  subtitle?: string;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  tags = [],
  onTagsChange,
  showTags = true,
  descriptionLabel = "Description",
  descriptionRequired = true,
  descriptionMaxLength = 5000,
  tagsLabel = "Tags",
  title = "Description",
  subtitle,
}) => {
  const [tagInput, setTagInput] = React.useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && onTagsChange) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (onTagsChange) {
      onTagsChange(tags.filter(tag => tag !== tagToRemove));
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  return (
    <FormSection title={title} subtitle={subtitle}>
      <Grid container spacing={1.5}>
        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            size="small"
            label={
              descriptionRequired ? (
                <span>
                  {descriptionLabel} <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                </span>
              ) : (
                `${descriptionLabel} (optional)`
              )
            }
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description && Boolean(errors.description)}
            helperText={
              touched.description && errors.description
                ? errors.description
                : `${values.description.length}/${descriptionMaxLength} characters`
            }
            inputProps={{ maxLength: descriptionMaxLength }}
          />
        </Grid>

        {/* Tags */}
        {showTags && onTagsChange && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              {tagsLabel}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </FormSection>
  );
};
