"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast/toast-utils";
import { MyVideoCard } from "@/components/app/video/MyVideoCard";
import { MyVideoItem, getMyVideos } from "@/lib/users";
import { deleteVideo } from "@/lib/video";
import { User } from "@/types/schema";
import Button from "@/components/ui/Button";
import { FaUpload } from "react-icons/fa";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

interface VideosTabProps {
  user: User;
}

type LoadState = "idle" | "loading" | "ready" | "error";

export default function VideosTab({ user }: VideosTabProps) {
  const pageSize = 10;
  const router = useRouter();

  const [videos, setVideos] = useState<MyVideoItem[]>([]);

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const requestSeq = useRef(0);

  useEffect(() => {
    const seq = ++requestSeq.current;

    const run = async () => {
      setState("loading");
      setError(null);

      try {
        const videosRes = await getMyVideos(1, pageSize);
        if (requestSeq.current !== seq) return;

        const initialVideos = videosRes.data?.videos ?? [];
        const totalPages = videosRes.data?.pagination?.totalPages;

        setVideos(initialVideos);
        setPage(1);
        setHasMore(
          typeof totalPages === "number"
            ? 1 < totalPages
            : initialVideos.length === pageSize
        );
        setState("ready");
      } catch (e) {
        if (requestSeq.current !== seq) return;

        setState("error");
        setError(e instanceof Error ? e.message : "Failed to load videos");
        setVideos([]);
      }
    };

    run();
  }, [user]);

  const loadMore = useCallback(async () => {
    if (state !== "ready" || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const seq = requestSeq.current;
    const nextPage = page + 1;

    try {
      const videosRes = await getMyVideos(nextPage, pageSize);
      if (requestSeq.current !== seq) return;

      const nextVideos = videosRes.data?.videos ?? [];
      const totalPages = videosRes.data?.pagination?.totalPages;

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
  }, [hasMore, loadingMore, page, pageSize, state]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: state !== "ready" || loadingMore,
    onLoadMore: loadMore,
  });

  const handleDeleteVideo = async (videoId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
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

  if (state === "loading" || state === "idle") {
    return (
      <div className="h-40 w-full grid place-items-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-center py-8 text-red-500">
        {error || "Failed to load videos"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-10">
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 h-40">
          <span className="text-text-amount">
            You don&apos;t have any videos
          </span>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => router.push("/upload")}
          >
            Upload Video
          </Button>
        </div>
      ) : (
        <div>
          <Button
            variant="secondary"
            className="rounded-md flex items-center gap-2 ml-auto px-4 py-2 mb-4"
            onClick={() => router.push("/upload")}
          >
            <FaUpload />
            Upload Video
          </Button>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {videos.map((v) => (
              <div key={v.id}>
                <MyVideoCard
                  video={v}
                  user={user}
                  onDelete={() => handleDeleteVideo(v.id)}
                />
              </div>
            ))}
            <div ref={sentinelRef} className="h-1 col-span-full" />
            {loadingMore ? (
              <div className="w-full grid place-items-center py-6 col-span-full">
                <Spinner className="size-8" />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
