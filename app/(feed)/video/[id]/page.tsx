import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { VideoDetails } from "@/lib/video";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OPEN_GRAPH_IMAGE,
  SITE_NAME,
  TWITTER_HANDLE,
  getAbsoluteUrl,
} from "@/lib/seo";
import VideoPageClient from "./video-page-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

const FALLBACK_TITLE = "FairPlay";
const FALLBACK_DESCRIPTION = "Watch on FairPlay.";

const fetchVideo = cache(async (id: string): Promise<VideoDetails | null> => {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const res = await fetch(`${apiBase}/videos/${encodeURIComponent(id)}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch video details");
  }

  return (await res.json()) as VideoDetails;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await fetchVideo(id);
  const title = video?.title?.trim() || FALLBACK_TITLE;
  const description = video?.description?.trim() || FALLBACK_DESCRIPTION;
  const canonical = `/video/${encodeURIComponent(id)}`;
  const imageUrl = getAbsoluteUrl(video?.thumbnailUrl ?? null);
  const openGraphImages = imageUrl
    ? [{ url: imageUrl }]
    : [DEFAULT_OPEN_GRAPH_IMAGE];
  const twitterImages = imageUrl ? [imageUrl] : [DEFAULT_OG_IMAGE];

  if (!video) {
    return {
      title: "Video not found",
      robots: {
        index: true,
        follow: false,
      },
    };
  }

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "video.other",
      siteName: SITE_NAME,
      images: openGraphImages,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: twitterImages,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;
  const video = await fetchVideo(id);
  if (!video) {
    notFound();
  }
  return <VideoPageClient videoId={id} />;
}
