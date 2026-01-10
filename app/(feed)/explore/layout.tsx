import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OPEN_GRAPH_IMAGE,
  SITE_NAME,
  TWITTER_HANDLE,
} from "@/lib/seo";

const title = "Explore";
const description = "Discover the latest videos and creators on FairPlay.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title,
    description,
    url: "/explore",
    type: "website",
    siteName: SITE_NAME,
    images: [DEFAULT_OPEN_GRAPH_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [DEFAULT_OG_IMAGE],
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
