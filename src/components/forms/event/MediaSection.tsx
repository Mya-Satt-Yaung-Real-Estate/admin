import React from 'react';
import {
  Typography,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';
import SingleImageUpload from '../../ui/SingleImageUpload';
import { Media } from '../../../types/media';

interface MediaSectionProps {
  uploadedMedia: Media[];
  onMediaUpload: (media: Media) => void;
  onMediaDelete: (mediaId: number) => void;
  onUploadStart: () => void;
  onUploadProgress: (uploaded: number, total: number) => void;
  onUploadComplete: () => void;
  onUploadError: (error: string) => void;
  errors: any;
  touched: any;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  uploadedMedia,
  onMediaUpload,
  onMediaDelete,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  errors,
  touched,
}) => {
  // Get the first (and only) image from uploadedMedia
  const uploadedImage = uploadedMedia.length > 0 ? uploadedMedia[0] : null;

  const handleImageUpload = (media: Media) => {
    // For single image, replace any existing image
    onMediaUpload(media);
  };

  const handleImageDelete = (mediaId: number) => {
    onMediaDelete(mediaId);
  };

  return (
    <FormSection title="Event Image">
      <SingleImageUpload
        uploadedImage={uploadedImage}
        onImageUpload={handleImageUpload}
        onImageDelete={handleImageDelete}
        onUploadStart={onUploadStart}
        onUploadProgress={onUploadProgress}
        onUploadComplete={onUploadComplete}
        onUploadError={onUploadError}
      />
      {touched.media_ids && errors.media_ids && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {errors.media_ids}
        </Typography>
      )}
    </FormSection>
  );
};
