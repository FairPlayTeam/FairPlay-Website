"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import { SearchResultsList } from "@/components/app/search/search-results-list";
import { Spinner } from "@/components/ui/spinner";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { searchVideos, type SearchResultItem, type SearchVideosResponse } from "@/lib/video";

const PAGE_SIZE = 10;

function resolveHasMore(itemsCount: number, pageLoaded: number, totalPages?: number): boolean {
  if (typeof totalPages === "number") {
    return pageLoaded < totalPages && itemsCount > 0;
  }

  return itemsCount === PAGE_SIZE;
}

function getResultKey(result: SearchResultItem): string {
  return result.type === "video" ? `video:${result.video.id}` : `creator:${result.creator.id}`;
}

function mergeUniqueResults(prev: SearchResultItem[], next: SearchResultItem[]) {
  if (next.length === 0) return prev;

  const seen = new Set(prev.map(getResultKey));
  const merged = [...prev];

  for (const item of next) {
    const key = getResultKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  return merged;
}

function normalizeResults(data: SearchVideosResponse): SearchResultItem[] {
  if (Array.isArray(data.results) && data.results.length > 0) {
    return data.results;
  }

  return (data.videos ?? []).map((video) => ({
    type: "video" as const,
    video,
  }));
}

type Status = "idle" | "loading" | "loadingMore" | "ready" | "error";

interface SearchState {
  results: SearchResultItem[];
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
      results: SearchResultItem[];
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
          action.mode === "initial"
            ? action.results
            : mergeUniqueResults(state.results, action.results),
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

        const nextResults = normalizeResults(res.data);
        const totalPages = res.data.pagination?.results?.totalPages;

        dispatch({
          type: "FETCH_SUCCESS",
          mode,
          results: nextResults,
          page: pageToLoad,
          hasMore: resolveHasMore(nextResults.length, pageToLoad, totalPages),
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
  }, [fetchResults, hasMore, page, status]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: status === "loading" || status === "loadingMore",
    onLoadMore: loadMore,
  });

  const isLoading = status === "loading";
  const isLoadingMore = status === "loadingMore";
  const isEmpty = status === "ready" && results.length === 0;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold">
        {normalizedQuery ? `Results for "${normalizedQuery}"` : "Search"}
      </h1>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading && "Loading results..."}
        {isEmpty && "No results found."}
        {status === "ready" && results.length > 0 && `${results.length} results loaded.`}
      </div>

      {isLoading && (
        <div className="grid h-[calc(100vh-5rem)] w-full place-items-center">
          <Spinner className="size-18" />
        </div>
      )}

      {!isLoading && !normalizedQuery && (
        <p className="text-muted-foreground">Enter a search term to find videos and creators.</p>
      )}

      {status === "error" && errorMessage && <p className="text-destructive">{errorMessage}</p>}

      {isEmpty && (
        <p className="text-muted-foreground">No results found for &quot;{normalizedQuery}&quot;.</p>
      )}

      {!isLoading && results.length > 0 && <SearchResultsList results={results} />}

      <div ref={sentinelRef} className="h-1" />

      {isLoadingMore && (
        <div className="grid w-full place-items-center py-6">
          <Spinner className="size-14" />
        </div>
      )}
    </div>
  );
}
