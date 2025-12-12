"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { VideoDetails } from "@/lib/video";

interface RelatedVideosProps {
  videos: VideoDetails[];
  currentVideoId: string;
}

export function RelatedVideos({ videos, currentVideoId }: RelatedVideosProps) {
  const filteredVideos = videos.filter((v) => v.id !== currentVideoId);

  return (
    <div className="space-y-4 mx-4">
      <h2 className="font-semibold text-2xl text-text">Related Videos</h2>
      <div className="flex flex-col gap-3">
        {filteredVideos.map((video) => (
          <Link
            key={video.id}
            href={`/video/${video.id}`}
            className="flex gap-2 group"
          >
            <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-secondary flex-shrink-0">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-xs text-gray-400">
                  No Thumb
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h4 className="font-semibold text-sm text-text line-clamp-2 group-hover:text-primary transition-colors">
                {video.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {video.user?.displayName || video.user?.username}
              </p>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{video.viewCount} views</span>
                {video.createdAt && (
                  <>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(video.createdAt))} ago
                    </span>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
