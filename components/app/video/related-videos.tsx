"use client";

import { type VideoDetails } from "@/lib/video";
import { VideoCard } from "./video-card";
import { Spinner } from "@/components/ui/spinner";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";

type RelatedVideosProps = {
  videos: VideoDetails[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export function RelatedVideos({
  videos,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: RelatedVideosProps) {
  const sentinelRef = useInfiniteScroll({
    hasMore: Boolean(onLoadMore) && hasMore,
    isLoading: isLoadingMore,
    onLoadMore: onLoadMore ?? (() => undefined),
  });

  return (
    <div className="px-4 lg:px-0">
      <h2 className="font-semibold text-2xl text-foreground mb-3">Related Videos</h2>

      <div className="flex flex-col">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
            displayName={video.user?.displayName || video.user?.username}
            meta={`${video.viewCount} views • ${new Date(video.createdAt).toLocaleDateString()}`}
            href={`/video/${video.id}`}
            variant="list"
          />
        ))}

        {onLoadMore && <div ref={sentinelRef} className="h-1" />}

        {isLoadingMore && (
          <div className="grid w-full place-items-center py-6">
            <Spinner className="size-10" />
          </div>
        )}
      </div>
    </div>
  );
}
