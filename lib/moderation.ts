import { api } from './api';

export type ModVideoItem = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  processingStatus: 'uploading' | 'processing' | 'done';
  moderationStatus: 'pending' | 'approved' | 'rejected';
  visibility: 'public' | 'unlisted' | 'private';
  user: { id: string; username: string; displayName: string | null };
  createdAt: string;

  description: string | null;
  viewCount: string;
  avgRating: number;
  ratingsCount: number;
};

export type ModVideosResponse = {
  videos: ModVideoItem[];
  pagination: { page: number; limit: number; totalItems: number; totalPages: number; itemsReturned: number };
};

export async function listModeratorVideos(params: {
  page?: number;
  limit?: number;
  processingStatus?: 'uploading' | 'processing' | 'done';
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  visibility?: 'public' | 'unlisted' | 'private';
  userId?: string;
  search?: string;
  sort?: string;
} = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.processingStatus) q.set('processingStatus', params.processingStatus);
  if (params.moderationStatus) q.set('moderationStatus', params.moderationStatus);
  if (params.visibility) q.set('visibility', params.visibility);
  if (params.userId) q.set('userId', params.userId);
  if (params.search) q.set('search', params.search);
  if (params.sort) q.set('sort', params.sort);
  const qs = q.toString();
  return api.get<ModVideosResponse>(`/moderator/videos${qs ? `?${qs}` : ''}`);
}

export async function updateModeration(id: string, action: 'approve' | 'reject') {
  return api.patch<{ message: string; video: { id: string; title: string; moderationStatus: 'approved' | 'rejected'; processingStatus: 'uploading' | 'processing' | 'done' } }>(`/moderator/videos/${id}/moderation`, { action });
}