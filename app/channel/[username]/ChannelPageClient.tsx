"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdCalendarMonth } from "react-icons/md";

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

const PAGE_SIZE = 10;

function computeHasMore(
  currentPage: number,
  totalPages: number | undefined,
  itemsLength: number
) {
  if (typeof totalPages === "number") {
    return currentPage < totalPages;
  }
  return itemsLength === PAGE_SIZE;
}

export default function ChannelPageClient({
  username,
  initialUser,
  initialVideos,
  initialTotalPages,
  initialError,
}: ChannelPageClientProps) {
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
    return computeHasMore(1, initialTotalPages, initialVideos.length);
  });
  const [loadingMore, setLoadingMore] = useState(false);

  const requestSeq = useRef(0);
  const shouldFetchInitial = !initialUser && !initialError;
  const meUsername = me?.username ?? null;
  const userUsername = user?.username ?? null;
  const isMe = !!meUsername && !!userUsername && meUsername === userUsername;
  const isReady = state === "ready";
  const isLoading = state === "loading" || state === "idle";

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
          getUserVideos(username, 1, PAGE_SIZE),
        ]);

        if (requestSeq.current !== seq) return;

        const u = uRes.data;
        const vs = vsRes.data;

        setUser(u);
        const initial = vs?.videos ?? [];
        const totalPages = vs?.pagination?.totalPages;
        setVideos(initial);
        setPage(1);
        setHasMore(computeHasMore(1, totalPages, initial.length));
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
  }, [shouldFetchInitial, username]);

  useEffect(() => {
    if (!meUsername || !userUsername || isMe) return;

    let active = true;

    getUser(userUsername)
      .then((res) => {
        if (!active) return;
        setUser(res.data);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [isMe, meUsername, userUsername]);

  const loadMore = useCallback(async () => {
    if (!username || !isReady || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const seq = requestSeq.current;
    const nextPage = page + 1;

    try {
      const vsRes = await getUserVideos(username, nextPage, PAGE_SIZE);
      if (requestSeq.current !== seq) return;

      const vs = vsRes.data;
      const nextVideos = vs?.videos ?? [];
      const totalPages = vs?.pagination?.totalPages;

      setVideos((prev) => [...prev, ...nextVideos]);
      setPage(nextPage);
      setHasMore(computeHasMore(nextPage, totalPages, nextVideos.length));
    } catch {
      if (requestSeq.current !== seq) return;
      setHasMore(false);
    } finally {
      if (requestSeq.current !== seq) return;
      setLoadingMore(false);
    }
  }, [hasMore, isReady, loadingMore, page, username]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: !isReady || loadingMore,
    onLoadMore: loadMore,
  });

  const bannerUrl = user?.bannerUrl;

  const onFollowerDelta = (delta: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextCount = Math.max(0, (prev.followerCount ?? 0) + delta);
      return { ...prev, followerCount: nextCount };
    });
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-16" />
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
      {bannerUrl ? (
        <div className="relative w-full h-30 md:h-45 block">
          <Image
            src={bannerUrl}
            alt={`${user.username} banner`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : null}

      <div className="container mx-auto px-4 pt-8 pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex justify-center md:justify-start">
            <UserAvatar
              user={user}
              size={110}
              className="border-background shadow-xl ring-4 ring-white/5"
            />
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left pt-2">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-text">
                {user.displayName || user.username}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
                <p className="text-base text-muted-foreground font-medium">@{user.username}</p>
                <div className="w-1 h-1 rounded-full bg-white/20 hidden md:block" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground/70">
                  <MdCalendarMonth className="size-4" />
                  <span>
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {user.bio && (
              <p className="mt-5 text-[15px] text-text/80 max-w-2xl leading-relaxed mx-auto md:mx-0">
                {user.bio}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center md:items-end gap-8 pt-2">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center md:items-end">
                <span className="text-2xl font-bold text-text tabular-nums leading-none">
                  {user.followerCount}
                </span>
                <span className="text-[10px] mt-1.5 uppercase tracking-widest text-muted-foreground/60 font-black">
                  Followers
                </span>
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block" />
              <div className="flex flex-col items-center md:items-end">
                <span className="text-2xl font-bold text-text tabular-nums leading-none">
                  {user.followingCount}
                </span>
                <span className="text-[10px] mt-1.5 uppercase tracking-widest text-muted-foreground/60 font-black">
                  Following
                </span>
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block" />
              <div className="flex flex-col items-center md:items-end">
                <span className="text-2xl font-bold text-text tabular-nums leading-none">
                  {user.videoCount}
                </span>
                <span className="text-[10px] mt-1.5 uppercase tracking-widest text-muted-foreground/60 font-black">
                  Videos
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end w-full">
              {isMe ? (
                <Button
                  variant="videoDetails"
                  onClick={() => router.push(`/profile`)}
                  className="rounded-full px-8 bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-semibold"
                >
                  Edit Channel
                </Button>
              ) : null}

              {!me ? (
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                  className="w-full sm:w-auto"
                >
                  <Button variant="videoDetails" className="rounded-full px-8 bg-accent text-background hover:bg-accent/90 border-none transition-all w-full sm:w-auto font-bold">
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
              const meta = `${v.viewCount} views • ${createdAtLabel}`;

              return (
                <VideoCard
                  key={v.id}
                  thumbnailUrl={v.thumbnailUrl}
                  title={v.title}
                  displayName={user.displayName || user.username}
                  meta={meta}
                  href={`/video/${v.id}`}
                  variant="grid"
                />
              );
            })}
            <div ref={sentinelRef} className="h-1 col-span-full" />
            {loadingMore ? (
              <div className="w-full grid place-items-center py-6 col-span-full">
                <Spinner className="size-12" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div >
  );
}
