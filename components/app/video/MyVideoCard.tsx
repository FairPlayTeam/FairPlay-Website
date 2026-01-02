"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { VideoCard } from "./VideoCard";
import { StatusBadges } from "@/components/app/video/StatusBadge";
import { FaTrash } from "react-icons/fa";

import type { MyVideoItem } from "@/lib/users";
import type { User } from "@/types/schema";

type MyVideoCardProps = {
  video: MyVideoItem;
  user: User;
  onDelete: (videoId: string) => void;
};

export function MyVideoCard({ video, user, onDelete }: MyVideoCardProps) {
  const router = useRouter();

  const isProcessing = video.processingStatus !== "done";

  const createdAtLabel =
    "createdAt" in video
      ? new Date(video.createdAt as string | number).toLocaleDateString()
      : "";

  const meta = `${createdAtLabel} • ${video.viewCount} views`;

  return (
    <div
      className={cn(
        "relative",
        isProcessing ? "cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <div className={cn(isProcessing && "pointer-events-none")}>
        <VideoCard
          thumbnailUrl={video.thumbnailUrl}
          title={video.title}
          displayName={user.displayName || user.username}
          meta={meta}
          variant="grid"
          onPress={
            isProcessing ? undefined : () => router.push(`/video/${video.id}`)
          }
          overlayTopLeft={
            <StatusBadges
              visibility={video.visibility}
              moderationStatus={video.moderationStatus}
              processingStatus={video.processingStatus}
            />
          }
          overlayTopRight={
            !isProcessing && (
              <button
                type="button"
                className="cursor-pointer p-2 bg-background/80 hover:bg-red-600 text-white rounded-full shadow"
                aria-label="Delete video"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(video.id);
                }}
              >
                <FaTrash className="size-4" />
              </button>
            )
          }
          overlayCenter={
            isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                <span className="text-base font-semibold text-white">
                  Processing…
                </span>
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
