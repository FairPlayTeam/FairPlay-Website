import { http } from '@/services/http';

export type Me = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  role: string;
  isVerified: boolean;
  followerCount?: number;
  totalViews?: string;
  totalEarnings?: string;
  createdAt: string;
};

export async function getMe() {
  return http.get<Me>('/auth/me');
}

export async function updateMe(body: { displayName?: string; bio?: string }) {
  return http.patch<{ message: string; user: Me }>('/auth/me', body);
}

export type Session = {
  id: string;
  sessionKey: string;
  ipAddress: string;
  deviceInfo: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export async function listSessions() {
  return http.get<{ sessions: Session[]; total: number }>('/auth/sessions');
}

export async function revokeSession(sessionId: string) {
  return http.del<{ message: string }>(`/auth/sessions/${encodeURIComponent(sessionId)}`);
}

export async function logoutAllSessions() {
  return http.del<{ message: string; sessionsLoggedOut: number }>("/auth/sessions/all");
}

export async function logoutOtherSessions() {
  return http.del<{ message: string; sessionsLoggedOut: number }>("/auth/sessions/others/all");
}

export async function uploadAvatar(file: { uri: string; name: string; type: string }) {
  const form = new FormData();
  form.append('avatar', file as any);
  return http.post<{ message: string; storagePath: string; size: number; mimetype: string }>(
    '/upload/avatar',
    form
  );
}

export async function uploadBanner(file: { uri: string; name: string; type: string }) {
  const form = new FormData();
  form.append('banner', file as any);
  return http.post<{ message: string; storagePath: string; size: number; mimetype: string }>(
    '/upload/banner',
    form
  );
}
