"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { VideoDetails } from "@/lib/video";
import { VideoCard } from "@/components/video/VideoCard";

interface RelatedVideosProps {
  videos: VideoDetails[];
  currentVideoId: string;
}

export function RelatedVideos({ videos, currentVideoId }: RelatedVideosProps) {
  const router = useRouter();

  const filteredVideos = useMemo(
    () => videos.filter((v) => v.id !== currentVideoId),
    [videos, currentVideoId]
  );

  const handleVideoPress = (id: string) => {
    router.push(`/video/${id}`);
  };

  return (
    <div className="space-y-4 mx-4">
      <h2 className="font-semibold text-2xl text-text">Related Videos</h2>

      <div className="flex flex-col">
        {filteredVideos.map((video) => (
          <VideoCard
            key={video.id}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
            displayName={video.user?.displayName || video.user?.username}
            meta={`${video.viewCount} views • ${new Date(video.createdAt).toLocaleDateString()}`}
            onPress={() => handleVideoPress(video.id)}
            variant="list"
          />
        ))}
      </div>
    </div>
  );
}