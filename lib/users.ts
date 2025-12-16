import { api } from '@/lib/api';

export type PublicUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  createdAt: string;
  isFollowing?: boolean;
};

export async function getUser(idOrUsername: string) {
  return api.get<PublicUser>(`/user/${encodeURIComponent(idOrUsername)}`);
}

export type UserVideoItem = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  viewCount: string;
  thumbnailUrl: string | null;
};

export type UserVideosResponse = {
  videos: UserVideoItem[];
  pagination: { page: number; limit: number; totalItems: number; totalPages: number; itemsReturned: number };
};

export async function getUserVideos(idOrUsername: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  return api.get<UserVideosResponse>(`/user/${encodeURIComponent(idOrUsername)}/videos?${qs}`);
}

export type SimpleUser = { id: string; username: string; displayName: string | null; avatarUrl: string | null };
export type PagedUsers = { users?: SimpleUser[]; followers?: SimpleUser[]; following?: SimpleUser[]; pagination: { page: number; limit: number; totalItems: number; totalPages: number; itemsReturned: number } };

export async function getFollowers(idOrUsername: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  const res = await api.get<{ followers: SimpleUser[]; pagination: PagedUsers['pagination'] }>(`/user/${encodeURIComponent(idOrUsername)}/followers?${qs}`);
  return res;
}

export async function getFollowing(idOrUsername: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  const res = await api.get<{ following: SimpleUser[]; pagination: PagedUsers['pagination'] }>(`/user/${encodeURIComponent(idOrUsername)}/following?${qs}`);
  return res;
}

export async function followUser(idOrUsername: string) {
  return api.post<void>(`/user/${encodeURIComponent(idOrUsername)}/follow`);
}

export async function unfollowUser(idOrUsername: string) {
  return api.delete<void>(`/user/${encodeURIComponent(idOrUsername)}/follow`);
}