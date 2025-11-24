import axios from "axios";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined")
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const sessionKey = localStorage.getItem("auth-session-key");

  if (sessionKey) {
    config.headers["authorization"] = `Bearer ${sessionKey}`;
  }

  return config;
})