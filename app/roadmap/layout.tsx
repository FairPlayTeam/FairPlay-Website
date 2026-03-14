import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OPEN_GRAPH_IMAGE,
  SITE_NAME,
  TWITTER_HANDLE,
} from "@/lib/seo";

const title = "Roadmap";
const description = "Track FairPlay's roadmap and upcoming milestones.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/roadmap",
  },
  openGraph: {
    title,
    description,
    url: "/roadmap",
    type: "article",
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

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
