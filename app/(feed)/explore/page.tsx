import ExplorePageClient from "./ExplorePageClient";
import type { VideoDetails, VideosResponse } from "@/lib/video";

const pageSize = 24;

async function fetchInitialVideos(): Promise<{
  videos: VideoDetails[];
  totalPages?: number;
  error?: string;
}> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    return {
      videos: [],
      error: "env variable NEXT_PUBLIC_API_BASE_URL is not defined",
    };
  }

  const res = await fetch(
    `${apiBase}/videos?page=1&limit=${pageSize}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    return {
      videos: [],
      error: "Unable to load videos. Please try later.",
    };
  }

  const data = (await res.json()) as VideosResponse;
  return {
    videos: data.videos ?? [],
    totalPages: data.pagination?.totalPages,
  };
}

export default async function ExplorePage() {
  const { videos, totalPages, error } = await fetchInitialVideos();

  return (
    <ExplorePageClient
      initialVideos={videos}
      initialTotalPages={totalPages}
      initialError={error}
    />
  );
}
