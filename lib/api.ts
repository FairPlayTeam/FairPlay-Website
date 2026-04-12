import axios from "axios";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
}

export const api = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
});
