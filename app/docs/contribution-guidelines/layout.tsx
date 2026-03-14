import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OPEN_GRAPH_IMAGE,
  SITE_NAME,
  TWITTER_HANDLE,
} from "@/lib/seo";

const title = "Contribution Guidelines";
const description =
  "Set up FairPlay locally and follow the contribution guidelines.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/docs/contribution-guidelines",
  },
  openGraph: {
    title,
    description,
    url: "/docs/contribution-guidelines",
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

export default function ContributionGuidelinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
