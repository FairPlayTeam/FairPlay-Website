"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { searchVideos, VideoDetails } from "@/lib/video";
import { VideoCard } from "@/components/app/video/video-card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";

// Constants

const PAGE_SIZE = 10;

// Helpers

function resolveHasMore(itemsCount: number, pageLoaded: number, totalPages?: number): boolean {
  if (typeof totalPages === "number") {
    return pageLoaded < totalPages && itemsCount > 0;
  }
  return itemsCount === PAGE_SIZE;
}

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

// Reducer

type Status = "idle" | "loading" | "loadingMore" | "ready" | "error";

interface SearchState {
  results: VideoDetails[];
  status: Status;
  errorMessage: string | null;
  page: number;
  hasMore: boolean;
}

type SearchAction =
  | { type: "FETCH_START"; mode: "initial" | "more" }
  | {
      type: "FETCH_SUCCESS";
      mode: "initial" | "more";
      videos: VideoDetails[];
      page: number;
      hasMore: boolean;
    }
  | { type: "FETCH_ERROR"; mode: "initial" | "more"; message: string }
  | { type: "RESET" };

const initialState: SearchState = {
  results: [],
  status: "idle",
  errorMessage: null,
  page: 1,
  hasMore: false,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        status: action.mode === "initial" ? "loading" : "loadingMore",
        errorMessage: null,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        status: "ready",
        results:
          action.mode === "initial" ? action.videos : mergeUniqueById(state.results, action.videos),
        page: action.page,
        hasMore: action.hasMore,
        errorMessage: null,
      };
    case "FETCH_ERROR":
      if (action.mode === "more") {
        return {
          ...state,
          status: "ready",
          hasMore: false,
          errorMessage: null,
        };
      }
      return {
        ...state,
        status: "error",
        results: [],
        hasMore: false,
        errorMessage: action.message,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// Component

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const normalizedQuery = query.trim();

  const [state, dispatch] = useReducer(searchReducer, initialState);
  const { results, status, errorMessage, page, hasMore } = state;

  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const fetchResults = useCallback(
    async (pageToLoad: number, mode: "initial" | "more") => {
      if (!normalizedQuery) return;

      dispatch({ type: "FETCH_START", mode });

      try {
        const res = await searchVideos(normalizedQuery, pageToLoad, PAGE_SIZE);

        if (queryRef.current !== query) return;

        const videos = res.data.videos ?? [];
        const totalPages = res.data.pagination?.totalPages;

        dispatch({
          type: "FETCH_SUCCESS",
          mode,
          videos,
          page: pageToLoad,
          hasMore: resolveHasMore(videos.length, pageToLoad, totalPages),
        });
      } catch (err: unknown) {
        if (queryRef.current !== query) return;

        const message =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          (err instanceof Error ? err.message : "Error while searching.");

        dispatch({ type: "FETCH_ERROR", mode, message });

        toast.error("Search failed");
      }
    },
    [normalizedQuery, query],
  );

  useEffect(() => {
    if (!normalizedQuery) {
      dispatch({ type: "RESET" });
      return;
    }
    fetchResults(1, "initial");
  }, [fetchResults, normalizedQuery]);

  const loadMore = useCallback(() => {
    if (status === "loading" || status === "loadingMore" || !hasMore) return;
    fetchResults(page + 1, "more");
  }, [fetchResults, hasMore, status, page]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: status === "loading" || status === "loadingMore",
    onLoadMore: loadMore,
  });

  const isLoading = status === "loading";
  const isLoadingMore = status === "loadingMore";
  const isEmpty = status === "ready" && results.length === 0;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {normalizedQuery ? `Results for "${normalizedQuery}"` : "Search"}
      </h1>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading && "Loading results..."}
        {isEmpty && "No results found."}
        {status === "ready" && results.length > 0 && `${results.length} results loaded.`}
      </div>

      {isLoading && (
        <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
          <Spinner className="size-18" />
        </div>
      )}

      {!isLoading && !normalizedQuery && (
        <p className="text-muted-foreground">Enter a search term to find videos.</p>
      )}

      {status === "error" && errorMessage && <p className="text-destructive">{errorMessage}</p>}

      {isEmpty && (
        <p className="text-muted-foreground">No results found for &quot;{normalizedQuery}&quot;.</p>
      )}

      {!isLoading && results.length > 0 && (
        <div className="flex flex-col gap-1">
          {results.map((video) => (
            <VideoCard
              key={video.id}
              thumbnailUrl={video.thumbnailUrl}
              title={video.title}
              displayName={video.user?.displayName || video.user?.username}
              meta={`${video.viewCount} views - ${new Date(video.createdAt).toLocaleDateString()}`}
              href={`/video/${video.id}`}
              variant="listLarge"
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      {isLoadingMore && (
        <div className="w-full grid place-items-center py-6">
          <Spinner className="size-14" />
        </div>
      )}
    </div>
  );
}
