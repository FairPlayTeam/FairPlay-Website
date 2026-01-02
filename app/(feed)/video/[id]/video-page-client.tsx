"use client";

import { useEffect, useState } from "react";
import {
  getVideo,
  getVideos,
  getVideoComments,
  VideoDetails,
  CommentItem,
} from "@/lib/video";
import { VideoPlayer } from "@/components/app/video/VideoPlayer";
import { VideoInfo } from "@/components/app/video/VideoInfo";
import { RelatedVideos } from "@/components/app/video/RelatedVideos";
import { Comments } from "@/components/app/video/Comments";
import Spinner from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast/toast-utils";

type VideoPageClientProps = {
  videoId: string;
};

export default function VideoPageClient({ videoId }: VideoPageClientProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [video, setVideo] = useState<VideoDetails | null>(null);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<VideoDetails[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [videoRes, relatedRes, commentsRes] = await Promise.all([
          getVideo(videoId),
          getVideos(),
          getVideoComments(videoId),
        ]);

        setVideo(videoRes.data);
        setRelatedVideos(relatedRes.data.videos);
        setComments(commentsRes.data.comments);
      } catch {
        toast.error("Failed to load video. Please try again later.");
        setError("Failed to load video. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-text">{error || "Video not found"}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:pt-4">
      <div className="lg:col-span-2 space-y-6 lg:px-2">
        <VideoPlayer
          url={video.hls.master || ""}
          thumbnailUrl={video.thumbnailUrl}
        />
        <div className="px-4 lg:px-0">
          <VideoInfo video={video} />
          <Comments videoId={video.id} initialComments={comments} />
        </div>
      </div>
      <div className="lg:col-span-1">
        <RelatedVideos videos={relatedVideos} currentVideoId={video.id} />
      </div>
    </div>
  );
}
