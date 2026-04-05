import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useUploadMedia, useDeleteMedia } from '../../services/queries/media';
import { Media } from '../../types/media';

interface SingleImageUploadProps {
  uploadedImage: Media | null;
  onImageUpload: (media: Media) => void;
  onImageDelete: (mediaId: number) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (uploaded: number, total: number) => void;
  onUploadComplete?: () => void;
  onUploadError?: (error: string) => void;
  /** Empty-state drop zone height (px). Default 350 — omit everywhere for legacy layout. */
  dropzoneHeight?: number;
  /** Uploaded preview image area height (px). Default 250 — caption + actions sized relative to this. */
  previewImageHeight?: number;
}

const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  uploadedImage,
  onImageUpload,
  onImageDelete,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  dropzoneHeight = 350,
  previewImageHeight = 250,
}) => {
  const uploadedInnerRowHeight = previewImageHeight + 30;
  const uploadedOuterHeight = previewImageHeight + 100;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Only take the first file
      const fileToUpload = acceptedFiles[0];
      if (!fileToUpload) return;

      // Notify upload start
      onUploadStart?.();
      setUploading(true);

      try {
        const result = await uploadMediaMutation.mutateAsync({
          file: fileToUpload,
          media_type: 'image',
        });

        onImageUpload(result.data);
        onUploadProgress?.(1, 1);
        onUploadComplete?.();
      } catch (error) {
        console.error('Upload failed:', error);
        onUploadError?.(`Failed to upload ${fileToUpload.name}`);
      } finally {
        setUploading(false);
      }
    },
    [uploadMediaMutation, onImageUpload, onUploadStart, onUploadProgress, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
    disabled: uploading || !!uploadedImage,
  });

  const handleDeleteImage = async (mediaId: number) => {
    try {
      await deleteMediaMutation.mutateAsync(mediaId);
      onImageDelete(mediaId);
    } catch (error: any) {
      console.error('Delete failed:', error);
    }
  };

  const canUpload = !uploadedImage && !uploading;

  return (
    <Box>

      {/* Show Upload Area OR Uploaded Image - Not Both */}
      {!uploadedImage ? (
        /* Upload Area - Only show when no image is uploaded */
        <Box sx={{ display: 'flex', justifyContent: 'center', height: dropzoneHeight }}>
          <Card
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              backgroundColor: isDragActive ? 'primary.50' : 'background.paper',
              cursor: canUpload ? 'pointer' : 'not-allowed',
              opacity: canUpload ? 1 : 0.6,
              transition: 'all 0.2s ease',
              width: '100%',
              maxWidth: 400,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              '&:hover': canUpload ? {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50',
              } : {},
            }}
          >
            <CardContent sx={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1.5 }} />
              <Typography variant="subtitle1" gutterBottom>
                {isDragActive ? 'Drop image here' : 'Drag & drop image here'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                or click to select image
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                disabled={!canUpload}
                size="small"
              >
                Select Image
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Accepted: Images (JPG, PNG, GIF, WebP)
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ) : (
        /* Uploaded Image - Only show when image is uploaded */
        <Box sx={{ height: uploadedOuterHeight }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', height: uploadedInnerRowHeight }}>
            <Card sx={{ position: 'relative', maxWidth: 400, width: '100%', height: '100%' }}>
              <Box sx={{ position: 'relative', height: previewImageHeight }}>
                <img
                  src={uploadedImage.url}
                  alt={uploadedImage.filename}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                
                {/* Image Type Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <ImageIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption">image</Typography>
                </Box>

                {/* Delete Button */}
                <IconButton
                  onClick={() => handleDeleteImage(uploadedImage.id)}
                  disabled={deleteMediaMutation.isPending}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,1)',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              <CardContent sx={{ py: 1, height: 30, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="caption" noWrap>
                  {uploadedImage.filename}
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  {uploadedImage.formatted_size}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          {/* Replace Image Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, height: 40 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onDrop([file]);
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => {
                fileInputRef.current?.click();
              }}
              size="small"
            >
              Replace Image
            </Button>
          </Box>
        </Box>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Uploading image...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Error Alert */}
      {uploadMediaMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadMediaMutation.error?.message || 'Upload failed. Please try again.'}
        </Alert>
      )}

      {/* Delete Error Alert */}
      {deleteMediaMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {deleteMediaMutation.error?.message || 'Delete failed. Please try again.'}
        </Alert>
      )}
    </Box>
  );
};

export default SingleImageUpload;
