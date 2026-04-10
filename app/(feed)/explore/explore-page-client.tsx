"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VideoCard } from "@/components/app/video/video-card";
import { getVideos, type VideoDetails } from "@/lib/video";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";

const PAGE_SIZE = 24;

function mergeUniqueById(prev: VideoDetails[], next: VideoDetails[]) {
  if (next.length === 0) return prev;
  const seen = new Set(prev.map((item) => item.id));
  const merged = [...prev];

  for (const item of next) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  return merged;
}

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
  const params = useSearchParams();

  const shouldFetchInit = Boolean(initialError);

  const [videos, setVideos] = useState<VideoDetails[]>(initialVideos);
  const [isLoading, setLoading] = useState<boolean>(shouldFetchInit);
  const [isLoadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(
    shouldFetchInit ? null : (initialError ?? null),
  );

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(params.has("popup"));

  const [page, setPage] = useState<number>(1);

  const [hasMore, setHasMore] = useState<boolean>(() => {
    if (typeof initialTotalPages === "number") {
      return 1 < initialTotalPages;
    }
    return initialVideos.length === PAGE_SIZE;
  });

  const resolveHasMore = (itemsCount: number, pageToLoad: number, totalPages?: number) => {
    if (typeof totalPages === "number") {
      return pageToLoad < totalPages;
    }
    return itemsCount === PAGE_SIZE;
  };

  const fetchVideos = useCallback(async (pageToLoad: number, mode: "initial" | "more") => {
    try {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const { data } = await getVideos(pageToLoad, PAGE_SIZE);
      const nextVideos = data.videos ?? [];
      const totalPages = data.pagination?.totalPages;

      setVideos((prev) => (pageToLoad === 1 ? nextVideos : mergeUniqueById(prev, nextVideos)));
      setError(null);
      setPage(pageToLoad);
      setHasMore(resolveHasMore(nextVideos.length, pageToLoad, totalPages));
    } catch {
      if (mode === "initial") {
        setError("Unable to load videos. Please try later.");
      }
      toast.error("Error while fetching videos.", { position: "bottom-right" });
      setHasMore(false);
    } finally {
      if (mode === "initial") {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!shouldFetchInit) return;
    fetchVideos(1, "initial");
  }, [fetchVideos, shouldFetchInit]);

  useEffect(() => {
    setIsPopupOpen(params.has("popup"));
  }, [params]);

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
        <Spinner className="size-18" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-muted-foreground">{error || "Failed to load videos."}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4">
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
            <Spinner className="size-14" />
          </div>
        ) : null}
      </div>

      <AlertDialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hang on a sec...</AlertDialogTitle>
            <AlertDialogDescription>
              This part of the website is currently under development. This environment is for development
              purposes only.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsPopupOpen(false)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
