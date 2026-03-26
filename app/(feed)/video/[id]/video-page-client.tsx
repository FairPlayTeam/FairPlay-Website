"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getVideo, getVideos, VideoDetails } from "@/lib/video";
import { getVideoComments, CommentItem } from "@/lib/comments";
import { VideoPlayer } from "@/components/app/video/video-player";
import { VideoInfo } from "@/components/app/video/video-info";
import { RelatedVideos } from "@/components/app/video/related-videos";
import { Comments } from "@/components/app/video/comments";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useSidebar } from "@/context/sidebar-context";
import { cn } from "@/lib/utils";
import { usePreferenceStore } from "@/lib/stores/preference";
import { motion } from "framer-motion";

const RELATED_PAGE_SIZE = 10;

function mergeUniqueById(prev: VideoDetails[], next: VideoDetails[]) {
  if (next.length === 0) return prev;
  const seen = new Set(prev.map((item) => item.id));
  const merged = [...prev];

  for (const item of next) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  return merged;
}

export default function VideoPageClient({ videoId }: { videoId: string }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [video, setVideo] = useState<VideoDetails | null>(null);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<VideoDetails[]>([]);
  const [relatedPage, setRelatedPage] = useState(1);
  const [relatedHasMore, setRelatedHasMore] = useState(true);
  const [relatedLoadingMore, setRelatedLoadingMore] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const isTheatreMode = usePreferenceStore((s) => s.isTheatreMode);
  const setTheatreMode = usePreferenceStore((s) => s.setTheatreMode);
  const relatedSeqRef = useRef(0);

  const { close } = useSidebar();
  useEffect(() => {
    close();
  }, [close]);

  const toggleTheatreMode = useCallback(
    () => setTheatreMode(!isTheatreMode),
    [isTheatreMode, setTheatreMode],
  );

  useEffect(() => {
    if (!videoId) return;

    const seq = ++relatedSeqRef.current;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [videoRes, relatedRes, commentsRes] = await Promise.all([
          getVideo(videoId),
          getVideos(1, RELATED_PAGE_SIZE),
          getVideoComments(videoId),
        ]);

        if (relatedSeqRef.current !== seq) return;

        setVideo(videoRes.data);
        const initialRelated = (relatedRes.data.videos ?? []).filter((item) => item.id !== videoId);
        const totalPages = relatedRes.data.pagination?.totalPages;
        setRelatedVideos(initialRelated);
        setRelatedPage(1);
        setRelatedHasMore(
          typeof totalPages === "number"
            ? 1 < totalPages
            : initialRelated.length === RELATED_PAGE_SIZE,
        );
        setComments(commentsRes.data.comments);
      } catch {
        if (relatedSeqRef.current !== seq) return;
        toast.error("Failed to load video. Please try again later.");
        setError("Failed to load video. Please try again later.");
        setRelatedHasMore(false);
      } finally {
        if (relatedSeqRef.current !== seq) return;
        setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      relatedSeqRef.current += 1;
    };
  }, [videoId]);

  const loadMoreRelated = useCallback(async () => {
    if (relatedLoadingMore || !relatedHasMore) return;

    setRelatedLoadingMore(true);
    const seq = relatedSeqRef.current;
    const nextPage = relatedPage + 1;

    try {
      const relatedRes = await getVideos(nextPage, RELATED_PAGE_SIZE);
      if (relatedSeqRef.current !== seq) return;

      const nextRelated = (relatedRes.data.videos ?? []).filter((item) => item.id !== videoId);
      const totalPages = relatedRes.data.pagination?.totalPages;

      setRelatedVideos((prev) => mergeUniqueById(prev, nextRelated));
      setRelatedPage(nextPage);
      setRelatedHasMore(
        typeof totalPages === "number"
          ? nextPage < totalPages
          : nextRelated.length === RELATED_PAGE_SIZE,
      );
    } catch {
      if (relatedSeqRef.current !== seq) return;
      setRelatedHasMore(false);
    } finally {
      if (relatedSeqRef.current !== seq) return;
      setRelatedLoadingMore(false);
    }
  }, [relatedHasMore, relatedLoadingMore, relatedPage, videoId]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-18" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-muted-foreground">{error || "Video not found"}</p>
      </div>
    );
  }

  return (
    <div
      className={cn("relative isolate lg:pt-2", isTheatreMode ? "lg:px-6 xl:px-10" : "lg:px-16")}
    >
      <div className="relative z-10 grid grid-cols-1 gap-3 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
        <motion.div
          layout
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className={cn("relative z-0", isTheatreMode ? "lg:col-span-3" : "lg:col-span-2")}
        >
          <VideoPlayer
            url={video.hls.master || ""}
            thumbnailUrl={video.thumbnailUrl}
            isTheatreMode={isTheatreMode}
            onToggleTheatreMode={toggleTheatreMode}
          />
        </motion.div>

        <motion.div
          layout="position"
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className={cn(
            "relative z-10 hidden lg:block",
            isTheatreMode
              ? "lg:col-start-3 lg:row-start-2"
              : "lg:col-start-3 lg:row-span-2 lg:row-start-1",
          )}
        >
          <RelatedVideos
            videos={relatedVideos}
            hasMore={relatedHasMore}
            isLoadingMore={relatedLoadingMore}
            onLoadMore={loadMoreRelated}
          />
        </motion.div>

        <motion.div
          layout="position"
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="relative z-10 px-4 lg:col-span-2 lg:px-0"
        >
          <VideoInfo video={video} />
          <Comments
            videoId={video.id}
            initialComments={comments}
            allowComments={video.allowComments}
          />
        </motion.div>

        <motion.div
          layout="position"
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="relative z-10 px-4 lg:hidden"
        >
          <RelatedVideos
            videos={relatedVideos}
            hasMore={relatedHasMore}
            isLoadingMore={relatedLoadingMore}
            onLoadMore={loadMoreRelated}
          />
        </motion.div>
      </div>
    </div>
  );
}
