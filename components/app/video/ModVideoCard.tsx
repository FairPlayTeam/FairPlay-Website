"use client";

import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";

import { StatusBadges } from "@/components/app/video/StatusBadge";
import { VideoCard } from "@/components/app/video/VideoCard";
import { type ModVideoItem } from "@/lib/moderation";
import { cn } from "@/lib/utils";

type ModVideoCardProps = {
  video: ModVideoItem;
  user: ModVideoItem["user"];
  onDelete: (videoId: string) => void;
  onModerate: (videoId: string, action: "approve" | "reject") => void;
  isModerating?: boolean;
};

export function ModVideoCard({
  video,
  user,
  onDelete,
  onModerate,
  isModerating = false,
}: ModVideoCardProps) {
  const router = useRouter();

  const isProcessing = video.processingStatus !== "done";

  const createdAtLabel =
    "createdAt" in video
      ? new Date(video.createdAt as string | number).toLocaleDateString()
      : "";

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
          meta={createdAtLabel}
          variant="grid"
          onPress={
            isProcessing ? undefined : () => router.push(`/video/${video.id}`)
          }
          className="group"
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
                className="cursor-pointer rounded-full bg-background/80 p-2 text-white shadow hover:bg-red-600"
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
                  Processing...
                </span>
              </div>
            )
          }
          overlayBottomLeft={
            video.moderationStatus === "pending" && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onModerate(video.id, "approve");
                  }}
                  disabled={isModerating}
                  className={cn(
                    "cursor-pointer flex flex-1 items-center justify-center gap-1 rounded bg-green-600 py-1 px-2 text-white opacity-0 transition group-hover:opacity-75 hover:opacity-100",
                    isModerating && "cursor-not-allowed opacity-60"
                  )}
                >
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onModerate(video.id, "reject");
                  }}
                  disabled={isModerating}
                  className={cn(
                    "cursor-pointer flex flex-1 items-center justify-center gap-1 rounded bg-red-600 py-1 px-2 text-white opacity-0 transition group-hover:opacity-75 hover:opacity-100",
                    isModerating && "cursor-not-allowed opacity-60"
                  )}
                >
                  Reject
                </button>
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
