"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import Spinner from "@/components/ui/Spinner";
import { VideoCard } from "@/components/app/video/VideoCard";
import { FollowButton } from "@/components/ui/FollowButton";
import Button from "@/components/ui/Button";

import {
  getUser,
  getUserVideos,
  type PublicUser,
  type UserVideoItem,
} from "@/lib/users";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/ui/UserAvatar";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

type LoadState = "idle" | "loading" | "ready" | "error";

type ChannelPageClientProps = {
  username: string;
  initialUser: PublicUser | null;
  initialVideos: UserVideoItem[];
  initialTotalPages?: number;
  initialError?: string | null;
};

export default function ChannelPageClient({
  username,
  initialUser,
  initialVideos,
  initialTotalPages,
  initialError,
}: ChannelPageClientProps) {
  const pageSize = 10;
  const router = useRouter();
  const { user: me } = useAuth();
  const pathname = usePathname();

  const [user, setUser] = useState<PublicUser | null>(initialUser);
  const [videos, setVideos] = useState<UserVideoItem[]>(initialVideos);
  const [state, setState] = useState<LoadState>(() => {
    if (initialError) return "error";
    return initialUser ? "ready" : "idle";
  });
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [page, setPage] = useState(initialUser ? 1 : 0);
  const [hasMore, setHasMore] = useState(() => {
    if (!initialUser) return false;
    if (typeof initialTotalPages === "number") {
      return 1 < initialTotalPages;
    }
    return initialVideos.length === pageSize;
  });
  const [loadingMore, setLoadingMore] = useState(false);

  const requestSeq = useRef(0);
  const shouldFetchInitial = !initialUser && !initialError;

  useEffect(() => {
    if (!username) {
      setUser(null);
      setVideos([]);
      setError("User not found");
      setState("error");
      return;
    }

    if (!shouldFetchInitial) return;
    const seq = ++requestSeq.current;

    const run = async () => {
      setState("loading");
      setError(null);

      try {
        const [uRes, vsRes] = await Promise.all([
          getUser(username),
          getUserVideos(username, 1, pageSize),
        ]);

        if (requestSeq.current !== seq) return;

        const u = uRes.data;
        const vs = vsRes.data;

        setUser(u);
        const initial = vs?.videos ?? [];
        const totalPages = vs?.pagination?.totalPages;
        setVideos(initial);
        setPage(1);
        setHasMore(
          typeof totalPages === "number"
            ? 1 < totalPages
            : initial.length === pageSize
        );
        setState("ready");
      } catch (e: unknown) {
        if (requestSeq.current !== seq) return;

        const message =
          e instanceof Error ? e.message : "Failed to load profile";
        setUser(null);
        setVideos([]);
        setError(message);
        setState("error");
      }
    };

    run();
  }, [pageSize, shouldFetchInitial, username]);

  const loadMore = useCallback(async () => {
    if (!username || state !== "ready" || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const seq = requestSeq.current;
    const nextPage = page + 1;

    try {
      const vsRes = await getUserVideos(username, nextPage, pageSize);
      if (requestSeq.current !== seq) return;

      const vs = vsRes.data;
      const nextVideos = vs?.videos ?? [];
      const totalPages = vs?.pagination?.totalPages;

      setVideos((prev) => [...prev, ...nextVideos]);
      setPage(nextPage);
      setHasMore(
        typeof totalPages === "number"
          ? nextPage < totalPages
          : nextVideos.length === pageSize
      );
    } catch {
      if (requestSeq.current !== seq) return;
      setHasMore(false);
    } finally {
      if (requestSeq.current !== seq) return;
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page, pageSize, state, username]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: state !== "ready" || loadingMore,
    onLoadMore: loadMore,
  });

  const isMe = !!me && !!user && me.username === user.username;
  const banner = user?.bannerUrl ?? null;

  const onFollowerDelta = (delta: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextCount = Math.max(0, (prev.followerCount ?? 0) + delta);
      return { ...prev, followerCount: nextCount };
    });
  };

  if (state === "loading" || state === "idle") {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (state === "error" || !user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-text">{error || "User not found"}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {banner ? (
        <div className="relative w-full h-30 md:h-45 block">
          <Image
            src={banner}
            alt={`${user.username} banner`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : null}

      <div className="container mx-auto px-4 pt-6 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex md:block justify-center md:justify-start">
            <UserAvatar user={user} size={80} className="border-background" />
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left">
            <h1 className="text-2xl font-semibold truncate">
              {user.displayName || user.username}
            </h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio ? (
              <p className="mt-3 text-sm text-text/80 max-w-3xl md:text-left text-center">
                {user.bio}
              </p>
            ) : null}
          </div>

          {isMe ? (
            <Button
              variant="videoDetails"
              onClick={() => router.push(`/profile`)}
            >
              Edit Channel
            </Button>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end md:text-left">
            <p className="text-sm text-text hover:underline">
              {user.followerCount} Followers
            </p>

            <p className="text-sm text-text hover:underline">
              {user.followingCount} Following
            </p>

            <div className="w-full md:w-auto flex justify-center md:justify-start">
              {!me ? (
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                >
                  <Button variant="videoDetails" className="rounded-full px-6">
                    Login to Subscribe
                  </Button>
                </Link>
              ) : !isMe ? (
                <FollowButton
                  username={user.username ?? ""}
                  initialFollowing={Boolean(user.isFollowing)}
                  onChangeCount={onFollowerDelta}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10">
        {videos.length === 0 ? (
          <p className="flex text-sm text-muted-foreground pt-10 justify-center">
            No videos yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {videos.map((v) => {
              const createdAtLabel = new Date(v.createdAt).toLocaleDateString();
              const meta = `${createdAtLabel} ƒ?½ ${v.viewCount} views`;

              return (
                <VideoCard
                  key={v.id}
                  thumbnailUrl={v.thumbnailUrl}
                  title={v.title}
                  displayName={user.displayName || user.username}
                  meta={meta}
                  onPress={() => router.push(`/video/${v.id}`)}
                  variant="grid"
                />
              );
            })}
            <div ref={sentinelRef} className="h-1 col-span-full" />
            {loadingMore ? (
              <div className="w-full grid place-items-center py-6 col-span-full">
                <Spinner className="size-8" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
