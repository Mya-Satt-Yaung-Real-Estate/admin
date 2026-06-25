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
  /** Fill parent width/height (e.g. profile card on user edit). Ignores fixed dropzone height when set. */
  fillContainer?: boolean;
  /** Shorter layout: hides filename row and tightens dropzone (use with fixed-height parent). */
  compact?: boolean;
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
  fillContainer = false,
  compact = false,
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
      if (mediaId > 0) {
        await deleteMediaMutation.mutateAsync(mediaId);
      }
      onImageDelete(mediaId);
    } catch (error: any) {
      console.error('Delete failed:', error);
    }
  };

  const canUpload = !uploadedImage && !uploading;

  const containerSx = {
    width: fillContainer ? '100%' : undefined,
    height: fillContainer ? '100%' : undefined,
    flex: fillContainer ? 1 : undefined,
    display: fillContainer ? 'flex' : undefined,
    flexDirection: fillContainer ? 'column' : undefined,
    minHeight: fillContainer ? 0 : undefined,
    overflow: fillContainer ? 'hidden' : undefined,
    position: fillContainer ? 'relative' : undefined,
  } as const;

  const uploadProgressOverlay = uploading ? (
    <Box
      sx={{
        ...(fillContainer
          ? {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              px: 1,
              pb: 1,
              pt: 0.5,
              bgcolor: 'rgba(255,255,255,0.92)',
            }
          : { mt: 2 }),
      }}
    >
      <Typography variant="caption" display="block" gutterBottom>
        Uploading image...
      </Typography>
      <LinearProgress />
    </Box>
  ) : null;

  const errorAlert = uploadMediaMutation.isError ? (
    <Alert
      severity="error"
      sx={{
        ...(fillContainer
          ? {
              position: 'absolute',
              left: 8,
              right: 8,
              bottom: uploading ? 48 : 8,
              py: 0.25,
              '& .MuiAlert-message': { fontSize: '0.75rem' },
            }
          : { mt: 2 }),
      }}
    >
      {uploadMediaMutation.error?.message || 'Upload failed. Please try again.'}
    </Alert>
  ) : null;

  const deleteErrorAlert = deleteMediaMutation.isError ? (
    <Alert
      severity="error"
      sx={{
        ...(fillContainer
          ? {
              position: 'absolute',
              left: 8,
              right: 8,
              bottom: 8,
              py: 0.25,
              '& .MuiAlert-message': { fontSize: '0.75rem' },
            }
          : { mt: 2 }),
      }}
    >
      {deleteMediaMutation.error?.message || 'Delete failed. Please try again.'}
    </Alert>
  ) : null;

  // Compact fill-container: one stable shell for empty and preview (user edit cards).
  if (fillContainer && compact) {
    return (
      <Box sx={containerSx}>
        {!uploadedImage ? (
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
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
              '&:hover': canUpload
                ? {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.50',
                  }
                : {},
            }}
          >
            <CardContent
              sx={{
                textAlign: 'center',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                py: 1,
                '&:last-child': { pb: 1 },
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }} />
              <Typography variant="body2" gutterBottom>
                {isDragActive ? 'Drop image here' : 'Drop or click to upload'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'grey.100',
              boxSizing: 'border-box',
              border: '2px solid',
              borderColor: 'divider',
            }}
          >
            <img
              src={uploadedImage.url}
              alt={uploadedImage.filename}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
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
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        {uploadProgressOverlay}
        {errorAlert}
        {deleteErrorAlert}
      </Box>
    );
  }

  // Helper to get file size text for display, but hides it if missing or not available
  const getDisplayFileSize = (media: Media): string | null => {
    const label = media.formatted_size?.trim();
    if (!label) {
      return null;
    }
    const normalized = label.toUpperCase();
    if (normalized === 'N/A' || normalized === 'UNKNOWN') {
      return null;
    }
    return label;
  };

  return (
    <Box sx={containerSx}>

      {/* Show Upload Area OR Uploaded Image - Not Both */}
      {!uploadedImage ? (
        /* Upload Area - Only show when no image is uploaded */
        <Box
          sx={{
            display: 'flex',
            justifyContent: fillContainer ? 'stretch' : 'center',
            height: fillContainer ? '100%' : dropzoneHeight,
            flex: fillContainer ? 1 : undefined,
            minHeight: fillContainer ? 0 : undefined,
          }}
        >
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
              maxWidth: fillContainer ? 'none' : 400,
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
              <CloudUploadIcon sx={{ fontSize: compact ? 28 : 40, color: 'primary.main', mb: compact ? 0.5 : 1.5 }} />
              <Typography variant={compact ? 'body2' : 'subtitle1'} gutterBottom>
                {isDragActive ? 'Drop image here' : compact ? 'Drop or click to upload' : 'Drag & drop image here'}
              </Typography>
              {!compact && (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      ) : (
        /* Uploaded Image - Only show when image is uploaded */
        <Box
          sx={{
            height: fillContainer ? '100%' : uploadedOuterHeight,
            flex: fillContainer ? 1 : undefined,
            display: fillContainer ? 'flex' : undefined,
            flexDirection: fillContainer ? 'column' : undefined,
            minHeight: fillContainer ? 0 : undefined,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: fillContainer ? 'stretch' : 'center',
              height: fillContainer ? undefined : uploadedInnerRowHeight,
              flex: fillContainer ? 1 : undefined,
              minHeight: fillContainer ? 0 : undefined,
            }}
          >
            <Card
              sx={{
                position: 'relative',
                maxWidth: fillContainer ? 'none' : 400,
                width: '100%',
                height: '100%',
                display: fillContainer ? 'flex' : undefined,
                flexDirection: fillContainer ? 'column' : undefined,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: fillContainer ? undefined : previewImageHeight,
                  flex: fillContainer ? 1 : undefined,
                  minHeight: fillContainer ? 0 : undefined,
                }}
              >
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
              
              {!compact && (
                <CardContent sx={{ py: 1, minHeight: 30, display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" noWrap>
                    {uploadedImage.filename}
                  </Typography>
                  {(() => {
                    const fileSizeLabel = getDisplayFileSize(uploadedImage);
                    if (!fileSizeLabel) {
                      return null;
                    }
                    return (
                      <Typography variant="caption" display="block" color="textSecondary">
                        {fileSizeLabel}
                      </Typography>
                    );
                  })()}
                </CardContent>
              )}
            </Card>
          </Box>
          
          {/* Replace Image Button */}
          {!compact && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: fillContainer ? 1 : 2, height: 40, flexShrink: 0 }}>
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
          )}
        </Box>
      )}

      {uploadProgressOverlay}

      {errorAlert}

      {deleteErrorAlert}
    </Box>
  );
};

export default SingleImageUpload;
