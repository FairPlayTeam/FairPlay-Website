type JSON = Record<string, unknown>;

export type VideoProcessingStatus = "uploading" | "processing" | "done";

export type VideoModerationStatus = "pending" | "approved" | "rejected";

export type VideoVisibility = "public" | "unlisted" | "private";

export type UserRole = "user" | "moderator" | "admin";

export type TransactionType = "donation" | "subscription" | "ad_revenue";

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  isBanned: boolean;
  banReasonPublic?: string | null;
  banReasonPrivate?: string | null;
  bannedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;

  followerCount: number;
  followingCount: number;
  videoCount: number;
  totalViews: string;
  totalEarnings: string;
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  duration?: number | null;
  tags: string[];
  viewCount: string;
  likeCount: number;
  processingStatus: VideoProcessingStatus;
  moderationStatus: VideoModerationStatus;
  visibility: VideoVisibility;
  allowComments: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  storagePath?: string | null;
  qualities?: JSON;
}

export interface Rating {
  id: string;
  userId: string;
  videoId: string;
  score: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  videoId: string;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
}

export interface CommentLike {
  id: string;
  userId: string;
  commentId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  fromUserId?: string | null;
  toUserId: string;
  type: TransactionType;
  amount: string;
  description?: string | null;
  metadata?: JSON;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Session {
  id: string;
  sessionKey: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo?: string | null;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
}
