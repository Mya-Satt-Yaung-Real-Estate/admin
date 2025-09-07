import React, { useRef, useEffect } from 'react';
import {
  Grid,
  TextField,
} from '@mui/material';
import { FormSection } from './FormSection';

interface SimpleDescriptionSectionProps {
  values: {
    description: string;
  };
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  handleBlur: (event: React.FocusEvent<any>) => void;
  descriptionLabel?: string;
  descriptionRequired?: boolean;
  descriptionMaxLength?: number;
  title?: string;
  subtitle?: string;
}

export const SimpleDescriptionSection: React.FC<SimpleDescriptionSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  descriptionLabel = "Description",
  descriptionRequired = true,
  descriptionMaxLength = 5000,
  title = "Description",
  subtitle,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize function
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height based on content
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 80;
      const maxHeight = 500;
      
      // Set height within bounds
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Adjust height when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [values.description]);

  // Enhanced change handler
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
    // Small delay to ensure DOM is updated
    setTimeout(adjustTextareaHeight, 0);
  };

  return (
    <FormSection title={title} subtitle={subtitle}>
      <Grid container spacing={1.5}>
        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
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
            onChange={handleDescriptionChange}
            onBlur={handleBlur}
            error={touched.description && Boolean(errors.description)}
            helperText={
              touched.description && errors.description
                ? errors.description
                : `${values.description.length}/${descriptionMaxLength} characters`
            }
            inputProps={{ 
              maxLength: descriptionMaxLength,
              ref: textareaRef,
            }}
            sx={{
              '& .MuiInputBase-root': {
                minHeight: 'auto',
                '& textarea': {
                  resize: 'vertical', // Allow vertical resize for user control
                  minHeight: '80px',
                  maxHeight: '500px', // Increased max height for long content
                  overflow: 'auto', // Show scrollbar when needed
                  transition: 'height 0.2s ease-in-out', // Smooth height transition
                  lineHeight: '1.5',
                  padding: '8px 12px',
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
