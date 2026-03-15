import { getToken } from "@/lib/token";
import axios from "axios";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const sessionKey = getToken()?.trim();
  config.headers = config.headers ?? {};

  if (sessionKey) {
    config.headers.Authorization = `Bearer ${sessionKey}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});
