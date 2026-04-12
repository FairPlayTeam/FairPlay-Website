import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const isDev = process.env.NODE_ENV === "development";
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "assets.fairplay.video",
  },
];

if (apiBaseUrl) {
  try {
    const { protocol, hostname, port } = new URL(apiBaseUrl);
    remotePatterns.push({
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
      port,
    });
  } catch {
    // Ignore invalid env values to avoid crashing the config at build time.
  }
}

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx"],
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: isDev
      ? [
          ...remotePatterns,
          {
            protocol: "http",
            hostname: "localhost",
            port: "3000",
          },
        ]
      : remotePatterns,
    dangerouslyAllowLocalIP: isDev,
    unoptimized: isDev,
  },
};

export default nextConfig;
