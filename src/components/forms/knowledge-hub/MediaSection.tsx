import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
} from '@mui/material';
import { SingleImageUpload } from '../../ui';
import { Media } from '../../../types/media';

interface MediaSectionProps {
  values: {
    media_id: number;
    tag: string[];
    is_active: boolean;
  };
  errors: any;
  touched: any;
  handleFieldChange: (field: string, value: any) => void;
  handleTagInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleTagInputKeyPress: (event: React.KeyboardEvent) => void;
  removeTag: (tag: string) => void;
  tagInput: string;
  uploadedMedia: Media[];
  onMediaUpload: (media: Media) => void;
  onMediaDelete: (mediaId: number) => void;
  onUploadStart: () => void;
  onUploadProgress: (uploaded: number, total: number) => void;
  onUploadComplete: () => void;
  onUploadError: (error: string) => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  values,
  errors,
  touched,
  handleFieldChange,
  handleTagInputChange,
  handleTagInputKeyPress,
  removeTag,
  tagInput,
  uploadedMedia,
  onMediaUpload,
  onMediaDelete,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
}) => {
  // Suppress unused variable warning
  void touched;
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Media & Settings
        </Typography>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

        <Grid container spacing={3}>
          {/* Left Side: Status and Tags */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
              Status & Tags
            </Typography>

            {/* Status */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={values.is_active ? 'true' : 'false'}
                onChange={(e) => handleFieldChange('is_active', e.target.value === 'true')}
                label="Status"
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>

            {/* Tags */}
            <FormControl fullWidth size="small">
              <InputLabel>Tags</InputLabel>
              <OutlinedInput
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagInputKeyPress}
                label="Tags"
                placeholder="Type a tag and press Enter"
              />
              {values.tag.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {values.tag.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      color="primary"
                      variant="outlined"
                      sx={{
                        '& .MuiChip-deleteIcon': {
                          color: 'red',
                          fontSize: '18px',
                          '&:hover': {
                            color: 'darkred',
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
            </FormControl>
          </Grid>

          {/* Right Side: Knowledge Hub Image */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
              Knowledge Hub Image
            </Typography>
            <SingleImageUpload
              uploadedImage={uploadedMedia.length > 0 ? uploadedMedia[0] : null}
              onImageUpload={onMediaUpload}
              onImageDelete={onMediaDelete}
              onUploadStart={onUploadStart}
              onUploadProgress={onUploadProgress}
              onUploadComplete={onUploadComplete}
              onUploadError={onUploadError}
            />
            {errors.media_id && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                {errors.media_id}
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
