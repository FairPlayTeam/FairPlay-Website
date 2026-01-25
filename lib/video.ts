import { api } from "@/lib/api";

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
  viewCount: string;
  avgRating: number;
  ratingsCount: number;
  description?: string | null;
  tags?: string[] | null;
  createdAt: string;
  userId: string;
  user?: {
    username: string;
    displayName: string | null;
    avatarUrl?: string | null;
    id?: string;
  };
};

export type SearchVideosResponse = {
  videos: VideoDetails[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    itemsReturned: number;
  };
  query: { q: string };
};

export type VideosResponse = {
  videos: VideoDetails[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    itemsReturned: number;
  };
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
  if (!res.ok) {
    throw new Error("Failed to fetch video details");
  }
  return { data: (await res.json()) as VideoDetails };
}

export async function getVideos(page = 1, limit = 24) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();
  return api.get<VideosResponse>(`/videos?${qs}`);
}

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByMe?: boolean;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  _count?: { replies: number };
  replies?: CommentItem[];
};

export type CommentsResponse = {
  comments: CommentItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    itemsReturned: number;
  };
};

export async function getVideoComments(
  videoId: string,
  params?: {
    page?: number;
    limit?: number;
    repliesLimit?: number;
    childRepliesLimit?: number;
  }
) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.repliesLimit) q.set("repliesLimit", String(params.repliesLimit));
  if (params?.childRepliesLimit)
    q.set("childRepliesLimit", String(params.childRepliesLimit));
  const qs = q.toString();
  return api.get<CommentsResponse>(
    `/videos/${encodeURIComponent(videoId)}/comments${qs ? `?${qs}` : ""}`
  );
}

export async function addComment(
  videoId: string,
  content: string,
  parentId?: string
) {
  return api.post<{ message: string; comment: CommentItem }>(
    `/videos/${encodeURIComponent(videoId)}/comments`,
    { content, parentId }
  );
}

export async function rateVideo(videoId: string, score: number) {
  return api.post(`/videos/${encodeURIComponent(videoId)}/rating`, { score });
}

export async function likeComment(commentId: string) {
  return api.post<{ message: string; likeCount: number }>(
    `/comments/${encodeURIComponent(commentId)}/like`
  );
}

export async function unlikeComment(commentId: string) {
  return api.delete<{ message: string; likeCount: number }>(
    `/comments/${encodeURIComponent(commentId)}/like`
  );
}

export async function getCommentReplies(
  commentId: string,
  page = 1,
  limit = 20
) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();
  return api.get<{
    replies: CommentItem[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      itemsReturned: number;
    };
  }>(`/comments/${encodeURIComponent(commentId)}/replies?${qs}`);
}

export async function deleteComment(commentId: string) {
  return api.delete<{ message: string }>(
    `/comments/${encodeURIComponent(commentId)}`
  );
}

export async function deleteVideo(videoId: string) {
  return api.delete<{ message: string }>(
    `/videos/${encodeURIComponent(videoId)}`
  );
}
