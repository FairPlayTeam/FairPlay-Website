"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { VideoCard } from "./VideoCard";
import { StatusBadges } from "@/components/video/StatusBadge";
import { FaTrash } from "react-icons/fa";

import { type ModVideoItem, updateModeration } from "@/lib/moderation";

type ModVideoCardProps = {
  video: ModVideoItem;
  user: ModVideoItem["user"];
  onDelete: (videoId: string) => void;
};

export function ModVideoCard({ video, user, onDelete }: ModVideoCardProps) {
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
        isProcessing
            ? "cursor-not-allowed"
            : "cursor-pointer"
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
                    isProcessing
                    ? undefined
                    : () => router.push(`/video/${video.id}`)
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

                overlayBottomLeft={
                    video.moderationStatus === "pending" && (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateModeration(video.id, "approve")
                                }}
                                className="flex-1 flex items-center justify-center gap-1 cursor-pointer bg-green-600 opacity-0 group-hover:opacity-75 hover:opacity-100 text-white py-1 px-2 rounded transition"
                            >
                                Approve
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateModeration(video.id, "reject")
                                }}
                                className="flex-1 flex items-center justify-center gap-1 cursor-pointer bg-red-600 opacity-0 group-hover:opacity-75 hover:opacity-100 text-white py-1 px-2 rounded transition"
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