import axios from "axios";
import { getSessionToken } from "@/lib/auth/session";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const sessionKey = getSessionToken()?.trim();
  config.headers = config.headers ?? {};

  if (sessionKey) {
    config.headers.Authorization = `Bearer ${sessionKey}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});
