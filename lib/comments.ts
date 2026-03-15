import { api } from "@/lib/api";
import { Pagination } from "./video";

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
  pagination: Pagination;
};

export async function getVideoComments(
  videoId: string,
  params?: {
    page?: number;
    limit?: number;
    repliesLimit?: number;
    childRepliesLimit?: number;
  },
) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.repliesLimit) q.set("repliesLimit", String(params.repliesLimit));
  if (params?.childRepliesLimit) q.set("childRepliesLimit", String(params.childRepliesLimit));

  const qs = q.toString();
  return api.get<CommentsResponse>(
    `/videos/${encodeURIComponent(videoId)}/comments${qs ? `?${qs}` : ""}`,
  );
}

export async function addComment(videoId: string, content: string, parentId?: string) {
  return api.post<{ message: string; comment: CommentItem }>(
    `/videos/${encodeURIComponent(videoId)}/comments`,
    { content, parentId },
  );
}

export async function likeComment(commentId: string) {
  return api.post<{ message: string; likeCount: number }>(
    `/comments/${encodeURIComponent(commentId)}/like`,
  );
}

export async function unlikeComment(commentId: string) {
  return api.delete<{ message: string; likeCount: number }>(
    `/comments/${encodeURIComponent(commentId)}/like`,
  );
}

export async function getCommentReplies(commentId: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  return api.get<{
    replies: CommentItem[];
    pagination: Pagination;
  }>(`/comments/${encodeURIComponent(commentId)}/replies?${qs}`);
}

export async function deleteComment(commentId: string) {
  return api.delete<{ message: string }>(`/comments/${encodeURIComponent(commentId)}`);
}
