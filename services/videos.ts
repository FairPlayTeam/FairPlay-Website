import { http } from '@/services/http';

export type VideoListItem = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  viewCount: string;
  avgRating: number;
  ratingsCount: number;
  createdAt?: string;
  user: { username: string; displayName: string | null };
};

export type VideoListResponse = {
  videos: VideoListItem[];
  pagination: { page: number; limit: number; totalItems: number; totalPages: number; itemsReturned: number };
};

export async function listVideos(page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  return http.get<VideoListResponse>(`/videos?${qs}`);
}

export type MyVideoItem = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  viewCount: string;
  avgRating: number;
  ratingsCount: number;
  visibility: 'public' | 'unlisted' | 'private';
  processingStatus: 'uploading' | 'processing' | 'done' | 'failed';
  moderationStatus: 'pending' | 'approved' | 'rejected';
};

export type MyVideosResponse = {
  videos: MyVideoItem[];
  pagination: { page: number; limit: number; totalItems: number; totalPages: number; itemsReturned: number };
};

export async function listMyVideos(page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  return http.get<MyVideosResponse>(`/videos/my?${qs}`);
}

export async function updateVideo(id: string, payload: { title?: string; description?: string; visibility?: 'public' | 'unlisted' | 'private' }) {
  return http.patch<{ message: string; video: { id: string; title: string; description?: string | null; thumbnailUrl?: string | null } }>(
    `/videos/${encodeURIComponent(id)}`,
    payload
  );
}
