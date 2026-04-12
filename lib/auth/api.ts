import axios from "axios";
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

export async function getCurrentUser() {
  return api.get<User>("/auth/me");
}

export async function login(input: LoginInput) {
  return axios.post<{ success: boolean }>("/api/auth/login", input, { withCredentials: true });
}

export async function register(input: RegisterInput) {
  return api.post<void>("/auth/register", input);
}

export async function verifyEmail(token: string) {
  return axios.get<{ success: boolean }>("/api/auth/verify-email", {
    params: { token },
    withCredentials: true,
  });
}

export async function resendVerificationEmail(email: string) {
  return api.post<void>("/auth/resend-verification", { email });
}

export async function logout() {
  return axios.post<{ success: boolean }>("/api/auth/logout", undefined, { withCredentials: true });
}

export async function clearAuthSession() {
  return axios.delete<{ success: boolean }>("/api/auth/session", { withCredentials: true });
}
