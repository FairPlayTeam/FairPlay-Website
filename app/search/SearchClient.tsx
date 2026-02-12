"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { searchVideos, VideoDetails } from "@/lib/video";
import { VideoCard } from "@/components/app/video/VideoCard";
import Spinner from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast/toast-utils";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function SearchClient() {
  const pageSize = 10;
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<VideoDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const queryRef = useRef(query);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const resolveHasMore = (
    itemsCount: number,
    pageToLoad: number,
    totalPages?: number
  ) => {
    if (typeof totalPages === "number") {
      return pageToLoad < totalPages && itemsCount > 0;
    }
    return itemsCount === pageSize;
  };

  const fetchResults = useCallback(
    async (pageToLoad: number, mode: "initial" | "more") => {
      if (!query.trim()) return;

      try {
        if (mode === "initial") {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const res = await searchVideos(query, pageToLoad, pageSize);
        if (queryRef.current !== query) return;

        const nextResults = res.data.videos ?? [];
        const totalPages = res.data.pagination?.totalPages;
        const noResults = pageToLoad === 1 && nextResults.length === 0;

        setResults((prev) =>
          pageToLoad === 1 ? nextResults : [...prev, ...nextResults]
        );
        setPage(pageToLoad);
        setHasMore(resolveHasMore(nextResults.length, pageToLoad, totalPages));
        setError(noResults ? "No results found." : null);
      } catch (err: unknown) {
        if (queryRef.current !== query) return;

        toast.error("Error while searching.");
        const errorMessage =
          err instanceof Error ? err.message : "Error while searching.";
        setError(
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || errorMessage
        );
        setResults([]);
        setHasMore(false);
      } finally {
        if (queryRef.current !== query) return;
        if (mode === "initial") {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [pageSize, query]
  );

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setHasMore(false);
      setPage(1);
      return;
    }

    fetchResults(1, "initial");
  }, [fetchResults, query]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchResults(page + 1, "more");
  }, [fetchResults, hasMore, loading, loadingMore, page]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: loading || loadingMore,
    onLoadMore: loadMore,
  });

  if (loading) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-16" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Results for &quot;{query}&quot;
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && results.length === 0 && <p>No video found.</p>}

      <ul className="flex flex-col gap-1">
        {results.map((video) => (
          <VideoCard
            key={video.id}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
            displayName={video.user?.displayName || video.user?.username}
            meta={`${video.viewCount} views • ${new Date(video.createdAt).toLocaleDateString()}`}
            href={`/video/${video.id}`}
            variant="listLarge"
          />
        ))}
      </ul>
      <div ref={sentinelRef} className="h-1" />
      {loadingMore ? (
        <div className="w-full grid place-items-center py-6">
          <Spinner className="size-12" />
        </div>
      ) : null}
    </div>
  );
}
