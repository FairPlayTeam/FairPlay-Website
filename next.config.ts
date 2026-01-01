import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiUrl = apiBaseUrl ? `${apiBaseUrl}/assets/**` : null;
const isDev = process.env.NODE_ENV === "development";
const remotePatterns: NextConfig["images"]["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "assets.fairplay.video",
    pathname: "/users/**",
  },
  {
    protocol: "https",
    hostname: "assets.fairplay.video",
    pathname: "/videos/**",
  },
];

if (apiUrl) {
  try {
    remotePatterns.push(new URL(apiUrl));
  } catch {
    // Ignore invalid env values to avoid crashing the config at build time.
  }
}

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx"],
  images: {
    dangerouslyAllowLocalIP: isDev,
    remotePatterns,
  },
};

export default nextConfig;
