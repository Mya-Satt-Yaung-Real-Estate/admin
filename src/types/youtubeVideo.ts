export interface YoutubeVideo {
  id: number;
  name: string;
  description: string | null;
  youtube_link: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateYoutubeVideoData {
  name: string;
  description?: string | null;
  youtube_link: string;
  status?: boolean;
}

export interface UpdateYoutubeVideoData {
  name?: string;
  description?: string | null;
  youtube_link?: string;
  status?: boolean;
}

export interface YoutubeVideoQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}
