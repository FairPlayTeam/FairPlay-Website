"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import { toast } from "@/components/ui/Toast/toast-utils";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { useAuth } from "@/context/AuthContext";
import { getFollowing, unfollowUser, type SimpleUser } from "@/lib/users";

type FetchMode = "initial" | "more";

export default function SubscriptionsPage() {
  const pageSize = 18;
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [following, setFollowing] = useState<SimpleUser[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unfollowingIds, setUnfollowingIds] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace(`/login?callbackUrl=/subscriptions`);
    }
  }, [isAuthLoading, router, user]);

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

  const fetchFollowing = useCallback(
    async (pageToLoad: number, mode: FetchMode) => {
      if (!user) return;

      try {
        if (mode === "initial") {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const idOrUsername = user.username || user.id;
        const { data } = await getFollowing(idOrUsername, pageToLoad, pageSize);
        const nextFollowing = data.following ?? [];
        const totalPages = data.pagination?.totalPages;

        setFollowing((prev) =>
          pageToLoad === 1 ? nextFollowing : [...prev, ...nextFollowing]
        );
        setError(null);
        setPage(pageToLoad);
        setHasMore(
          resolveHasMore(nextFollowing.length, pageToLoad, totalPages)
        );
      } catch {
        if (mode === "initial") {
          setError("Unable to load subscriptions.");
        }
        toast.error("Error while fetching subscriptions.");
        setHasMore(false);
      } finally {
        if (mode === "initial") {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [pageSize, user]
  );

  useEffect(() => {
    if (!user) return;
    fetchFollowing(1, "initial");
  }, [fetchFollowing, user]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    fetchFollowing(page + 1, "more");
  }, [fetchFollowing, hasMore, isLoading, isLoadingMore, page]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
  });

  const handleUnfollow = async (creator: SimpleUser) => {
    const key = creator.id || creator.username;
    if (!key || unfollowingIds.has(key)) return;

    setUnfollowingIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    try {
      await unfollowUser(creator.username || creator.id);
      setFollowing((prev) => prev.filter((item) => item.id !== creator.id));
      toast.success("Unfollowed.");
    } catch {
      toast.error("Unable to unfollow.");
    } finally {
      setUnfollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  if (isAuthLoading || !user || isLoading) {
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
        <p className="text-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="container px-5 py-10 md:px-10">
      {following.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-text-amount">No subscriptions yet.</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => router.push("/explore")}
          >
            Discover creators
          </Button>
        </div>
      ) : (
        <div>
          <div className="mb-8 flex flex-col gap-3">
            <h1 className="text-3xl font-bold">Subscriptions</h1>
            <p className="text-text-amount">
              Creators you follow, all in one place.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {following.map((creator) => (
              <div
                key={creator.id}
                onClick={() => router.push(`/channel/${creator.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/channel/${creator.id}`);
                  }
                }}
                className="cursor-pointer"
              >
                <div className="flex flex-col h-full justify-between gap-4 rounded-xl border border-border bg-container hover:bg-container/80 p-2 md:p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
                  <div className="flex items-center gap-4">
                    <UserAvatar user={creator} size={56} />
                    <div className="min-w-0">
                      <p className="text-lg font-semibold break-all">
                        {creator.displayName || creator.username}
                      </p>
                      <p className="text-sm text-text-amount break-all">
                        @{creator.username}
                      </p>
                    </div>
                    <Button
                      className="ml-auto"
                      variant="videoDetails"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleUnfollow(creator);
                      }}
                      disabled={unfollowingIds.has(
                        creator.id || creator.username
                      )}
                    >
                      Unfollow
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
      {isLoadingMore ? (
        <div className="w-full grid place-items-center py-6">
          <Spinner className="size-12" />
        </div>
      ) : null}
    </div>
  );
}
