import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const isDev = process.env.NODE_ENV === "development";
const remoteImageHostnames = ["assets.fairplay.video"];

if (apiBaseUrl) {
  try {
    const { hostname } = new URL(apiBaseUrl);
    if (hostname && !remoteImageHostnames.includes(hostname)) {
      remoteImageHostnames.push(hostname);
    }
  } catch {
    // Ignore invalid env values to avoid crashing the config at build time.
  }
}

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx"],
  images: {
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: remoteImageHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};

export default nextConfig;
