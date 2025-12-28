"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaPencilAlt } from "react-icons/fa";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "@/components/ui/Toast/toast";
import { StatusBadges } from "@/components/video/StatusBadge";
import Spinner from "@/components/ui/Spinner";
import { VideoCard } from "@/components/video/VideoCard";
import UserAvatar from "@/components/ui/UserAvatar";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { FaTrash } from "react-icons/fa";

import { getMyVideos, type MyVideoItem } from "@/lib/users";
import { deleteVideo } from "@/lib/video";
import { useAuth } from "@/context/AuthContext";

type LoadState = "idle" | "loading" | "ready" | "error";

export default function MyVideosPage() {
    const router = useRouter();
    const { user: me, isLoading } = useAuth();
    const { uploadUserAvatar, uploadUserBanner } = useImagesUpload();

    const [videos, setVideos] = useState<MyVideoItem[]>([]);
    const [state, setState] = useState<LoadState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState(me);

    const requestSeq = useRef(0);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleDeleteVideo = async (videoId: string) => {
        if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
            return;
        }

        try {
            await deleteVideo(videoId);
            setVideos((prev) => prev.filter((v) => v.id !== videoId));
            toast.success("Video deleted successfully!");
        } catch {
            toast.error("Failed to delete video");
        }
    };

    const handleImageChange = (type: "avatar" | "banner") => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = type === "avatar"
                ? await uploadUserAvatar(file)
                : await uploadUserBanner(file);

            setUser((u) => u ? {
                          ...u,
                          ...(type === "avatar"
                              ? { avatarUrl: res.storagePath }
                              : { bannerUrl: res.storagePath }),
                      } : u
            );

            toast.success(
                type === "avatar"
                    ? "Avatar uploaded successfully!"
                    : "Banner uploaded successfully!"
            );
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
            e.target.value = "";
        }
    };

    useEffect(() => {
        if (!isLoading && !me) {
            router.replace(`/login?callbackUrl=/me`);
        }
    }, [me, isLoading, router]);

    useEffect(() => {
        const seq = ++requestSeq.current;

        if (!me) return;

        const run = async () => {
            setState("loading");
            setError(null);

            try {
                const videosRes = await getMyVideos(1, 20);
                if (requestSeq.current !== seq) return;

                setVideos(videosRes.data?.videos ?? []);
                setUser(me);
                setState("ready");
            } catch (e) {
                if (requestSeq.current !== seq) return;

                setState("error");
                setError(e instanceof Error ? e.message : "Failed to load videos");
                setVideos([]);
            }
        };

        run();
    }, [me]);

    if (!me || state === "idle" || state === "loading") {
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
        <div className="relative w-full h-45 bg-muted hidden md:block group">
            {user.bannerUrl ? (
                <Image
                    src={user.bannerUrl}
                    alt={`${user.username} banner`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                />
            ) : (
                <button
                    type="button"
                    className="w-full h-full flex flex-col items-center justify-center
                            text-white/50 bg-white/2 hover:bg-white/5 hover:cursor-pointer transition"
                    onClick={() => bannerInputRef.current?.click()}
                >
                    <span className="text-lg font-medium">Upload banner</span>
                </button>
            )}

            {user.bannerUrl && (
                <button
                    type="button"
                    className="absolute top-3 right-3 z-10 bg-background/80 hover:bg-background
                            rounded-full p-2 shadow cursor-pointer
                            opacity-0 group-hover:opacity-100 transition"
                    aria-label="Change banner"
                    onClick={() => bannerInputRef.current?.click()}
                >
                    <FaPencilAlt className="size-4" />
                </button>
            )}

            <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange("banner")}
            />
        </div>

        <div className="container mx-auto px-4 pt-6 pb-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative group">
                <UserAvatar user={user} size={80} />
                <button
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition"
                    aria-label="Change profile picture"
                    onClick={() => avatarInputRef.current?.click()}
                >
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange("avatar")}
                    />
                    <FaPencilAlt className="size-5 text-white" />
                </button>
            </div>
            <div className="flex-1 min-w-0 text-center md:text-left">
                <h1 className="text-2xl font-semibold truncate">{user.displayName || user.username}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                {user.bio && <p className="mt-3 text-sm text-text/80">{user.bio}</p>}
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
            </div>
        </div>

        <div className="container mx-auto px-4 pb-10">
            {videos.length === 0 ? (
                <div className="p-1">
                    <div
                        className="flex flex-col h-70 items-center justify-center rounded-2xl cursor-pointer border-2 border-dashed border-white/20 text-white/50 hover:bg-white/2 transition-colors"
                        onClick={() => router.push("/upload")}
                    >
                        <span className="text-4xl font-bold">+</span>
                        <span className="mt-2 text-sm font-medium">Upload Video</span>
                    </div>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div className="p-1">
                        <div
                            className="flex flex-col aspect-video items-center justify-center rounded-2xl cursor-pointer border-2 border-dashed border-white/20 text-white/50 hover:bg-white/2 transition-colors"
                            onClick={() => router.push("/upload")}
                        >
                            <span className="text-4xl font-bold">+</span>
                            <span className="mt-2 text-sm font-medium">Upload Video</span>
                        </div>
                    </div>

                    {videos.map((v) => {
                        const createdAtLabel =
                            "createdAt" in v
                            ? new Date(v.createdAt as string | number).toLocaleDateString()
                            : "";

                        const meta = `${createdAtLabel} • ${v.viewCount} views`;

                        const isProcessing = v.processingStatus !== "done";

                        return (
                            <div
                                key={v.id}
                                className={cn(
                                "relative",
                                isProcessing
                                    ? "cursor-not-allowed"
                                    : "cursor-pointer"
                                )}
                            >
                                {isProcessing && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-[2px]">
                                    <span className="text-base font-semibold text-white">
                                        Processing…
                                    </span>
                                </div>
                                )}

                                <div className={cn(isProcessing && "pointer-events-none")}>
                                    <VideoCard
                                        key={v.id}
                                        thumbnailUrl={v.thumbnailUrl}
                                        title={v.title}
                                        displayName={user.displayName || user.username}
                                        meta={meta}
                                        variant="grid"
                                        onPress={
                                        isProcessing
                                            ? undefined
                                            : () => router.push(`/video/${v.id}`)
                                        }
                                    />

                                    {!isProcessing && (
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 z-20 p-2 cursor-pointer bg-background/80 hover:bg-red-600 text-white rounded-full shadow"
                                            aria-label="Delete video"
                                            onClick={() => handleDeleteVideo(v.id)}
                                        >
                                            <FaTrash className="size-4" />
                                        </button>
                                    )}
                                    
                                    <StatusBadges
                                        visibility={v.visibility}
                                        moderationStatus={v.moderationStatus}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
}