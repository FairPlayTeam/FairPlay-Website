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
import UserListModal from "@/components/ui/UserListModal";

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
  const [userListConfig, setUserListConfig] = useState<{
    isOpen: boolean;
    type: "followers" | "following";
  }>({ isOpen: false, type: "followers" });

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

  const openUserList = (type: "followers" | "following") => {
    setUserListConfig({ isOpen: true, type });
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

      <div className="container mx-auto px-4 pb-8">
        <div className={`flex flex-col md:flex-row gap-6 relative ${!bannerUrl ? "md:items-center mt-4" : ""}`}>
          <div
            className={`flex justify-center md:justify-start shrink-0 relative z-10 ${bannerUrl ? "-mt-12 md:-mt-16" : ""}`}
          >
            <UserAvatar
              user={user}
              size={140}
              className="border-[6px] border-background shadow-2xl bg-background"
            />
          </div>

          <div className="flex-1 min-w-0 md:pt-2 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-text leading-none">
                    {user.displayName || user.username}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 mt-2 text-sm text-muted-foreground/80 font-medium">
                    <span>@{user.username}</span>
                    <span className="text-white/20">•</span>
                    <div className="flex items-center gap-1.5">
                      <MdCalendarMonth className="size-3.5" />
                      <span>
                        Joined {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[15px]">
                  <button
                    onClick={() => openUserList("followers")}
                    className="flex items-center gap-1.5 group cursor-pointer hover:text-accent transition-colors"
                  >
                    <span className="font-bold text-text tabular-nums">{user.followerCount}</span>
                    <span className="text-muted-foreground group-hover:text-accent/80 transition-colors">Followers</span>
                  </button>
                  <button
                    onClick={() => openUserList("following")}
                    className="flex items-center gap-1.5 group cursor-pointer hover:text-accent transition-colors"
                  >
                    <span className="font-bold text-text tabular-nums">{user.followingCount}</span>
                    <span className="text-muted-foreground group-hover:text-accent/80 transition-colors">Following</span>
                  </button>
                  <div className="flex items-center gap-1.5 cursor-default">
                    <span className="font-bold text-text tabular-nums">{user.videoCount}</span>
                    <span className="text-muted-foreground">Videos</span>
                  </div>
                </div>

                {user.bio && (
                  <p className="max-w-3xl text-[15px] leading-relaxed text-text/90 pt-1">
                    {user.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center md:items-end gap-3 shrink-0 pt-1">
                {isMe ? (
                  <Button
                    variant="videoDetails"
                    onClick={() => router.push(`/profile`)}
                    className="rounded-full px-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium h-10"
                  >
                    Edit Channel
                  </Button>
                ) : !me ? (
                  <Link href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}>
                    <Button variant="primary" className="rounded-full px-8 h-10 font-bold shadow-lg shadow-accent/20">
                      Login to Subscribe
                    </Button>
                  </Link>
                ) : (
                  <FollowButton
                    username={user.username ?? ""}
                    initialFollowing={Boolean(user.isFollowing)}
                    onChangeCount={onFollowerDelta}
                  />
                )}
              </div>
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

      <UserListModal
        isOpen={userListConfig.isOpen}
        onClose={() =>
          setUserListConfig((prev) => ({ ...prev, isOpen: false }))
        }
        username={user.username}
        type={userListConfig.type}
      />
    </div>
  );
}
