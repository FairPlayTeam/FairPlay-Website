import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ChannelPageClient from "./ChannelPageClient";
import type { PublicUser, UserVideoItem, UserVideosResponse } from "@/lib/users";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OPEN_GRAPH_IMAGE,
  SITE_NAME,
  TWITTER_HANDLE,
  getAbsoluteUrl,
} from "@/lib/seo";

const pageSize = 10;
type Params = { username: string };

const fetchChannelData = cache(async (username: string): Promise<{
  user: PublicUser | null;
  videos: UserVideoItem[];
  totalPages?: number;
}> => {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const encodedUsername = encodeURIComponent(username);
  const [userRes, videosRes] = await Promise.all([
    fetch(`${apiBase}/user/${encodedUsername}`, {
      next: { revalidate: 300 },
    }),
    fetch(`${apiBase}/user/${encodedUsername}/videos?page=1&limit=${pageSize}`, {
      next: { revalidate: 60 },
    }),
  ]);

  if (userRes.status === 404) {
    return { user: null, videos: [] };
  }

  if (!userRes.ok) {
    throw new Error("Failed to fetch channel details");
  }

  const user = (await userRes.json()) as PublicUser;

  if (!videosRes.ok) {
    throw new Error("Failed to fetch channel videos");
  }

  const videosData = (await videosRes.json()) as UserVideosResponse;
  return {
    user,
    videos: videosData.videos ?? [],
    totalPages: videosData.pagination?.totalPages,
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;

  const { user } = await fetchChannelData(username);

  if (!user) {
    return {
      title: "Channel not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const displayName = user.displayName || user.username;
  const description =
    user.bio?.trim() || `Watch videos from ${displayName} on FairPlay.`;
  const canonical = `/channel/${encodeURIComponent(user.username)}`;
  const imageUrl = getAbsoluteUrl(user.bannerUrl || user.avatarUrl || null);
  const openGraphImages = imageUrl
    ? [{ url: imageUrl }]
    : [DEFAULT_OPEN_GRAPH_IMAGE];
  const twitterImages = imageUrl ? [imageUrl] : [DEFAULT_OG_IMAGE];

  return {
    title: displayName,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: displayName,
      description,
      url: canonical,
      type: "website",
      siteName: SITE_NAME,
      images: openGraphImages,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: displayName,
      description,
      images: twitterImages,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  
  const data = await fetchChannelData(username);
  if (!data.user) {
    notFound();
  }

  return (
    <ChannelPageClient
      username={username}
      initialUser={data.user}
      initialVideos={data.videos}
      initialTotalPages={data.totalPages}
    />
  );
}