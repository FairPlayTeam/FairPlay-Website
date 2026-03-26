import { api } from "@/lib/api";
import type { User } from "@/lib/users";

export type LoginInput = {
  emailOrUsername: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  username: string;
  password: string;
};

export type AuthSessionResponse = {
  sessionKey: string;
};

export async function getCurrentUser() {
  return api.get<User>("/auth/me");
}

export async function login(input: LoginInput) {
  return api.post<AuthSessionResponse>("/auth/login", input);
}

export async function register(input: RegisterInput) {
  return api.post<void>("/auth/register", input);
}

export async function verifyEmail(token: string) {
  return api.get<AuthSessionResponse>("/auth/verify-email", { params: { token } });
}

export async function resendVerificationEmail(email: string) {
  return api.post<void>("/auth/resend-verification", { email });
}
