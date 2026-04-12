"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUnavailableNotice } from "@/components/app/auth/auth-unavailable-notice";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/user-avatar";
import { toast } from "sonner";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { useAuth } from "@/context/auth-context";
import { buildServiceUnavailableHref } from "@/lib/safe-redirect";
import { getFollowing, unfollowUser, type BaseUser } from "@/lib/users";

type FetchMode = "initial" | "more";
const PAGE_SIZE = 18;

function mergeUniqueUsers(prev: BaseUser[], next: BaseUser[]) {
  if (next.length === 0) return prev;
  const seen = new Set(prev.map((item) => item.id || item.username));
  const merged = [...prev];

  for (const item of next) {
    const key = item.id || item.username;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  return merged;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isUnavailable, errorMessage } = useAuth();

  const [following, setFollowing] = useState<BaseUser[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unfollowingIds, setUnfollowingIds] = useState<Set<string>>(() => new Set());

  const resolveHasMore = (itemsCount: number, pageToLoad: number, totalPages?: number) => {
    if (typeof totalPages === "number") {
      return pageToLoad < totalPages;
    }
    return itemsCount === PAGE_SIZE;
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
        const { data } = await getFollowing(idOrUsername, pageToLoad, PAGE_SIZE);
        const nextFollowing = data.following ?? [];
        const totalPages = data.pagination?.totalPages;

        setFollowing((prev) =>
          pageToLoad === 1 ? nextFollowing : mergeUniqueUsers(prev, nextFollowing),
        );
        setError(null);
        setPage(pageToLoad);
        setHasMore(resolveHasMore(nextFollowing.length, pageToLoad, totalPages));
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
    [user],
  );

  useEffect(() => {
    if (!user) return;
    fetchFollowing(1, "initial");
  }, [fetchFollowing, user]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    fetchFollowing(page + 1, "more");
  }, [fetchFollowing, isLoading, isLoadingMore, hasMore, page]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
  });

  const handleUnfollow = async (creator: BaseUser) => {
    const key = creator.id || creator.username;
    if (!key || unfollowingIds.has(key)) return;

    setUnfollowingIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    try {
      await unfollowUser(creator.username || creator.id);
      setFollowing((prev) =>
        prev.filter((item) => (item.id || item.username) !== (creator.id || creator.username)),
      );
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

  if (isUnavailable && !user) {
    return (
      <AuthUnavailableNotice
        description={
          errorMessage ??
          "FairPlay could not confirm your session right now, so subscriptions are temporarily unavailable."
        }
        actionHref={buildServiceUnavailableHref("/subscriptions")}
      />
    );
  }

  if (isAuthLoading || !user || isLoading) {
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
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="container px-5 py-10 md:px-10">
      {following.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-muted-foreground">No subscriptions yet.</p>
          <Button
            variant="outline"
            className="mt-4 rounded-full px-5 py-4"
            onClick={() => router.push("/explore")}
          >
            Discover creators
          </Button>
        </div>
      ) : (
        <div>
          <div className="mb-8 flex flex-col gap-3">
            <h1 className="text-3xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground">Creators you follow, all in one place.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {following.map((creator) => (
              <div
                key={creator.id || creator.username}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/channel/${creator.username || creator.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/channel/${creator.username || creator.id}`);
                  }
                }}
                aria-label={`Open ${creator.displayName || creator.username || creator.id} channel`}
                className="cursor-pointer"
              >
                <div className="flex h-full items-center gap-4 rounded-xl border border-border bg-card p-2 md:p-3 hover:bg-card/80">
                  <UserAvatar user={creator} size="lg" />
                  <div className="min-w-0">
                    <p className="text-lg font-semibold break-all">
                      {creator.displayName || creator.username}
                    </p>
                    <p className="text-sm text-muted-foreground break-all">@{creator.username}</p>
                  </div>
                  <Button
                    className="ml-auto rounded-full p-4"
                    variant="secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUnfollow(creator);
                    }}
                    disabled={unfollowingIds.has(creator.id || creator.username)}
                  >
                    Unfollow
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
      {isLoadingMore ? (
        <div className="w-full grid place-items-center py-6">
          <Spinner className="size-14" />
        </div>
      ) : null}
    </div>
  );
}
