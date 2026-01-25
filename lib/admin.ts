import { api } from "@/lib/api";

export type AdminUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  role: "user" | "moderator" | "admin";
  isActive: boolean;
  isVerified: boolean;
  isBanned: boolean;
  banReasonPublic: string | null;
  createdAt: string;
  followerCount?: number;
  followingCount?: number;
  videoCount?: number;
  totalViews?: string;
};

export type AdminUsersResponse = {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    itemsReturned: number;
  };
};

export async function adminListUsers(
  params: {
    search?: string;
    isBanned?: "true" | "false";
    page?: number;
    limit?: number;
    sort?: string;
  } = {}
) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.isBanned) q.set("isBanned", params.isBanned);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.sort) q.set("sort", params.sort);
  const qs = q.toString();
  return api.get<AdminUsersResponse>(`/admin/users${qs ? `?${qs}` : ""}`);
}

export async function adminGetUser(id: string) {
  return api.get<AdminUser>(`/admin/users/${id}`);
}

export async function adminUpdateRole(
  id: string,
  role: "user" | "moderator" | "admin"
) {
  return api.patch<{ message: string; user: AdminUser }>(
    `/admin/users/${id}/role`,
    { role }
  );
}

export async function adminUpdateBan(
  id: string,
  isBanned: boolean,
  publicReason?: string,
  privateReason?: string
) {
  return api.patch<{ message: string; user: AdminUser }>(
    `/admin/users/${id}/ban`,
    { isBanned, publicReason, privateReason }
  );
}
