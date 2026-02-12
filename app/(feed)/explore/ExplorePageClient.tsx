"use client";

import { useCallback, useEffect, useState } from "react";
import { VideoCard } from "@/components/app/video/VideoCard";
import { getVideos, type VideoDetails } from "@/lib/video";
import Spinner from "@/components/ui/Spinner";
import DisclaimerPopup from "@/components/app/layout/DisclaimerPopup";
import { toast } from "@/components/ui/Toast/toast-utils";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

type ExplorePageClientProps = {
  initialVideos: VideoDetails[];
  initialTotalPages?: number;
  initialError?: string | null;
};

export default function ExplorePageClient({
  initialVideos,
  initialTotalPages,
  initialError,
}: ExplorePageClientProps) {
  const pageSize = 24;
  const [videos, setVideos] = useState<VideoDetails[]>(initialVideos);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isLoadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(() => {
    if (typeof initialTotalPages === "number") {
      return 1 < initialTotalPages;
    }
    return initialVideos.length === pageSize;
  });

  const shouldFetchInitial = Boolean(initialError);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      const isFromLandingPage = referrer === "https://fairplay.video/";
      setIsPopupOpen(isFromLandingPage);
    }
  }, []);

  const resolveHasMore = (
    itemsCount: number,
    pageToLoad: number,
    totalPages?: number
  ) => {
    if (typeof totalPages === "number") {
      return pageToLoad < totalPages;
    }
    return itemsCount === pageSize;
  };

  const fetchVideos = useCallback(
    async (pageToLoad: number, mode: "initial" | "more") => {
      try {
        if (mode === "initial") {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const { data } = await getVideos(pageToLoad, pageSize);
        const nextVideos = data.videos ?? [];
        const totalPages = data.pagination?.totalPages;

        setVideos((prev) =>
          pageToLoad === 1 ? nextVideos : [...prev, ...nextVideos]
        );
        setError(null);
        setPage(pageToLoad);
        setHasMore(resolveHasMore(nextVideos.length, pageToLoad, totalPages));
      } catch {
        if (mode === "initial") {
          setError("Unable to load videos. Please try later.");
        }
        toast.error("Error while fetching videos.");
        setHasMore(false);
      } finally {
        if (mode === "initial") {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [pageSize]
  );

  useEffect(() => {
    if (!shouldFetchInitial) return;
    fetchVideos(1, "initial");
  }, [fetchVideos, shouldFetchInitial]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    fetchVideos(page + 1, "more");
  }, [fetchVideos, hasMore, isLoading, isLoadingMore, page]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
  });

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-text">{error || "Failed to load videos."}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              thumbnailUrl={video.thumbnailUrl}
              title={video.title}
              displayName={video.user?.displayName || video.user?.username}
              meta={`${video.viewCount} views • ${new Date(video.createdAt).toLocaleDateString()}`}
              tags={video.tags}
              href={`/video/${video.id}`}
              variant="grid"
            />
          ))}
        </div>
        <div ref={sentinelRef} className="h-1" />
        {isLoadingMore ? (
          <div className="w-full grid place-items-center py-6">
            <Spinner className="size-12" />
          </div>
        ) : null}
      </div>

      <DisclaimerPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
}
