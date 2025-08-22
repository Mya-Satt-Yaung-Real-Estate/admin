export interface Media {
  id: number;
  type: 'image' | 'video';
  filename: string;
  size: number;
  formatted_size: string;
  mime_type: string;
  is_primary: boolean | null;
  status: 'uploading' | 'completed' | 'failed';
  url: string;
  created_at: string;
}

export interface UploadMediaRequest {
  file: File;
  media_type: 'image' | 'video';
}

export interface UploadMediaResponse {
  success: boolean;
  message: string;
  data: Media;
}


