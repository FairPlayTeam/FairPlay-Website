import { api } from "@/lib/api";
import { Pagination } from "@/lib/video";
export type UserRole = "user" | "moderator" | "admin";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  isBanned: boolean;
  banReasonPrivate?: string | null;
  bannedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;

  followerCount: number;
  followingCount: number;
  videoCount: number;
  totalViews: string;
}

export type BaseUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

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

export type PagedUsers = {
  users?: BaseUser[];
  followers?: BaseUser[];
  following?: BaseUser[];
  pagination: Pagination;
};

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
  pagination: Pagination;
};

export type MyVideoItem = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  thumbnailUrl: string | null;
  viewCount: string;
  avgRating: number;
  ratingsCount: number;
  visibility: "public" | "unlisted" | "private";
  processingStatus: "uploading" | "processing" | "done" | "failed";
  moderationStatus: "pending" | "approved" | "rejected";
};

export type MyVideosResponse = {
  videos: MyVideoItem[];
  pagination: Pagination;
};

export type UpdateProfileData = {
  username?: string;
  displayName?: string;
  bio?: string;
};

export type Session = {
  id: string;
  sessionKey: string;
  ipAddress?: string | null;
  deviceInfo: string | null;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
};

type SessionsResponse = {
  sessions: Session[];
  total: number;
};

export async function getUser(idOrUsername: string) {
  return api.get<PublicUser>(`/user/${encodeURIComponent(idOrUsername)}`);
}

export async function getUserVideos(idOrUsername: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  return api.get<UserVideosResponse>(`/user/${encodeURIComponent(idOrUsername)}/videos?${qs}`);
}

export async function getUserServer(
  idOrUsername: string,
  init?: RequestInit,
): Promise<{ data: PublicUser | null; status: number }> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const res = await fetch(`${apiBase}/user/${encodeURIComponent(idOrUsername)}`, init);
  const status = res.status;

  if (status === 404) {
    return { data: null, status: 404 };
  }

  if (!res.ok) {
    return { data: null, status };
  }

  return { data: (await res.json()) as PublicUser, status };
}

export async function getUserVideosServer(
  idOrUsername: string,
  page = 1,
  limit = 20,
  init?: RequestInit,
): Promise<{ data: UserVideosResponse | null; status: number }> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  const res = await fetch(`${apiBase}/user/${encodeURIComponent(idOrUsername)}/videos?${qs}`, init);
  const status = res.status;

  if (!res.ok) {
    return { data: null, status };
  }

  return { data: (await res.json()) as UserVideosResponse, status };
}

export async function getMyVideos(page = 1, limit = 20) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  return api.get<MyVideosResponse>(`/videos/my?${qs}`);
}

export async function getFollowers(idOrUsername: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  const res = await api.get<{
    followers: BaseUser[];
    pagination: PagedUsers["pagination"];
  }>(`/user/${encodeURIComponent(idOrUsername)}/followers?${qs}`);

  return res;
}

export async function getFollowing(idOrUsername: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  const res = await api.get<{
    following: BaseUser[];
    pagination: PagedUsers["pagination"];
  }>(`/user/${encodeURIComponent(idOrUsername)}/following?${qs}`);

  return res;
}

export async function followUser(idOrUsername: string) {
  return api.post<void>(`/user/${encodeURIComponent(idOrUsername)}/follow`);
}

export async function unfollowUser(idOrUsername: string) {
  return api.delete<void>(`/user/${encodeURIComponent(idOrUsername)}/follow`);
}

export async function updateProfile(data: UpdateProfileData) {
  return api.patch<PublicUser>("/auth/me", data);
}

export async function getSessions() {
  return api.get<SessionsResponse>("/auth/sessions");
}

export async function revokeSession(sessionId: string) {
  return api.delete<void>(`/auth/sessions/${sessionId}`);
}

export async function logoutAllSessions() {
  return api.delete<{ message: string; sessionsLoggedOut: number }>("/auth/sessions/all");
}

export async function logoutOtherSessions() {
  return api.delete<{ message: string; sessionsLoggedOut: number }>("/auth/sessions/others/all");
}

export async function logoutCurrentSession(): Promise<void> {
  const { data } = await getSessions();
  const currentSession = data.sessions.find((s) => s.isCurrent);

  if (!currentSession) {
    throw new Error("No current session found");
  }

  await revokeSession(currentSession.id);
}
