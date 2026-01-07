"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/Toast/toast-utils";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { ModVideoCard } from "@/components/app/video/ModVideoCard";

import { listModeratorVideos, type ModVideoItem, updateModeration } from "@/lib/moderation";
import { deleteVideo } from "@/lib/video";
import { useAuth } from "@/context/AuthContext";

type LoadState = "idle" | "loading" | "ready" | "error";

export default function ModerationPage() {
  const router = useRouter();
  const { user: me, isLoading } = useAuth();
  const isModerator = me?.role === "admin" || me?.role === "moderator";

  const [videos, setVideos] = useState<ModVideoItem[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(me);
  const [moderatingIds, setModeratingIds] = useState<Set<string>>(
    () => new Set()
  );
  const [videoToDelete, setVideoToDelete] = useState<ModVideoItem | null>(null);

  useEffect(() => {
    setUser(me);
  }, [me]);

  const requestSeq = useRef(0);

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    const videoId = videoToDelete.id;
    setVideoToDelete(null);

    try {
      await deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      toast.success("Video deleted successfully!");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  const handleCancelDelete = () => {
    setVideoToDelete(null);
  };

  const handleModerateVideo = async (
    videoId: string,
    action: "approve" | "reject"
  ) => {
    if (moderatingIds.has(videoId)) return;

    let removedItem: ModVideoItem | null = null;
    let removedIndex = -1;

    setModeratingIds((prev) => new Set(prev).add(videoId));
    setVideos((prev) => {
      removedIndex = prev.findIndex((v) => v.id === videoId);
      if (removedIndex === -1) return prev;
      removedItem = prev[removedIndex];
      return prev.filter((v) => v.id !== videoId);
    });

    try {
      await updateModeration(videoId, action);
      toast.success(
        action === "approve" ? "Video approved." : "Video rejected."
      );
    } catch {
      if (removedItem && removedIndex >= 0) {
        setVideos((prev) => {
          const next = [...prev];
          next.splice(removedIndex, 0, removedItem as ModVideoItem);
          return next;
        });
      }
      toast.error("Failed to update moderation status.");
    } finally {
      setModeratingIds((prev) => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (!isLoading && !me) {
      router.replace(`/login?callbackUrl=/moderator`);
    }
  }, [me, isLoading, router]);

  useEffect(() => {
    const seq = ++requestSeq.current;

    if (!me || !isModerator) return;

    const run = async () => {
      setState("loading");
      setError(null);

      try {
        const videosRes = await listModeratorVideos({
          page: 1,
          limit: 20,
          moderationStatus: "pending",
        });
        if (requestSeq.current !== seq) return;

        setVideos(videosRes.data?.videos ?? []);
        setState("ready");
      } catch (e) {
        if (requestSeq.current !== seq) return;

        setState("error");
        setError(e instanceof Error ? e.message : "Failed to load videos");
        setVideos([]);
      }
    };

    run();
  }, [me, isModerator]);

  if (!isLoading && me && !isModerator) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Not allowed</h1>
        <p className="text-text mb-6">
          You don&apos;t have permission to access moderation tools.
        </p>
        <Button variant="secondary" onClick={() => router.push("/explore")}>
          Back to Explore
        </Button>
      </div>
    );
  }

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
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          {videos.length === 0 ? (
            <h1 className="text-2xl font-bold mb-6">No videos.</h1>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {videos.map((v) => {
                return (
                  <div key={v.id}>
                    <ModVideoCard
                      video={v}
                      user={v.user}
                      onDelete={() => setVideoToDelete(v)}
                      onModerate={handleModerateVideo}
                      isModerating={moderatingIds.has(v.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(videoToDelete)}
        title="Delete video?"
        description={
          videoToDelete
            ? `Are you sure you want to delete "${
                videoToDelete.title || "this video"
              }"? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        confirmTone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
