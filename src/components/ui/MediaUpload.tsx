import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useUploadMedia, useDeleteMedia } from '../../services/queries/media';
import { Media } from '../../types/media';

interface MediaUploadProps {
  uploadedMedia: Media[];
  onMediaUpload: (media: Media) => void;
  onMediaDelete: (mediaId: number) => void;
  maxFiles?: number;
  acceptedFileTypes?: {
    'image/*': string[];
    'video/*': string[];
  };
  onUploadStart?: () => void;
  onUploadProgress?: (uploaded: number, total: number) => void;
  onUploadComplete?: () => void;
  onUploadError?: (error: string) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  uploadedMedia,
  onMediaUpload,
  onMediaDelete,
  maxFiles = 10,
  acceptedFileTypes = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
  },
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const remainingSlots = maxFiles - uploadedMedia.length;
      const filesToUpload = acceptedFiles.slice(0, remainingSlots);

      if (filesToUpload.length === 0) return;

      // Notify upload start
      onUploadStart?.();

      let uploadedCount = 0;
      let failedCount = 0;

      for (const file of filesToUpload) {
        const fileId = `${file.name}-${Date.now()}`;
        setUploadingFiles(prev => new Set(prev).add(fileId));

        try {
          const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
          const result = await uploadMediaMutation.mutateAsync({
            file,
            media_type: mediaType,
          });

          onMediaUpload(result.data);
          uploadedCount++;
          
          // Notify progress
          onUploadProgress?.(uploadedCount, filesToUpload.length);
        } catch (error) {
          console.error('Upload failed:', error);
          failedCount++;
          onUploadError?.(`Failed to upload ${file.name}`);
        } finally {
          setUploadingFiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(fileId);
            return newSet;
          });
        }
      }

      // Notify upload complete
      if (uploadedCount + failedCount === filesToUpload.length) {
        onUploadComplete?.();
      }
    },
    [uploadedMedia.length, maxFiles, uploadMediaMutation, onMediaUpload, onUploadStart, onUploadProgress, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: maxFiles - uploadedMedia.length,
    disabled: uploadedMedia.length >= maxFiles,
  });

  const handleDeleteMedia = async (mediaId: number) => {
    try {
      await deleteMediaMutation.mutateAsync(mediaId);
      onMediaDelete(mediaId);
    } catch (error: any) {
      console.error('Delete failed:', error);
      // Note: The error will be displayed by the mutation's error state
    }
  };

  const isUploading = uploadingFiles.size > 0;
  const canUpload = uploadedMedia.length < maxFiles;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Media Upload
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Upload images and videos for your property. Maximum {maxFiles} files allowed.
      </Typography>

      {/* Upload Area */}
      <Card
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'primary.50' : 'background.paper',
          cursor: canUpload ? 'pointer' : 'not-allowed',
          opacity: canUpload ? 1 : 0.6,
          transition: 'all 0.2s ease',
          '&:hover': canUpload ? {
            borderColor: 'primary.main',
            backgroundColor: 'primary.50',
          } : {},
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            or click to select files
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            disabled={!canUpload}
          >
            Select Files
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Accepted: Images (JPG, PNG, GIF, WebP) and Videos (MP4, AVI, MOV, etc.)
          </Typography>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Uploading {uploadingFiles.size} file(s)...
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

      {/* Uploaded Media Grid */}
      {uploadedMedia.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Uploaded Media ({uploadedMedia.length}/{maxFiles})
          </Typography>
          <Grid container spacing={2}>
            {uploadedMedia.map((media) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={media.id}>
                <Card sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'relative', height: 200 }}>
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.filename}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.100',
                        }}
                      >
                        <VideoIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                      </Box>
                    )}
                    
                    {/* Media Type Badge */}
                    <Chip
                      icon={media.type === 'image' ? <ImageIcon /> : <VideoIcon />}
                      label={media.type}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                      }}
                    />

                    {/* Delete Button */}
                    <IconButton
                      onClick={() => handleDeleteMedia(media.id)}
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
                  
                  <CardContent sx={{ py: 1 }}>
                    <Typography variant="caption" noWrap>
                      {media.filename}
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      {media.formatted_size}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default MediaUpload;


