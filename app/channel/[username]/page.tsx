"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaPencilAlt,
} from "react-icons/fa";

import Toast from "@/components/ui/Toast"
import Spinner from "@/components/ui/Spinner";
import { VideoCard } from "@/components/video/VideoCard";
import { FollowButton } from "@/components/ui/FollowButton";

import {
  getUser,
  getUserVideos,
  type PublicUser,
  type UserVideoItem,
} from "@/lib/users";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/ui/UserAvatar";
import { useImagesUpload } from "@/hooks/useImagesUpload";

type LoadState = "idle" | "loading" | "ready" | "error";

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const { user: me } = useAuth();
  const { uploadUserAvatar, uploadUserBanner } = useImagesUpload();

  const usernameParam = params?.username;
  const username = typeof usernameParam === "string" ? usernameParam : usernameParam?.[0] ?? "";

  const [user, setUser] = useState<PublicUser | null>(null);
  const [videos, setVideos] = useState<UserVideoItem[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" | "info" } | null>(null);

  const requestSeq = useRef(0);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadUserAvatar(file);
      setUser((u) => (u ? { ...u, avatarUrl: res.storagePath } : u));

      setToast({ message: "Avatar uploaded successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Upload failed", type: "error" });
    } finally {
      e.target.value = "";
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadUserBanner(file);
      setUser((u) => (u ? { ...u, bannerUrl: res.storagePath } : u));

      setToast({ message: "Banner uploaded successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Upload failed", type: "error" });
    } finally {
      e.target.value = "";
    }
  };

  useEffect(() => {
    const seq = ++requestSeq.current;

    const run = async () => {
      if (!username) {
        setUser(null);
        setVideos([]);
        setError("User not found");
        setState("error");
        return;
      }

      setState("loading");
      setError(null);

      try {
        const [uRes, vsRes] = await Promise.all([
          getUser(username),
          getUserVideos(username, 1, 20),
        ]);

        // Ignore stale responses
        if (requestSeq.current !== seq) return;

        const u = uRes.data;
        const vs = vsRes.data;

        setUser(u);
        setVideos(vs?.videos ?? []);
        setState("ready");
      } catch (e: unknown) {
        if (requestSeq.current !== seq) return;

        const message = e instanceof Error ? e.message : "Failed to load profile";
        setUser(null);
        setVideos([]);
        setError(message);
        setState("error");
      }
    };

    run();
  }, [username]);

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
        <div className="relative w-full h-45 bg-muted hidden md:block group">
          <Image
            src={banner}
            alt={`${user.username} banner`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />

          {isMe && (
            <>
              <button
                type="button"
                className="absolute top-3 right-3 z-10
                          bg-background/80 hover:bg-background
                          rounded-full p-2 shadow cursor-pointer
                          opacity-0 group-hover:opacity-100 transition"
                aria-label="Change banner"
                onClick={() => bannerInputRef.current?.click()}
              >
                <FaPencilAlt className="size-4" />
              </button>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleBannerChange}
              />
            </>
          )}

        </div>
      ) : null}

      <div className="container mx-auto px-4 pt-6 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:gap-4 md:items-center">
          <div className="flex md:block justify-center md:justify-start">
            <div className="relative group">
              <UserAvatar
                user={user}
                size={90}
              />

              {isMe && (
                <button
                  className="absolute inset-0 flex items-center justify-center
                            bg-black/40 rounded-full cursor-pointer
                            opacity-0 group-hover:opacity-100 transition"
                  aria-label="Change profile picture"
                  onClick={() => {
                    avatarInputRef.current?.click()
                  }}
                >
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarChange}
                  />
                  <FaPencilAlt className="size-5 text-white" />
                </button>
              )}
            </div>
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

          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end md:text-left">
            <Link
              href={`/people?u=${encodeURIComponent(user.username)}&type=followers`}
              className="text-sm text-text hover:underline"
            >
              {user.followerCount} Followers
            </Link>

            <Link
              href={`/people?u=${encodeURIComponent(user.username)}&type=following`}
              className="text-sm text-text hover:underline"
            >
              {user.followingCount} Following
            </Link>

            {!isMe ? (
              <div className="w-full md:w-auto flex justify-center md:justify-start">
                <FollowButton
                  username={user.username}
                  initialFollowing={Boolean(user.isFollowing)}
                  onChangeCount={onFollowerDelta}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10">
        {videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No videos yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {isMe && (
              <div className="p-1">
                <div
                  className="flex flex-col aspect-video items-center justify-center rounded-2xl cursor-pointer 
                            border-2 border-dashed border-white/20
                            text-white/50 hover:bg-white/2 transition-colors"
                  onClick={() => router.push("/upload")}
                >
                  <span className="text-4xl font-bold">+</span>
                  <span className="mt-2 text-sm font-medium">Upload</span>
                </div>
              </div>
            )}

            {videos.map((v) => {
              const createdAtLabel = new Date(v.createdAt).toLocaleDateString();
              const meta = `${createdAtLabel} • ${v.viewCount} views`;

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
          </div>
        )}
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
}
