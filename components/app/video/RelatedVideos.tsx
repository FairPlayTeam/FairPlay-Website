"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { VideoDetails } from "@/lib/video";
import { VideoCard } from "@/components/app/video/VideoCard";
import Spinner from "@/components/ui/Spinner";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

interface RelatedVideosProps {
  videos: VideoDetails[];
  currentVideoId: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function RelatedVideos({
  videos,
  currentVideoId,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: RelatedVideosProps) {
  const router = useRouter();

  const filteredVideos = useMemo(
    () => videos.filter((v) => v.id !== currentVideoId),
    [videos, currentVideoId]
  );

  const handleVideoPress = (id: string) => {
    router.push(`/video/${id}`);
  };

  const sentinelRef = useInfiniteScroll({
    hasMore: Boolean(onLoadMore) && hasMore,
    isLoading: isLoadingMore,
    onLoadMore: onLoadMore ?? (() => undefined),
  });

  return (
    <div className="space-y-4 mx-4">
      <h2 className="font-semibold text-2xl text-text">Related Videos</h2>

      <div className="flex flex-col">
        {filteredVideos.map((video) => (
          <VideoCard
            key={video.id}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
            displayName={video.user?.displayName || video.user?.username}
            meta={`${video.viewCount} views • ${new Date(video.createdAt).toLocaleDateString()}`}
            onPress={() => handleVideoPress(video.id)}
            variant="list"
          />
        ))}
        {onLoadMore ? <div ref={sentinelRef} className="h-1" /> : null}
        {isLoadingMore ? (
          <div className="w-full grid place-items-center py-6">
            <Spinner className="size-6" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
