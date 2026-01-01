import type { Metadata } from "next";
import { VideoDetails } from "@/lib/video";
import VideoPageClient from "./video-page-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

const FALLBACK_TITLE = "FairPlay";
const FALLBACK_DESCRIPTION = "Watch on FairPlay.";

async function fetchVideo(id: string): Promise<VideoDetails | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) return null;

  try {
    const res = await fetch(
      `${apiBase}/videos/${encodeURIComponent(id)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return (await res.json()) as VideoDetails;
  } catch {
    return null;
  }
}

function getAbsoluteUrl(url: string | null, base?: URL) {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return base ? new URL(url, base).toString() : undefined;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await fetchVideo(id);
  const title = video?.title?.trim() || FALLBACK_TITLE;
  const description = video?.description?.trim() || FALLBACK_DESCRIPTION;
  const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined;
  const imageUrl = getAbsoluteUrl(video?.thumbnailUrl ?? null, metadataBase);

  return {
    title,
    description,
    metadataBase,
    openGraph: {
      title,
      description,
      type: "video.other",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;
  return <VideoPageClient videoId={id} />;
}
