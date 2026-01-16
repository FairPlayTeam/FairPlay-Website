import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OPEN_GRAPH_IMAGE,
  SITE_NAME,
  TWITTER_HANDLE,
} from "@/lib/seo";

const title = "Documentation";
const description =
  "Learn how FairPlay works and how to contribute to the open-source streaming platform.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title,
    description,
    url: "/docs",
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

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
