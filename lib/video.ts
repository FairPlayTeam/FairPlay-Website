import { api } from "@/lib/api";
import { BaseUser } from "./users";

export type HlsInfo = {
  master: string | null;
  variants?: Record<string, string | null>;
  available?: string[];
  preferred?: string;
};

export type VideoDetails = {
  id: string;
  title: string;
  hls: HlsInfo;
  thumbnailUrl: string | null;
  duration: number | null;
  viewCount: string;
  avgRating: number;
  userRating?: number | null;
  ratingsCount: number;
  description?: string | null;
  tags?: string[] | null;
  allowComments: boolean;
  license?: string | null;
  createdAt: string;
  userId: string;
  user?: BaseUser;
};

export type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  itemsReturned: number;
};

export type SearchVideosResponse = {
  results: SearchResultItem[];
  videos: VideoDetails[];
  creators: SearchCreator[];
  pagination: SearchPagination;
  query: { q: string };
};

export type SearchCreator = BaseUser & {
  followerCount: number;
  videoCount: number;
  createdAt: string;
};

export type SearchResultItem =
  | {
      type: "video";
      video: VideoDetails;
    }
  | {
      type: "creator";
      creator: SearchCreator;
    };

export type SearchPagination = {
  videos: Pagination;
  creators: Pagination;
  results: Pagination;
};

export type VideosResponse = {
  videos: VideoDetails[];
  pagination: Pagination;
};

export async function searchVideos(query: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(limit),
  }).toString();

  return api.get<SearchVideosResponse>(`/videos/search?${qs}`);
}

export async function getVideo(id: string) {
  return api.get<VideoDetails>(`/videos/${encodeURIComponent(id)}`);
}

export async function getVideoServer(id: string, init?: RequestInit) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const res = await fetch(`${apiBase}/videos/${encodeURIComponent(id)}`, init);
  const status = res.status;

  if (status === 404) {
    return { video: null, status: 404 as const };
  }

  if (!res.ok) {
    return { video: null, status };
  }

  return { video: (await res.json()) as VideoDetails, status };
}

export async function getVideos(page = 1, limit = 24) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  return api.get<VideosResponse>(`/videos?${qs}`);
}

export async function getVideosServer(page = 1, limit = 24, init?: RequestInit) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  const res = await fetch(`${apiBase}/videos?${qs}`, init);
  const status = res.status;

  if (!res.ok) {
    return { data: null, status };
  }

  return { data: (await res.json()) as VideosResponse, status };
}

export async function rateVideo(videoId: string, score: number) {
  return api.post<{ message: string }>(`/videos/${encodeURIComponent(videoId)}/rating`, { score });
}

export async function deleteVideo(videoId: string) {
  return api.delete<{ message: string }>(`/videos/${encodeURIComponent(videoId)}`);
}
