import type { NextConfig } from "next";

const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/assets/**`;
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx"],
  images: {
    dangerouslyAllowLocalIP:isDev,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tilbgoymzrpnhzlqsvgj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      new URL(apiUrl),
    ],
  },
};

export default nextConfig;
