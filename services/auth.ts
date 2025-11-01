import { http } from '@/services/http';
import { setToken, clearToken } from '@/services/token';

type RegisterBody = {
  email: string;
  username: string;
  password: string;
};

type LoginBody = {
  emailOrUsername: string;
  password: string;
};

type User = {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'moderator' | 'admin';
};

type Session = {
  id: string;
  expiresAt: string;
  deviceInfo?: string | null;
  ipAddress?: string | null;
};

type RegisterResponse = {
  message: string;
  user: User;
  sessionKey: string;
  session: Session;
};

type LoginResponse = {
  message: string;
  user: User;
  sessionKey: string;
  session: Session;
};

async function register(body: RegisterBody) {
  const res = await http.post<RegisterResponse>('/auth/register', body);
  if (res.sessionKey) await setToken(res.sessionKey);
  return res;
}

async function login(body: LoginBody) {
  const res = await http.post<LoginResponse>('/auth/login', body);
  if (res.sessionKey) await setToken(res.sessionKey);
  return res;
}

async function logout() {
  await clearToken();
}

export const auth = { register, login, logout };
export type MeResponse = {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  role: 'user' | 'moderator' | 'admin';
};

async function me() {
  return http.get<MeResponse>('/auth/me');
}

export const profile = { me };
